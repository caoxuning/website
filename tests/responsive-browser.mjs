import {chromium} from '@playwright/test';
import {PNG} from 'pngjs';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-webgl','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const output='test-results/responsive';
await mkdir(output,{recursive:true});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
const viewports=[[1920,1080],[1440,900],[1366,768],[1280,720],[1024,768],[900,700],[768,1024],[390,844],[320,640]];
const scenes=['#cell-scene','#network-scene','#atlas-scene','#analysis-scene'];
try{
  await page.goto('http://127.0.0.1:5188/#home',{waitUntil:'networkidle'});
  for(const [width,height] of viewports){
    await page.setViewportSize({width,height});
    for(const id of ['home','perspective','computation','platform']){
      await page.locator(`#${id}`).evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
      await page.waitForTimeout(180);
      const layout=await page.evaluate(({id,width})=>{
        const section=document.getElementById(id);
        const text=section.querySelector('h1,h2');
        const scene=section.querySelector('.scene-sticky,.module-visual');
        const content=section.querySelector(id==='home'?'.chapter-inner':id==='perspective'?'.solution-preview':id==='computation'?'.spatial-controls':'.analysis-sidebar');
        const rect=el=>{const {top,right,bottom,left,width,height}=el.getBoundingClientRect();return {top,right,bottom,left,width,height};};
        return {
          overflow:document.documentElement.scrollWidth-innerWidth,
          headingOverflow:text.scrollWidth-text.clientWidth,
          scene:rect(scene),content:rect(content),
          actions:id==='home'?rect(section.querySelector('.hero-actions')):null,
          bottom:id==='home'?rect(section.querySelector('.hero-bottom')):null,
          chapterHeight:section.getBoundingClientRect().height,
          width
        };
      },{id,width});
      assert.ok(layout.overflow<=1,`${width}x${height} ${id}: horizontal overflow ${layout.overflow}`);
      assert.ok(layout.headingOverflow<=1,`${width}x${height} ${id}: heading clipped ${layout.headingOverflow}`);
      if(id==='home'&&width<900){
        assert.ok(layout.scene.top>=layout.actions.bottom+8,`${width}x${height}: hero scene overlaps the actions`);
        assert.ok(layout.bottom.top>=layout.scene.bottom-1,`${width}x${height}: hero footer overlaps the scene`);
      }
      if(id==='computation'||id==='platform'){
        if(width>=1200)assert.ok(layout.scene.right<=layout.content.left+1,`${width}x${height} ${id}: side-by-side content overlaps the stage`);
        else assert.ok(layout.scene.bottom<=layout.content.top+1,`${width}x${height} ${id}: stacked content overlaps the stage`);
      }
      if([1280,1024,900,390,320].includes(width))await page.screenshot({path:`${output}/${width}-${id}.png`});
      if([1440,1024,390].includes(width)){
        const selector={home:'#cell-scene',perspective:'#network-scene',computation:'#atlas-scene',platform:'#analysis-scene'}[id];
        const image=PNG.sync.read(await page.locator(selector).screenshot());
        let foreground=0;
        for(let i=0;i<image.data.length;i+=4){
          if(Math.abs(image.data[i]-17)+Math.abs(image.data[i+1]-22)+Math.abs(image.data[i+2]-24)>55)foreground++;
        }
        assert.ok(foreground>image.width*image.height*.004,`${width}x${height} ${id}: 3D stage is blank`);
      }
    }
    for(const id of ['commercial-intro','research','inquiry']){
      const section=page.locator(`#${id}`);
      await section.evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
      await page.waitForTimeout(70);
      const layout=await section.evaluate(el=>({headingOverflow:el.querySelector('h2').scrollWidth-el.querySelector('h2').clientWidth,documentOverflow:document.documentElement.scrollWidth-innerWidth}));
      assert.ok(layout.headingOverflow<=1,`${width}x${height} ${id}: heading clipped`);
      assert.ok(layout.documentOverflow<=1,`${width}x${height} ${id}: horizontal overflow`);
    }
    for(const selector of scenes){
      const dimensions=await page.locator(selector).evaluate(canvas=>({cssWidth:canvas.clientWidth,cssHeight:canvas.clientHeight,bufferWidth:canvas.width,bufferHeight:canvas.height}));
      const cssRatio=dimensions.cssWidth/dimensions.cssHeight;
      const bufferRatio=dimensions.bufferWidth/dimensions.bufferHeight;
      assert.ok(Number.isFinite(bufferRatio)&&Math.abs(cssRatio-bufferRatio)<.02,`${width}x${height} ${selector}: canvas aspect ratio differs from its viewport`);
    }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: nine viewport sizes, scene aspect ratios, text fit and non-overlapping layouts');
}finally{await browser.close();}
