import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-webgl','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const output='test-results/scroll-reveal';
await mkdir(output,{recursive:true});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));

async function progress(selector,position){
  return page.locator(selector).evaluate(async(el,target)=>{
    const section=el.closest('.commercial-intro');
    if(section)scrollTo({top:0,behavior:'instant'});
    const y=el.getBoundingClientRect().top+scrollY;
    const viewport=innerHeight;
    const offset=target==='before'?viewport*1.08:target==='visible'?viewport*.48:target==='mid'?viewport*.98-Math.min(240,viewport*.28)*.5:-el.offsetHeight-150;
    const scrollTarget=target==='passed'&&section?section.offsetTop+section.offsetHeight+viewport*.2:y-offset;
    scrollTo({top:scrollTarget,behavior:'instant'});
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    return {value:Number(el.style.getPropertyValue('--reveal-progress')),opacity:Number(getComputedStyle(el).opacity)};
  },position);
}

try{
  await page.goto('http://127.0.0.1:5188/#home',{waitUntil:'networkidle'});
  const commercialLines=page.locator('#commercial-title .story-line-text');
  assert.equal(await commercialLines.count(),2,'commercial headline is staged in two semantic lines');
  await page.locator('#commercial-title').evaluate(async el=>{
    scrollTo({top:el.getBoundingClientRect().top+scrollY-innerHeight*.84,behavior:'instant'});
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });
  const lineValues=await commercialLines.evaluateAll(elements=>elements.map(el=>Number(el.style.getPropertyValue('--reveal-progress'))));
  assert.ok(lineValues[0]>lineValues[1]+.1,'the second line enters after the first');
  await page.screenshot({path:`${output}/commercial-mid.png`});
  const firstVisible=await progress('#commercial-title .story-line:first-child .story-line-text','visible');
  const secondVisible=await progress('#commercial-title .story-line:last-child .story-line-text','visible');
  assert.ok(firstVisible.value>.95&&secondVisible.value>.95,'both lines settle before reading continues');
  const firstRewound=await progress('#commercial-title .story-line:first-child .story-line-text','before');
  const secondRewound=await progress('#commercial-title .story-line:last-child .story-line-text','before');
  assert.ok(firstRewound.value<.05&&secondRewound.value<.05,'line motion reverses with scroll');
  for(const selector of ['#commercial-title .story-line:first-child .story-line-text','.research-image']){
    const before=await progress(selector,'before');
    const halfway=await progress(selector,'mid');
    const entered=await progress(selector,'visible');
    const passed=await progress(selector,'passed');
    const returned=await progress(selector,'visible');
    const leftAgain=await progress(selector,'before');
    const replayed=await progress(selector,'visible');
    assert.ok(before.value<.05&&before.opacity<.05,`${selector}: hidden before entry`);
    assert.ok(halfway.value>.15&&halfway.value<.85,`${selector}: motion follows intermediate scroll progress`);
    assert.ok(entered.value>.95&&entered.opacity>.95,`${selector}: visible in viewport`);
    assert.ok(passed.value<.05&&passed.opacity<.05,`${selector}: exits after passing viewport`);
    assert.ok(returned.value>.95&&returned.opacity>.95,`${selector}: reappears on upward scroll`);
    assert.ok(leftAgain.value<.05&&replayed.value>.95,`${selector}: replays on another downward pass`);
  }
  await progress('#commercial-title .story-line:first-child .story-line-text','visible');
  await page.screenshot({path:`${output}/commercial-reentry.png`});
  await page.setViewportSize({width:390,height:844});
  const mobileBefore=await progress('#commercial-title .story-line:first-child .story-line-text','before');
  const mobileEntered=await progress('#commercial-title .story-line:first-child .story-line-text','visible');
  const mobileReturned=await progress('#commercial-title .story-line:first-child .story-line-text','passed');
  assert.ok(mobileBefore.value<.05&&mobileEntered.value>.95&&mobileReturned.value<.05,'mobile scroll motion is also reversible');
  await page.locator('#motion-toggle').click();
  await progress('#commercial-title .story-line:first-child .story-line-text','before');
  assert.equal(await commercialLines.first().evaluate(el=>Number(getComputedStyle(el).opacity)),1,'pause keeps content readable');
  await page.locator('#motion-toggle').click();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload({waitUntil:'networkidle'});
  await progress('#commercial-title .story-line:first-child .story-line-text','before');
  assert.equal(await commercialLines.first().evaluate(el=>Number(getComputedStyle(el).opacity)),1,'reduced motion keeps content readable');
  assert.deepEqual(errors,[]);
  console.log('PASS: scroll-linked text/image motion replays in both directions and honors pause/reduced motion');
}finally{await browser.close();}
