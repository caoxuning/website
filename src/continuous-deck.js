const names=['CARTABIO','SOLUTIONS','SERVICE & DELIVERABLES','SAFE & AI FOUNDATION','RESEARCH ARCHIVE','TEAM & COLLABORATION'];

export function createDeck({onChange}) {
  const panels=[...document.querySelectorAll('main [data-panel]')];
  const rail=[...document.querySelectorAll('.deck-rail a')];
  let index=-1;
  let queued=false;

  function update() {
    queued=false;
    const viewportPoint=innerHeight*.42;
    let next=0;
    for(let i=0;i<panels.length;i++) {
      if(panels[i].getBoundingClientRect().top<=viewportPoint)next=i;
    }
    if(next===index)return;
    index=next;
    document.body.dataset.tone=panels[next].dataset.tone;
    document.body.dataset.activePanel=String(next);
    document.querySelector('#chapter-name').textContent=names[next];
    document.querySelector('#chapter-count').textContent=`${String(next+1).padStart(2,'0')} / ${String(panels.length).padStart(2,'0')}`;
    rail.forEach((link,i)=>{
      if(i===next)link.setAttribute('aria-current','step');
      else link.removeAttribute('aria-current');
    });
    onChange(next);
  }
  function schedule() {
    if(queued)return;
    queued=true;
    requestAnimationFrame(update);
  }
  document.body.classList.add('continuous-mode');
  document.body.dataset.transitionPhase='idle';
  document.body.dataset.transitioning='false';
  document.querySelectorAll('a[href="#home"]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();
    if(location.hash!=='#home')history.pushState(null,'','#home');
    scrollTo({top:0,behavior:'instant'});
    panels[0].focus({preventScroll:true});
    schedule();
  }));
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',()=>{schedule();dispatchEvent(new Event('scene-resize'));},{passive:true});
  addEventListener('hashchange',schedule);
  addEventListener('popstate',()=>{if(location.hash==='#home')scrollTo({top:0,behavior:'instant'});schedule();});
  schedule();
  return {setPaused(){},get index(){return index;}};
}
