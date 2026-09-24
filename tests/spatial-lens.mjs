import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {PNG} from 'pngjs';

const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-webgl','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
await mkdir('test-results/spatial-lens',{recursive:true});

async function settle(){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function heroAt(fraction){
  return page.evaluate(async value=>{
    const sequence=document.querySelector('.hero-sequence');
    const travel=sequence.offsetHeight-innerHeight;
    scrollTo({top:sequence.offsetTop+travel*value,behavior:'instant'});
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const hero=document.querySelector('#home');
    return {progress:Number(hero.style.getPropertyValue('--lens-progress')),phase:hero.dataset.lensPhase};
  },fraction);
}

try{
  await page.goto('http://127.0.0.1:5188/#home',{waitUntil:'domcontentloaded'});
  await page.locator('.hero .scene-sticky.is-ready').waitFor();
  assert.equal(await page.locator('#cell-scene').evaluate(el=>getComputedStyle(el).opacity),'1','hero canvas is visible as soon as the first frame is ready');
  await page.waitForLoadState('networkidle');
  const start=await heroAt(0);
  const middle=await heroAt(.68);
  assert.ok(start.progress<.05&&middle.progress>.55,'hero scene and copy follow scroll position');
  assert.equal(start.phase,'overview');
  assert.equal(middle.phase,'approach');
  await heroAt(.52);
  const textHandoff=await page.locator('#home').evaluate(el=>({primary:Number(el.style.getPropertyValue('--lens-primary-opacity')),observation:Number(el.style.getPropertyValue('--lens-observation-opacity'))}));
  assert.ok(textHandoff.primary<.1||textHandoff.observation<.1,'hero statements do not overlap during the handoff');
  const returned=await heroAt(0);
  assert.equal(returned.phase,'overview','hero approach reverses on upward scroll');

  const commercial=page.locator('.commercial-intro');
  assert.equal(await commercial.locator('.commercial-lines>div').count(),3);
  assert.equal(await commercial.locator('h2').textContent().then(value=>value.includes('从样本出发')),true);

  const safe=page.locator('.solution-preview');
  assert.equal(await safe.locator('[data-cycle-step]').count(),4,'SAFE sequence exposes all four stages');
  await page.locator('#perspective').evaluate(async el=>{
    scrollTo({top:el.offsetTop+el.offsetHeight*.31,behavior:'instant'});
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });
  const firstPhase=await safe.getAttribute('data-safe-phase');
  await page.locator('#perspective').evaluate(async el=>{
    scrollTo({top:el.offsetTop+el.offsetHeight*.74,behavior:'instant'});
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });
  const laterPhase=await safe.getAttribute('data-safe-phase');
  assert.notEqual(firstPhase,laterPhase,'SAFE cycle is linked to reading progress');
  await page.locator('#perspective').evaluate(async el=>{
    scrollTo({top:el.offsetTop+el.offsetHeight*.31,behavior:'instant'});
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });
  assert.equal(await safe.getAttribute('data-safe-phase'),firstPhase,'SAFE cycle reverses with scroll');

  await page.locator('#motion-toggle').click();
  const pausedPhase=await safe.getAttribute('data-safe-phase');
  await page.locator('#perspective').evaluate(async el=>{
    scrollTo({top:el.offsetTop+el.offsetHeight*.74,behavior:'instant'});
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });
  assert.equal(await safe.getAttribute('data-safe-phase'),pausedPhase,'pause freezes the SAFE story');
  await page.locator('#motion-toggle').click();
  await heroAt(.68);
  await page.screenshot({path:'test-results/spatial-lens/hero-approach-1440.png'});
  await heroAt(0);
  await page.setViewportSize({width:390,height:844});
  await settle();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile has no horizontal overflow');
  for(const [width,height] of [[1920,1080],[1440,900],[1024,768],[390,844]]){
    await page.setViewportSize({width,height});
    await page.locator('#home').evaluate(async()=>{
      scrollTo({top:0,behavior:'instant'});
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    });
    await page.screenshot({path:`test-results/spatial-lens/hero-${width}.png`});
    await page.locator('.commercial-intro').evaluate(el=>scrollTo({top:el.offsetTop-innerHeight*.08,behavior:'instant'}));
    await settle();
    await page.screenshot({path:`test-results/spatial-lens/commercial-${width}.png`});
    await page.locator('#perspective').evaluate(el=>scrollTo({top:el.offsetTop-90,behavior:'instant'}));
    await settle();
    await page.screenshot({path:`test-results/spatial-lens/solutions-${width}.png`});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}px: no horizontal overflow`);
    const canvas=page.locator('#network-scene');
    const pixels=PNG.sync.read(await canvas.screenshot());
    const unique=new Set();
    for(let i=0;i<pixels.data.length;i+=160){unique.add(`${pixels.data[i]}:${pixels.data[i+1]}:${pixels.data[i+2]}`);}
    assert.ok(unique.size>10,`${width}px: SAFE canvas has visible pixels`);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: spatial lens hero and SAFE progress are reversible, pausable, and responsive');
}finally{await browser.close();}
