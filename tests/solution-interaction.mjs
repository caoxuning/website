import {chromium} from '@playwright/test';
import {PNG} from 'pngjs';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const idle=()=>page.waitForFunction(()=>document.body.dataset.transitioning==='false');
const output='test-results/interaction';
const pixels=async()=>PNG.sync.read(await page.locator('#network-scene').screenshot());
function differences(a,b){let count=0;for(let i=0;i<a.data.length;i+=4)if(Math.abs(a.data[i]-b.data[i])+Math.abs(a.data[i+1]-b.data[i+1])+Math.abs(a.data[i+2]-b.data[i+2])>12)count++;return count;}
try{
  await mkdir(output,{recursive:true});
  await page.goto('http://127.0.0.1:5188/#perspective',{waitUntil:'networkidle'});await idle();
  await page.locator('#motion-toggle').click();
  const initial=await pixels();
  await page.locator('#solution-spatial').click();
  assert.equal(await page.locator('.solution-grid article:visible').count(),1);
  assert.equal(await page.locator('#solution-spatial-panel').isVisible(),true);
  const contourDifference=differences(initial,await pixels());assert.ok(contourDifference>1000,'solution selection changes rendered geometry/readout while ambient motion is paused');
  await page.locator('#solution-spatial').press('ArrowDown');
  assert.equal(await page.locator('#solution-ai').getAttribute('aria-selected'),'true');
  assert.equal(await page.locator('body').getAttribute('data-active-panel'),'1','tab arrows must not scroll to another chapter');
  await page.locator('#solution-ai').press('Home');
  assert.equal(await page.locator('#solution-imaging').getAttribute('aria-selected'),'true');
  const still=await pixels();await page.mouse.move(1100,360);await page.waitForTimeout(200);
  assert.equal(differences(still,await pixels()),0,'pause also freezes pointer response');
  await page.locator('#motion-toggle').click();
  await page.mouse.move(750,360);await page.waitForTimeout(350);const moving=await pixels();
  await page.mouse.move(1300,550);await page.waitForTimeout(450);
  const motionDifference=differences(moving,await pixels());assert.ok(motionDifference>1000,'the tissue stays animated and responds across the interaction surface');
  for(const [width,height] of [[1920,1080],[1440,900],[1024,768],[390,844]]){
    await page.setViewportSize({width,height});
    await page.locator('#perspective').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
    assert.ok(await page.locator('#perspective').evaluate(el=>el.scrollHeight>=el.clientHeight),'chapter content remains in document flow');
    await page.locator('#perspective').screenshot({path:`${output}/solutions-${width}.png`});
    const image=await pixels();let foreground=0;
    for(let i=0;i<image.data.length;i+=4)if(Math.abs(image.data[i]-17)+Math.abs(image.data[i+1]-22)+Math.abs(image.data[i+2]-24)>50)foreground++;
    assert.ok(foreground>2000,`${width}: scene must be nonblank`);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#solution-ai').click();
  assert.equal(await page.locator('#solution-ai-panel').isVisible(),true);
  const reduced=await pixels();await page.waitForTimeout(200);assert.equal(differences(reduced,await pixels()),0);
  assert.deepEqual(errors,[]);
  await writeFile(`${output}/verification.json`,JSON.stringify({contourDifference,motionDifference,errors,viewports:[1920,1440,1024,390],checks:['solution content and WebGL linkage','keyboard tab navigation','pause and reduced motion','animated tissue','responsive layout and nonblank canvas']},null,2));
  console.log('PASS: solution interaction, keyboard, moving WebGL, pause and four responsive sizes');
}finally{await browser.close();}
