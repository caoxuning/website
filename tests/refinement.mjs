import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {PNG} from 'pngjs';
function differences(a,b){
 const first=PNG.sync.read(a),second=PNG.sync.read(b);let changed=0;
 for(let i=0;i<first.data.length;i+=4)if(Math.abs(first.data[i]-second.data[i])+Math.abs(first.data[i+1]-second.data[i+1])+Math.abs(first.data[i+2]-second.data[i+2])>8)changed++;
 return changed;
}
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-webgl','--use-angle=d3d11']});
const output='test-results/refinement';
await mkdir(output,{recursive:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const idle=()=>page.waitForFunction(()=>document.body.dataset.transitioning==='false');
const ids=['home','perspective','computation','platform','research','inquiry'];
const observations=[];
try{
 await page.goto('http://127.0.0.1:5188/#home',{waitUntil:'networkidle'});
 await page.mouse.wheel(0,120);await page.waitForTimeout(450);
 await page.mouse.wheel(0,120);await page.waitForTimeout(450);
 await page.mouse.wheel(0,120);await idle();
 assert.equal(await page.locator('body').getAttribute('data-active-panel'),'1','slow physical mouse wheel reaches SAFE');
 for(const [width,height] of [[1440,900],[1024,768],[390,844]]){
  await page.setViewportSize({width,height});
  for(let i=0;i<ids.length;i++){
   if(width>=900){await page.locator('.deck-rail a').nth(i).click();await idle();}
   else {await page.locator('#'+ids[i]).scrollIntoViewIfNeeded();}
   await page.waitForTimeout(300);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
   await page.locator('#'+ids[i]).screenshot({path:`${output}/${width}-${ids[i]}.png`});
   observations.push(await page.locator('#'+ids[i]).evaluate(el=>({width:innerWidth,id:el.id,height:el.clientHeight,scrollHeight:el.scrollHeight})));
  }
 }
 await page.setViewportSize({width:1440,height:900});await page.locator('.deck-rail a').nth(3).click();await idle();
 const counts=[];
 for(const id of ['tab-observe','tab-connect','tab-explore']){
  await page.locator('#'+id).click();counts.push(await page.locator('.feature-dot.is-selected').count());
 }
 assert.equal(counts[0],1);assert.ok(counts[1]>1);assert.equal(counts[2],21);
 await page.locator('.deck-rail a').nth(2).click();await idle();
 await page.locator('#motion-toggle').click();
 const modes=[];
 for(let i=0;i<3;i++){
  await page.locator('[data-spatial-stage]').nth(i).click();
  assert.equal(await page.locator('[data-spatial-stage][aria-pressed=true]').count(),1);
  modes.push(await page.locator('#atlas-scene').screenshot({style:'.header,.section-top,.science-heading,.spatial-controls,.data-deliverables,.specimen-label,.scene-controls,.deck-rail{visibility:hidden!important}'}));
  await page.screenshot({path:`${output}/spatial-${i}.png`});
 }
 const changedPixels=[differences(modes[0],modes[1]),differences(modes[1],modes[2])];
 assert.ok(changedPixels.every(count=>count>1000),'spatial modes change the rendered tissue, not just button state');
 assert.deepEqual(errors,[]);
 await writeFile(`${output}/verification.json`,JSON.stringify({observations,counts,changedPixels,errors},null,2));
 console.log('PASS: slow wheel, six chapter layouts at three sizes, spatial modes and linked selections',counts);
}finally{await browser.close();}
