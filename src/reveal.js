const clamp=value=>Math.max(0,Math.min(1,value));

export function installReveals({onHeroProgress=()=>{},onSafeProgress=()=>{}}={}) {
  const selectors=[
    '.hero .eyebrow','.hero h1','.hero-copy','.hero-actions',
    '.commercial-head .story-line-text','.commercial-head>p','.commercial-lines>div','.commercial-actions',
    '.science-heading .story-line-text','.science-heading>p',
    '.solutions .solution-tabs','.solutions .solution-preview','.solutions .technology-pulse',
    '.spatial-controls','.data-deliverables',
    '.analysis-sidebar','.technical-foundation',
    '.research-story .story-line-text','.research-story .chapter-lead','.research-story .chapter-copy','.research-story .case-facts','.research-image',
    '.inquiry-content','.team-member',
    '.collaboration-band','.footer-columns'
  ];
  const elements=[...document.querySelectorAll(selectors.join(','))];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const hero=document.querySelector('#home');
  const heroSequence=document.querySelector('.hero-sequence');
  const heroInner=hero.querySelector('.chapter-inner');
  const safeSection=document.querySelector('#perspective');
  const states=elements.map(element=>{
    element.dataset.reveal='';
    const siblings=element.matches('.commercial-lines>div,.team-member')?[...element.parentElement.children]:null;
    const line=element.matches('.story-line-text');
    const lineIndex=line?[...element.parentElement.parentElement.children].indexOf(element.parentElement):0;
    const prose=element.matches('.commercial-head>p,.science-heading>p,.research-story .chapter-lead,.research-story .chapter-copy,.research-story .case-facts');
    return {element,y:0,amplitude:line?42:24,delay:line?lineIndex*48:prose?115:siblings?siblings.indexOf(element)*38:0};
  });
  let frame=0;

  function render() {
    frame=0;
    const viewport=innerHeight;
    const enterDistance=Math.min(240,viewport*.28);
    const exitDistance=Math.min(150,viewport*.2);
    const motionOff=reduced.matches||document.body.dataset.motion==='paused';
    states.forEach(state=>{
      const rect=state.element.getBoundingClientRect();
      const appliedY=motionOff?0:state.y;
      const top=rect.top-appliedY;
      const bottom=rect.bottom-appliedY;
      const enter=clamp((viewport*.98-top-state.delay)/enterDistance);
      const exit=clamp((bottom+30)/exitDistance);
      const progress=Math.min(enter,exit);
      const eased=progress*progress*(3-2*progress);
      state.y=state.amplitude*(1-enter)-14*(1-exit);
      state.element.style.setProperty('--reveal-progress',eased.toFixed(3));
      state.element.style.setProperty('--reveal-y',`${state.y.toFixed(2)}px`);
      state.element.classList.toggle('is-visible',progress>.98);
    });
    const travel=heroSequence.offsetHeight-hero.offsetHeight;
    const depth=motionOff||travel<=0?0:clamp(-heroSequence.getBoundingClientRect().top/travel);
    const primaryExit=clamp((depth-.27)/.27);
    const observationEnter=clamp((depth-.57)/.15);
    const observationExit=clamp((depth-.91)/.09);
    const ease=value=>value*value*(3-2*value);
    hero.style.setProperty('--lens-progress',depth.toFixed(3));
    hero.style.setProperty('--lens-primary-opacity',(1-ease(primaryExit)).toFixed(3));
    hero.style.setProperty('--lens-observation-opacity',(ease(observationEnter)*(1-ease(observationExit))).toFixed(3));
    hero.style.setProperty('--lens-observation-y',`${(38*(1-ease(observationEnter))).toFixed(2)}px`);
    hero.dataset.lensPhase=depth<.42?'overview':'approach';
    heroInner.inert=depth>.68&&!motionOff;
    onHeroProgress(depth);
    if(!motionOff){
      const rect=safeSection.getBoundingClientRect();
      const safeProgress=clamp((viewport*.15-rect.top)/(rect.height-viewport*.1));
      onSafeProgress(safeProgress);
    }
    const fade=clamp((depth-.15)/.85);
    const smoothFade=fade*fade*(3-2*fade);
    const lineEnter=clamp(depth/.43);
    const smoothLine=lineEnter*lineEnter*(3-2*lineEnter);
    hero.style.setProperty('--hero-secondary-opacity',(1-.5*smoothFade).toFixed(3));
    hero.style.setProperty('--hero-copy-y',`${(-90*depth).toFixed(2)}px`);
    hero.style.setProperty('--hero-second-opacity',(.82+.18*smoothLine).toFixed(3));
    hero.style.setProperty('--hero-second-y',`${(16*(1-smoothLine)).toFixed(2)}px`);
    hero.style.setProperty('--hero-scene-x',`${(-innerWidth*.045*depth).toFixed(2)}px`);
    hero.style.setProperty('--hero-scene-scale',(1.035+.12*depth).toFixed(3));
    hero.style.setProperty('--hero-parallax',`${(depth*28).toFixed(2)}px`);
  }
  function schedule() {
    if(!frame)frame=requestAnimationFrame(render);
  }
  document.documentElement.classList.add('reveal-ready');
  render();
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  addEventListener('pageshow',schedule);
  addEventListener('motionchange',schedule);
  reduced.addEventListener('change',schedule);
  document.fonts.ready.then(schedule);
}
