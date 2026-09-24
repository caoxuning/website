import {gsap} from 'gsap';
import {Observer} from 'gsap/Observer';
import {createScrollGesture,scrollFrame,SCROLL_IDLE} from './gesture.js';

gsap.registerPlugin(Observer);
const names=['CARTABIO','SOLUTIONS','SERVICE & DELIVERABLES','SAFE & AI FOUNDATION','RESEARCH ARCHIVE','TEAM & COLLABORATION'];

export function createDeck({onChange}) {
  const panels=[...document.querySelectorAll('main [data-panel]')];
  const copy=panels.map(panel=>[...panel.querySelectorAll('.chapter-inner,.hero-actions,.section-top,.science-heading,.solution-tabs,.solution-scene-caption,.solution-grid,.technology-pulse,.spatial-controls,.data-deliverables,.analysis-sidebar,.technical-foundation,.analysis-next,.research-content,.research-bottom,.inquiry-content,.team-grid,.archive-note,.collaboration-band,.site-footer,.specimen-label,.visual-caption,.hero-bottom')]);
  const rail=[...document.querySelectorAll('.deck-rail a')];
  rail.forEach(link=>{link.title=link.getAttribute('aria-label');});
  const media=matchMedia('(min-width: 900px) and (min-height: 700px) and (pointer: fine)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const gesture=createScrollGesture();
  let index=0,enabled=false,paused=reduced.matches,configured=false;
  let nativeObserver,tween=null,releaseTimer=null,transition=null;
  const finalPanel=panels.at(-1);
  let finalTopAt=0;
  let phase='idle';
  const indexForHash=()=>location.hash==='#team-title'?panels.length-1:Math.max(0,panels.findIndex(panel=>'#'+panel.id===location.hash));
  const isFinalPanel=()=>index===panels.length-1;
  const finalMaxScroll=()=>Math.max(0,finalPanel.scrollHeight-finalPanel.clientHeight);
  const finalCanScroll=delta=>isFinalPanel()&&finalMaxScroll()>1&&(delta>0?finalPanel.scrollTop<finalMaxScroll()-1:finalPanel.scrollTop>1);

  finalPanel.addEventListener('scroll',()=>{
    if(finalPanel.scrollTop<=1)finalTopAt=performance.now();
    else {finalTopAt=0;gesture.reset();}
  },{passive:true});

  function setPhase(value){
    phase=value;
    document.body.dataset.transitionPhase=value;
    document.body.dataset.transitioning=String(value!=='idle');
  }
  function announce(next,options){
    index=next;
    document.body.dataset.tone=panels[next].dataset.tone;
    document.body.dataset.activePanel=String(next);
    document.querySelector('#chapter-name').textContent=names[next];
    document.querySelector('#chapter-count').textContent=String(next+1).padStart(2,'0')+' / '+String(panels.length).padStart(2,'0');
    rail.forEach((link,i)=>{if(i===next)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
    onChange(next,options);
  }
  function stop(){
    clearTimeout(releaseTimer);releaseTimer=null;
    tween?.kill();tween=null;
  }
  function settle(next,focus=false){
    stop();transition=null;
    panels.forEach((panel,i)=>{
      panel.inert=i!==next;
      panel.setAttribute('aria-hidden',String(i!==next));
      gsap.set(panel,{autoAlpha:i===next?1:0,yPercent:0});
      gsap.set(copy[i],{clearProps:'opacity'});
    });
    document.body.dataset.scrollProgress='0';
    document.body.style.setProperty('--scroll-progress','0');
    setPhase('idle');onChange(next);
    if(focus)panels[next].focus({preventScroll:true});
  }
  function paint(){
    if(!transition)return;
    const {from,to,direction,state}=transition;
    const frame=scrollFrame(state.p);
    gsap.set(panels[from],{autoAlpha:frame.outOpacity,yPercent:direction*frame.outY});
    gsap.set(panels[to],{autoAlpha:frame.inOpacity,yPercent:direction*frame.inY});
    const outgoingCopy=Math.max(0,Math.min(1,(state.p-.2)/.4));
    gsap.set(copy[from],{opacity:1-outgoingCopy*outgoingCopy*(3-2*outgoingCopy)});
    const copyProgress=Math.max(0,Math.min(1,(state.p-.6)/.4));
    gsap.set(copy[to],{opacity:copyProgress*copyProgress*(3-2*copyProgress)});
    document.body.dataset.scrollProgress=state.p.toFixed(4);
    document.body.style.setProperty('--scroll-progress',String(state.p));
    const visible=frame.outOpacity>0&&frame.inOpacity>0?[from,to]:frame.outOpacity>0?[from]:[to];
    const key=visible.join(':');
    if(transition.visible!==key){transition.visible=key;onChange(visible[0],{outgoing:visible[1]??null});}
  }
  function prepare(next){
    stop();
    if(transition)settle(index);
    transition={from:index,to:next,direction:Math.sign(next-index),state:{p:0},visible:null};
    panels.forEach((panel,i)=>{panel.inert=i!==index;panel.setAttribute('aria-hidden',String(i!==index));});
    paint();
  }
  function finish({history=true,focus=false}={}){
    stop();
    const {from,to,state}=transition;
    const moveFocus=focus||panels[from].contains(document.activeElement);
    announce(to,{outgoing:from});
    panels.forEach((panel,i)=>{panel.inert=i!==to;panel.setAttribute('aria-hidden',String(i!==to));});
    if(history)window.history.pushState(null,'','#'+panels[to].id);
    if(paused||reduced.matches){settle(to,moveFocus);return;}
    setPhase('settling');
    tween=gsap.to(state,{p:1,duration:Math.max(.42,.9*(1-state.p)),ease:'power2.out',onUpdate:paint,onComplete:()=>settle(to,moveFocus)});
  }
  function rollback(){
    if(!transition)return;
    stop();gesture.reset();
    setPhase('returning');
    tween=gsap.to(transition.state,{p:0,duration:.46,ease:'power3.out',onUpdate:paint,onComplete:()=>settle(index)});
  }
  function go(next,{history=true,focus=false}={}){
    next=Math.max(0,Math.min(panels.length-1,next));
    if(!enabled){panels[next].scrollIntoView({behavior:paused||reduced.matches?'instant':'smooth'});return;}
    if(next===index&&phase==='settling')return;
    if(transition)settle(index);
    if(next===index)return;
    if(next===panels.length-1){finalPanel.scrollTop=0;finalTopAt=performance.now();}
    prepare(next);finish({history,focus});
  }
  function wheel(delta){
    if(!Number.isFinite(delta)||Math.abs(delta)<.01)return;
    const now=performance.now();
    if(phase==='settling'){gesture.suppress(now);return;}
    if(phase==='returning'&&transition){gesture.seed(transition.direction*transition.state.p,now);stop();}
    const result=gesture.push(delta,now);
    if(result.blocked)return;
    clearTimeout(releaseTimer);
    const next=index+result.direction;
    if(next<0||next>=panels.length||result.direction===0){if(transition)settle(index);gesture.reset();return;}
    if(paused||reduced.matches){if(result.commit)go(next);return;}
    if(!transition||transition.to!==next)prepare(next);
    setPhase('dragging');
    if(result.commit){finish();return;}
    tween?.kill();
    tween=gsap.to(transition.state,{p:result.progress,duration:.14,ease:'power2.out',onUpdate:paint});
    releaseTimer=setTimeout(rollback,SCROLL_IDLE);
  }
  const input=Observer.create({
    target:window,type:'wheel',preventDefault:true,debounce:false,
    ignoreCheck:event=>{
      if(!!document.querySelector('dialog[open]')||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return true;
      if(!enabled||!isFinalPanel())return false;
      if(finalCanScroll(event.deltaY))return true;
      return event.deltaY<0&&finalPanel.scrollTop<=1&&performance.now()-finalTopAt<SCROLL_IDLE;
    },
    onChangeY:self=>wheel(self.deltaY),
  });
  input.disable();

  function configure(){
    const wasEnabled=enabled;
    enabled=media.matches;
    stop();transition=null;gesture.reset();setPhase('idle');
    document.body.dataset.scrollProgress='0';
    document.body.style.setProperty('--scroll-progress','0');
    document.body.classList.toggle('deck-mode',enabled);
    nativeObserver?.disconnect();
    panels.forEach((panel,i)=>{
      panel.inert=false;panel.removeAttribute('aria-hidden');
      gsap.set(panel,{clearProps:'opacity,visibility,transform'});
      gsap.set(copy[i],{clearProps:'opacity'});
    });
    if(enabled){
      window.scrollTo({top:0,behavior:'instant'});
      index=location.hash==='#team-title'?panels.length-1:(configured?index:indexForHash());
      if(index===panels.length-1){finalPanel.scrollTop=0;finalTopAt=performance.now();}
      settle(index);announce(index);input.enable();
    }else{
      input.disable();
      nativeObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{if(entry.isIntersecting)announce(panels.indexOf(entry.target));});
      },{rootMargin:'-30% 0px -45% 0px',threshold:0});
      panels.forEach(panel=>nativeObserver.observe(panel));
      if(wasEnabled)panels[index].scrollIntoView({behavior:'instant'});
    }
    window.dispatchEvent(new Event('scene-resize'));
    configured=true;
  }
  document.addEventListener('click',event=>{
    if(enabled&&document.querySelector('dialog[open]')){if(transition)settle(index);gesture.reset();return;}
    const link=event.target.closest('a[href^="#"]');
    if(!link||!enabled)return;
    if(link.matches('[data-scroll-team]')){
      event.preventDefault();gesture.reset();
      if(!isFinalPanel())go(panels.length-1,{focus:event.detail===0});
      finalPanel.scrollTo({top:0,behavior:paused||reduced.matches?'instant':'smooth'});
      finalTopAt=performance.now();
      return;
    }
    const next=panels.findIndex(panel=>'#'+panel.id===link.getAttribute('href'));
    if(next<0)return;
    event.preventDefault();gesture.reset();go(next,{focus:event.detail===0});
  });
  addEventListener('keydown',event=>{
    if(!enabled||document.querySelector('dialog[open]')||event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.target.closest('input,textarea,select,[role=tab],[contenteditable=true],video'))return;
    if(event.key===' '&&event.target.closest('button,a'))return;
    const finalScroll=finalMaxScroll();
    if(isFinalPanel()&&finalScroll>1){
      const scrollKeys={ArrowDown:72,PageDown:Math.round(innerHeight*.8),' ':Math.round(innerHeight*.8),ArrowUp:-72,PageUp:-Math.round(innerHeight*.8)};
      if(event.key==='Home'&&finalPanel.scrollTop>1){event.preventDefault();finalPanel.scrollTo({top:0,behavior:paused||reduced.matches?'instant':'smooth'});return;}
      if(event.key==='End'){event.preventDefault();finalPanel.scrollTo({top:finalScroll,behavior:paused||reduced.matches?'instant':'smooth'});return;}
      const amount=scrollKeys[event.key];
      if(amount!==undefined&&((amount>0&&finalPanel.scrollTop<finalScroll-1)||(amount<0&&finalPanel.scrollTop>1))){
        event.preventDefault();finalPanel.scrollBy({top:amount,behavior:paused||reduced.matches?'instant':'smooth'});return;
      }
    }
    const next={ArrowDown:index+1,PageDown:index+1,ArrowUp:index-1,PageUp:index-1,Home:0,End:panels.length-1,' ':index+(event.shiftKey?-1:1)}[event.key];
    if(next===undefined)return;
    event.preventDefault();if(phase!=='settling'){gesture.reset();go(next,{focus:true});}
  });
  addEventListener('popstate',()=>{gesture.reset();go(indexForHash(),{history:false});});
  addEventListener('hashchange',()=>{if(enabled){gesture.reset();go(indexForHash(),{history:false});}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&enabled){if(transition)settle(index);gesture.reset();}});
  media.addEventListener('change',configure);
  configure();
  return {setPaused(value){paused=value;if(value&&enabled){if(transition)settle(index);gesture.reset();}},get index(){return index;}};
}
