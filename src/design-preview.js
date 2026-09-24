import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {createIcons,ArrowUpRight,ArrowDown,ArrowUp,Pause,Play,X,Download} from 'lucide';
import {createCellScene} from './scene.js';

gsap.registerPlugin(ScrollTrigger);
createIcons({icons:{ArrowUpRight,ArrowDown,ArrowUp,Pause,Play,X,Download}});
document.getElementById('preview-year').textContent=String(new Date().getFullYear());

const world=document.querySelector('.story-world');
const canvas=document.getElementById('story-canvas');
const header=document.getElementById('site-header');
const paper=document.getElementById('paper-phase');
const pauseButton=document.getElementById('motion-toggle');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const scene=createCellScene(canvas,{mode:1,hideNarrowScan:true});
const beats=[...document.querySelectorAll('.story-beat')];
let phase='hero';
let paused=false;

function setPhase(next){
  if(next===phase&&canvas.dataset.solution!==undefined)return;
  phase=next;
  world.dataset.phase=next;
  scene.setSolution(next==='spatial'?1:next==='ai'?2:0);
}

function syncPhase(){
  const focus=innerHeight*.52;
  const current=beats.find(beat=>{
    const rect=beat.getBoundingClientRect();
    return rect.top<=focus&&rect.bottom>focus;
  });
  if(current)setPhase(current.dataset.phase);
}

function syncMotion(){
  world.dataset.motion=reducedMotion.matches?'reduced':'full';
  scene.setPaused(paused||reducedMotion.matches);
}

function syncSurface(){
  const light=paper.getBoundingClientRect().top<=header.getBoundingClientRect().height+1;
  header.classList.toggle('is-light',light);
  world.classList.toggle('is-paper',light);
}

let surfaceFrame=0;
function scheduleSurfaceSync(){
  if(surfaceFrame)return;
  surfaceFrame=requestAnimationFrame(()=>{
    surfaceFrame=0;
    syncSurface();
    syncPhase();
  });
}

pauseButton.addEventListener('click',()=>{
  paused=!paused;
  pauseButton.setAttribute('aria-pressed',String(paused));
  pauseButton.title=paused?'继续三维动效':'暂停三维动效';
  syncMotion();
});
reducedMotion.addEventListener('change',syncMotion);

const contact=document.getElementById('contact-dialog');
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>contact.showModal()));
document.getElementById('research-detail-open').addEventListener('click',()=>document.getElementById('research-dialog').showModal());
document.getElementById('about-open').addEventListener('click',()=>document.getElementById('about-dialog').showModal());
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
}));
document.getElementById('contact-form').addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(event.currentTarget);
  const draft=`cartabio | 咨询项目草稿\n\n姓名: ${data.get('name')}\n邮箱: ${data.get('email')}\n\n研究问题或合作方向:\n${data.get('message')}\n\n此文件在本地生成，尚未发送。\n`;
  const url=URL.createObjectURL(new Blob([draft],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');
  link.href=url;
  link.download='cartabio-conversation.txt';
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  document.getElementById('form-status').textContent='咨询项目草稿已生成，尚未发送。';
});

scene.setActive(true);
scene.setStoryProgress(.2);
setPhase('hero');
syncMotion();

ScrollTrigger.create({
  trigger:world,
  start:'top top',
  end:'bottom bottom',
  onUpdate:syncPhase,
  onEnter:syncPhase,
  onEnterBack:syncPhase,
});
ScrollTrigger.create({
  trigger:document.getElementById('technology'),
  start:'top bottom',
  end:'bottom top',
  onUpdate:self=>scene.setStoryProgress(.12+self.progress*.82),
});
ScrollTrigger.create({
  trigger:paper,
  start:'top 82px',
  onEnter:syncSurface,
  onLeaveBack:()=>{syncSurface();syncPhase();},
});

document.fonts.ready.then(()=>{
  if(!reducedMotion.matches){
    beats.slice(1).forEach(beat=>{
      const lines=[...beat.querySelectorAll('.story-line-inner')];
      gsap.fromTo(lines,{yPercent:105,opacity:0},{
        yPercent:0,opacity:1,stagger:.11,ease:'none',
        scrollTrigger:{trigger:beat,start:'top 82%',end:'top 39%',scrub:.45},
      });
      const copy=beat.querySelector('.beat-copy');
      if(copy)gsap.fromTo(copy,{y:23,opacity:0},{
        y:0,opacity:1,ease:'none',
        scrollTrigger:{trigger:beat,start:'top 72%',end:'top 33%',scrub:.45},
      });
    });
    document.querySelectorAll('.evidence-opening h2,.evidence-opening p,.archive-figure,.evidence-record,.people-opening h2,.people-opening p,.person,.invitation h2,.invitation p,.invitation .action').forEach((element,index)=>{
      element.dataset.reveal='';
      gsap.fromTo(element,{y:index%3===0?36:22,opacity:element.matches('.person')?1:0},{
        y:0,opacity:1,ease:'none',
        scrollTrigger:{trigger:element,start:'top 93%',end:'top 75%',scrub:.4},
      });
    });
  }
  ScrollTrigger.refresh();
  syncPhase();
  syncSurface();
});

addEventListener('pageshow',()=>{ScrollTrigger.refresh();syncPhase();syncSurface();});
addEventListener('scroll',scheduleSurfaceSync,{passive:true});
addEventListener('hashchange',scheduleSurfaceSync);
addEventListener('popstate',scheduleSurfaceSync);
