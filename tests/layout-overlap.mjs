import {chromium} from '@playwright/test';
import {mkdir,readFile} from 'node:fs/promises';
import {PNG} from 'pngjs';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-webgl','--use-angle=d3d11']});
await mkdir('test-results/layout-overlap',{recursive:true});
try{
  for(const width of [1440,1024,996,390]){
    const page=await browser.newPage({viewport:{width,height:900}});
    await page.goto('http://127.0.0.1:5188/#home',{waitUntil:'networkidle'});
    const deliveryBounds=await page.locator('.delivery .module-visual').evaluate(el=>{const rect=el.getBoundingClientRect();return {x:rect.x,y:rect.y+scrollY,width:rect.width,height:rect.height};});
    await page.screenshot({path:`test-results/layout-overlap/full-${width}-before.png`,fullPage:true});
    const full=PNG.sync.read(await readFile(`test-results/layout-overlap/full-${width}-before.png`));
    let visible=0,total=0;
    for(let y=Math.floor(deliveryBounds.y+deliveryBounds.height*.25);y<deliveryBounds.y+deliveryBounds.height*.75;y+=3){
      for(let x=Math.floor(deliveryBounds.x+deliveryBounds.width*.25);x<deliveryBounds.x+deliveryBounds.width*.75;x+=3){
        const i=(y*full.width+x)*4;
        if(Math.abs(full.data[i]-17)+Math.abs(full.data[i+1]-22)+Math.abs(full.data[i+2]-24)>70)visible++;
        total++;
      }
    }
    assert.ok(visible/total>.01,`${width}px: offscreen delivery illustration has an initial frame`);
    for(const [scene,poster] of [['network','scene-network.png'],['atlas','scene-atlas.png'],['analysis','scene-analysis.png']]){
      assert.equal(await page.locator(`#${scene}-scene`).locator('xpath=preceding-sibling::img').getAttribute('src'),`/${poster}`,`${scene} uses a matching scene poster`);
    }
    const geometry=await page.evaluate(()=>{
      const commercial=document.querySelector('.commercial-intro');
      scrollTo({top:commercial.offsetTop+commercial.offsetHeight-innerHeight*.5,behavior:'instant'});
      const rect=selector=>{const {left,right,top,bottom,width,height}=document.querySelector(selector).getBoundingClientRect();return {left,right,top,bottom,width,height};};
      return {head:rect('.commercial-head'),actions:rect('.commercial-actions'),lines:rect('.commercial-lines'),solution:rect('.solution-preview'),deliveryVisual:rect('.delivery .module-visual'),deliveryReady:document.querySelector('.delivery .module-visual').classList.contains('is-ready')};
    });
    const xOverlap=Math.min(geometry.head.right,geometry.actions.right)-Math.max(geometry.head.left,geometry.actions.left);
    const yOverlap=Math.min(geometry.head.bottom,geometry.actions.bottom)-Math.max(geometry.head.top,geometry.actions.top);
    assert.ok(xOverlap<=0||yOverlap<=0,`${width}px: sticky collaboration copy does not overlap its actions`);
    await page.screenshot({path:`test-results/layout-overlap/commercial-bottom-${width}.png`});
    assert.equal(await page.locator('.solution-grid').evaluate(el=>el.parentElement.classList.contains('solution-choices')),true,'solution details stay with their selector');
    assert.equal(await page.locator('.technology-pulse').evaluate(el=>el.parentElement.classList.contains('solution-preview')),true,'SAFE status stays with its visual');
    await page.locator('#perspective').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
    await page.waitForTimeout(180);
    await page.screenshot({path:`test-results/layout-overlap/solutions-top-${width}.png`});
    await page.locator('#perspective').evaluate(el=>scrollTo({top:el.offsetTop+el.offsetHeight*.42,behavior:'instant'}));
    await page.waitForTimeout(180);
    await page.screenshot({path:`test-results/layout-overlap/solutions-lower-${width}.png`});
    await page.locator('#computation').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
    await page.waitForTimeout(180);
    await page.screenshot({path:`test-results/layout-overlap/delivery-${width}.png`});
    console.log(width,JSON.stringify({xOverlap,yOverlap,visibleRatio:visible/total}));
    await page.close();
  }
}finally{await browser.close();}
