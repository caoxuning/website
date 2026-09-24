import './experience.css';
import './business-refinement.css';
import './interactions.css';
import './continuous.css';
import './spatial-lens.css';
import {createIcons, ArrowUpRight, ArrowDown, ArrowRight,Layers,ScanLine,MapPin,Check,Pause, Play, X, Download} from 'lucide';
import {createCellScene} from './scene.js';
import {createDeck} from './continuous-deck.js';
import {installReveals} from './reveal.js';
import {gsap} from 'gsap';
import {createFeatureView} from './feature-view.js';

const icons={ArrowUpRight,ArrowDown,ArrowRight,Layers,ScanLine,MapPin,Check,Pause,Play,X,Download};
document.fonts.load('500 108px Manrope').then(()=>document.documentElement.classList.add('fonts-ready'));
const refreshIcons=()=>createIcons({icons});
refreshIcons();
const scene=createCellScene(document.querySelector('#cell-scene'));
const cycleSteps=[...document.querySelectorAll('[data-cycle-step]')];
const cycleNames=['LABEL','IMAGE','REMOVE SIGNAL','NEXT ROUND'];
const cycleCopy=[['标记目标，显现信号。','针对本轮目标进行染色，为后续成像获取荧光读出。'],['采集图像，保留读出。','在同一组织区域记录本轮信号，保留图像与样本的对应关系。'],['移除信号，准备下一轮。','移除本轮荧光信号，为下一轮读出准备样本。'],['新的标志物，同一样本。','在同一区域继续下一轮染色，逐步累积多重标志物信息。']];
let cycleState='';
const network=createCellScene(document.querySelector('#network-scene'),{mode:1,onCycle({step,round}){
  const next=`${round}:${step}`;
  if(next===cycleState)return;
  cycleState=next;
  cycleSteps.forEach((el,i)=>{el.classList.toggle('is-current',i===step);if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  document.querySelector('.solution-preview').dataset.safePhase=String(step);
  document.querySelector('#cycle-round').textContent=`ROUND 0${round+1} / ${cycleNames[step]}`;
  document.querySelector('#cycle-title').textContent=cycleCopy[step][0];
  document.querySelector('#cycle-description').textContent=cycleCopy[step][1];
}});
network.setStoryProgress(.35);
const atlas=createCellScene(document.querySelector('#atlas-scene'),{mode:2});
const spatialCopy=['从研究问题、现有材料与协作方式开始，整理可继续讨论的项目范围。','共同确认研究问题、分析路径和资料边界，形成项目方案草案。','围绕确认后的研究路径组织实验与分析工作，保留资料与问题的对应关系。'];
document.querySelectorAll('[data-spatial-stage]').forEach(button=>button.addEventListener('click',()=>{
  const stage=Number(button.dataset.spatialStage);
  document.querySelectorAll('[data-spatial-stage]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
  document.querySelector('#spatial-description').textContent=spatialCopy[stage];atlas.setSpatialStage(stage);
}));
const analysis=createCellScene(document.querySelector('#analysis-scene'),{mode:3});
const featureView=createFeatureView(document.querySelector('#feature-view'));
const visuals=[scene,network,atlas,analysis];
installReveals({onHeroProgress:progress=>scene.setStoryProgress(progress),onSafeProgress:progress=>network.setStoryProgress(progress)});
const deck=createDeck({onChange(index,{outgoing=null}={}){
  visuals.forEach((visual,i)=>visual.setActive(i===index||i===outgoing));
}});
const motionButton=document.querySelector('#motion-toggle');
let paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
function setMotion(){
  visuals.forEach(visual=>visual.setPaused(paused));
  deck.setPaused(paused);
  document.body.dataset.motion=paused?'paused':'running';
  dispatchEvent(new Event('motionchange'));
  if(paused){gsap.killTweensOf('.analysis-output,.solution-grid article');gsap.set('.analysis-output,.solution-grid article',{opacity:1,y:0});}
  motionButton.setAttribute('aria-pressed',String(paused));
  const label=paused?'播放页面动画':'暂停页面动画';
  motionButton.setAttribute('aria-label',label);motionButton.title=label;
  motionButton.innerHTML=`<i data-lucide="${paused?'play':'pause'}"></i>`;refreshIcons();
}
setMotion();
motionButton.addEventListener('click',()=>{paused=!paused;setMotion();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{paused=event.matches;setMotion();});

const views={
  observe:{title:'细胞特征，回到原始图像。',copy:'关联标志物信号、细胞形态与位置，组织成细胞级特征表，让每一项观察都能回溯到样本。',input:'配准图像 · 细胞轮廓',output:'细胞级特征表 · 图像索引',label:'ROI 01 / CELL FEATURES',source:'分析方向示意，非已验证的平台输出。'},
  connect:{title:'空间邻域，保留位置关系。',copy:'把选区中的细胞放回相邻环境，比较空间分布与邻近关系，为后续研究提出可检验的问题。',input:'细胞坐标 · 标志物特征',output:'邻近关系 · 空间分布视图',label:'ROI 02 / NEIGHBORHOOD',source:'分析方向示意；空间邻近不等于已证实的细胞通讯。'},
  explore:{title:'组织区域，连接局部与整体。',copy:'以同一组织为参照，比较不同区域的细胞组成与特征差异，形成可回溯的候选研究线索。',input:'区域标注 · 细胞级特征',output:'区域比较 · 待验证研究线索',label:'ROI 03 / TISSUE REGION',source:'分析方向示意；生物学解释需独立证据与实验验证。'},
};
const tabs=[...document.querySelectorAll('.perspective-tabs [role=tab]')];
function selectView(tab){
  const key=tab.dataset.view,view=views[key];
  tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;});
  const panel=document.querySelector('#perspective-panel');panel.setAttribute('aria-labelledby',tab.id);
  document.querySelector('#panel-title').textContent=view.title;
  document.querySelector('#panel-copy').textContent=view.copy;
  document.querySelector('#panel-source').textContent=view.source;
  document.querySelector('#analysis-region').textContent=view.label;
  document.querySelector('#panel-counter').textContent=`OUTPUT / 0${tabs.indexOf(tab)+1}`;
  document.querySelector('#feature-input').textContent=view.input;
  document.querySelector('#feature-output').textContent=view.output;
  analysis.setRegion(tabs.indexOf(tab));
  featureView.select(tabs.indexOf(tab));
  gsap.killTweensOf('.analysis-output');
  if(!paused)gsap.fromTo('.analysis-output',{opacity:.45},{opacity:1,duration:.25,ease:'power2.out'});
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectView(tab));
  tab.addEventListener('keydown',event=>{
    let next;
    if(['ArrowDown','ArrowRight'].includes(event.key))next=(index+1)%tabs.length;
    if(['ArrowUp','ArrowLeft'].includes(event.key))next=(index+tabs.length-1)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    if(next!==undefined){event.preventDefault();selectView(tabs[next]);tabs[next].focus();}
  });
});
const solutionTabs=[...document.querySelectorAll('[data-solution]')];
function selectSolution(tab){
  const selected=Number(tab.dataset.solution);
  solutionTabs.forEach(button=>{
    const current=button===tab;
    button.setAttribute('aria-selected',String(current));button.tabIndex=current?0:-1;
    document.getElementById(button.getAttribute('aria-controls')).hidden=!current;
  });
  network.setSolution(selected);
  document.querySelector('#solution-layer').textContent=['MULTIPLEX / SIGNAL','SPATIAL / CONTOURS','AI RESEARCH / REGION'][selected];
  const panel=document.getElementById(tab.getAttribute('aria-controls'));
  gsap.killTweensOf('.solution-grid article');
  gsap.set('.solution-grid article',{clearProps:'opacity,transform'});
  if(!paused)gsap.fromTo(panel,{opacity:0,y:8},{opacity:1,y:0,duration:.3,ease:'power2.out'});
}
solutionTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectSolution(tab));
  tab.addEventListener('keydown',event=>{
    let next;
    if(['ArrowDown','ArrowRight'].includes(event.key))next=(index+1)%solutionTabs.length;
    if(['ArrowUp','ArrowLeft'].includes(event.key))next=(index+solutionTabs.length-1)%solutionTabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=solutionTabs.length-1;
    if(next!==undefined){event.preventDefault();selectSolution(solutionTabs[next]);solutionTabs[next].focus();}
  });
});
const spotlightTargets=[...document.querySelectorAll('.primary-link,[data-contact]')];
if(matchMedia('(hover: hover) and (pointer: fine)').matches){
  spotlightTargets.forEach(target=>{
    target.classList.add('pointer-spotlight');
    target.addEventListener('pointermove',event=>{
      const rect=target.getBoundingClientRect();
      target.style.setProperty('--spot-x',`${event.clientX-rect.left}px`);
      target.style.setProperty('--spot-y',`${event.clientY-rect.top}px`);
    },{passive:true});
    target.addEventListener('pointerdown',event=>{
      if(paused)return;
      const rect=target.getBoundingClientRect();
      target.style.setProperty('--spot-x',`${event.clientX-rect.left}px`);
      target.style.setProperty('--spot-y',`${event.clientY-rect.top}px`);
      target.classList.remove('spotlight-pressed');
      void target.offsetWidth;
      target.classList.add('spotlight-pressed');
    });
    target.addEventListener('animationend',()=>target.classList.remove('spotlight-pressed'));
  });
}
const contact=document.querySelector('#contact-dialog');
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>contact.showModal()));
document.querySelector('#about-open').addEventListener('click',()=>document.querySelector('#about-dialog').showModal());
document.querySelector('#research-detail-open').addEventListener('click',()=>document.querySelector('#research-dialog').showModal());
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
}));
document.querySelector('#contact-form').addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(event.currentTarget);
  const draft=`cartabio | 咨询项目草稿\n\n姓名: ${data.get('name')}\n邮箱: ${data.get('email')}\n\n研究问题或合作方向:\n${data.get('message')}\n\n此文件在本地生成，尚未发送。\n`;
  const url=URL.createObjectURL(new Blob([draft],{type:'text/plain;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='cartabio-conversation.txt';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  document.querySelector('#form-status').textContent='咨询项目草稿已生成，尚未发送。';
});
document.querySelector('#year').textContent=new Date().getFullYear();
