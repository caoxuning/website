import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';

const label=process.argv[2]||'after';
const verify=label.startsWith('after');
const hardware=process.argv.includes('--gpu');
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:hardware?['--enable-webgl','--use-angle=d3d11']:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
  window.__frames={};
  const proto=WebGL2RenderingContext.prototype;
  const clear=proto.clear;
  proto.clear=function(mask){
    if(mask&this.COLOR_BUFFER_BIT){const s=window.__frames[this.canvas.id]??={times:[],draws:0};s.times.push(performance.now());}
    return clear.call(this,mask);
  };
  for(const name of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){
    const method=proto[name];
    proto[name]=function(...args){const s=window.__frames[this.canvas.id];if(s)s.draws++;return method.apply(this,args);};
  }
});
const reset=()=>page.evaluate(()=>{for(const s of Object.values(window.__frames)){s.times=[];s.draws=0;}});
const navigate=async id=>{
  await page.locator(`#${id}`).evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
  await page.waitForFunction(value=>document.body.dataset.activePanel===value,['home','perspective','computation','platform','research','inquiry'].indexOf(id).toString(),{timeout:5000});
};
const read=()=>page.evaluate(()=>Object.fromEntries(Object.entries(window.__frames).map(([id,s])=>{
  const intervals=s.times.slice(1).map((t,i)=>t-s.times[i]).sort((a,b)=>a-b);
  return [id,{frames:s.times.length,fps:s.times.length>1?1000*(s.times.length-1)/(s.times.at(-1)-s.times[0]):0,p95FrameMs:intervals[Math.floor(intervals.length*.95)]??0,drawCallsPerFrame:s.draws/Math.max(1,s.times.length)}];
})));
try{
  await page.goto('http://127.0.0.1:5188/',{waitUntil:'networkidle'});
  await page.waitForTimeout(1800);
  const renderer=await page.locator('#cell-scene').evaluate(canvas=>{
    const gl=canvas.getContext('webgl2'),ext=gl?.getExtension('WEBGL_debug_renderer_info');
    return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'Unknown renderer';
  });
  const results={label,environment:`Headless Chromium, ${hardware?'D3D11 requested':'SwiftShader software WebGL'}, 1440x900 DPR 1`,renderer,scenes:[],errors};
  for(const id of ['home','perspective','computation','platform']){
    await navigate(id);
    await page.waitForTimeout(1800);
    await reset();await page.waitForTimeout(4000);
    const frames=await read();results.scenes.push({id,frames});
    if(verify){
      const active={home:'cell-scene',perspective:'network-scene',computation:'atlas-scene',platform:'analysis-scene'}[id];
      assert.ok(frames[active].frames>0);
      assert.ok(frames[active].drawCallsPerFrame<30,'static specimen draw calls should be batched');
      for(const [key,value] of Object.entries(frames))if(key!==active)assert.equal(value.frames,0,'inactive scene must not render');
    }
  }
  await page.locator('#motion-toggle').click();await reset();await page.waitForTimeout(400);
  results.paused=await read();
  if(verify)assert.ok(Object.values(results.paused).every(s=>s.frames===0));
  await page.locator('#motion-toggle').click();
  await navigate('research');
  await reset();await page.waitForTimeout(400);
  results.staticChapter=await read();
  if(verify)assert.ok(Object.values(results.staticChapter).every(s=>s.frames===0),'static chapters stop all tissue renderers');
  await navigate('home');
  await page.waitForTimeout(500);await reset();
  await page.waitForTimeout(600);
  results.returnToHome=await read();
  if(verify)assert.ok(results.returnToHome['cell-scene'].frames>0,'returning to the hero resumes its scene');
  assert.deepEqual(errors,[]);
  await mkdir('test-results/performance',{recursive:true});
  await writeFile(`test-results/performance/${label}.json`,JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
