import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';

const browser=await chromium.launch({
  headless:true,
  executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  args:['--enable-webgl','--use-angle=d3d11']
});
const page=await browser.newPage({viewport:{width:1440,height:900}});
await mkdir('test-results/hero-scroll',{recursive:true});
await page.goto('http://127.0.0.1:5188/#home',{waitUntil:'networkidle'});

async function capture(label){
  const state=await page.evaluate(()=>{
    const rect=selector=>{
      const el=document.querySelector(selector);
      const box=el.getBoundingClientRect();
      return {top:Math.round(box.top),bottom:Math.round(box.bottom),height:Math.round(box.height),opacity:getComputedStyle(el).opacity};
    };
    return {scrollY:Math.round(scrollY),hero:rect('#home'),canvas:rect('#cell-scene'),copy:rect('.hero .chapter-inner'),intro:rect('#commercial-intro')};
  });
  await page.screenshot({path:`test-results/hero-scroll/${label}.png`});
  console.log(label,JSON.stringify(state));
  return state;
}

try{
  const initial=await capture('0-initial');
  assert.equal(initial.hero.top,0);
  const initialSecondLine=await page.locator('.hero h2 .story-line:last-child .story-line-text').evaluate(el=>Number(getComputedStyle(el).opacity));
  await page.mouse.wheel(0,150);
  await page.waitForTimeout(220);
  const first=await capture('1-first-pass');
  assert.equal(first.hero.top,0,'the first scroll keeps the hero in view');
  assert.ok(initial.intro.top<900,'the next section is hinted in the first viewport');
  assert.ok(first.intro.top<initial.intro.top,'the commercial section moves over the pinned hero');
  assert.ok(Number(first.copy.opacity)>.8,'the brand and headline remain readable');
  assert.ok(first.copy.top<initial.copy.top-24,'the hero typography moves with the first scroll');
  const progressedSecondLine=await page.locator('.hero h2 .story-line:last-child .story-line-text').evaluate(el=>Number(getComputedStyle(el).opacity));
  assert.ok(initialSecondLine<progressedSecondLine&&progressedSecondLine>.95,'the second hero line resolves with the first scroll');
  for(let i=2;i<=6;i++){
    await page.mouse.wheel(0,150);
    await page.waitForTimeout(220);
    await capture(`${i}-first-pass`);
  }
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(250);
  const returned=await capture('7-returned');
  assert.equal(returned.hero.top,0);
  await page.mouse.wheel(0,150);
  await page.waitForTimeout(220);
  const repeated=await capture('8-repeat');
  assert.equal(repeated.hero.top,0,'the transition responds on a repeat gesture');
  for(const [width,height] of [[1920,1080],[1024,768]]){
    await page.setViewportSize({width,height});
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await page.waitForTimeout(150);
    const before=await capture(`desktop-${width}-initial`);
    assert.ok(before.intro.top<height,`${width}px still hints the next section`);
    await page.mouse.wheel(0,Math.round(height*.15));
    await page.waitForTimeout(350);
    const during=await capture(`desktop-${width}-scroll`);
    assert.ok(during.hero.top>=-2,`${width}px keeps the hero pinned through the first gesture`);
    assert.ok(during.intro.top<before.intro.top,`${width}px advances the business section`);
  }
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.locator('#motion-toggle').click();
  await page.waitForTimeout(150);
  const paused=await capture('desktop-paused');
  assert.ok(Math.abs(paused.hero.height-paused.intro.top)<2,'pause removes the sticky runway');
  await page.locator('#motion-toggle').click();
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(150);
  const mobile=await capture('9-mobile');
  assert.ok(Math.abs(mobile.hero.height-mobile.intro.top)<2,'mobile has no extra pinned runway');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload({waitUntil:'networkidle'});
  const reduced=await capture('10-reduced');
  assert.ok(Math.abs(reduced.hero.height-reduced.intro.top)<2,'reduced motion has no pinned runway');
  console.log('PASS: first-scroll hero motion, natural continuation, repeat and mobile/reduced layout');
}finally{await browser.close();}
