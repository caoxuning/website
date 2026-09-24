import {chromium} from '@playwright/test';
import {PNG} from 'pngjs';
import assert from 'node:assert/strict';

const base=process.env.RELEASE_PREVIEW_URL || 'http://127.0.0.1:5189';
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-webgl','--use-angle=d3d11']});
try{
  for(const width of [1440,390]){
    const page=await browser.newPage({viewport:{width,height:900}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
    const response=await page.goto(`${base}/#home`,{waitUntil:'networkidle'});
    assert.equal(response.status(),200);
    await page.locator('#perspective').scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    assert.equal(await page.locator('#network-scene').isVisible(),true);
    const picture=PNG.sync.read(await page.locator('#network-scene').screenshot());
    let lit=0;
    for(let i=0;i<picture.data.length;i+=16){
      if(picture.data[i]+picture.data[i+1]+picture.data[i+2]>120)lit++;
    }
    assert.ok(lit>picture.width*picture.height*.002,`${width}px: production 3D scene is nonblank`);
    await page.locator('header [data-contact]').click();
    assert.equal(await page.locator('#contact-dialog').evaluate(dialog=>dialog.open),true);
    assert.match(await page.locator('#contact-dialog').innerText(),/不会发送或保存/);
    await page.locator('#contact-dialog [data-close]').click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    assert.deepEqual(errors,[],`${width}px: no production-page or asset errors`);
    await page.close();
  }
  console.log('PASS: production preview loads, 3D is nonblank, consultation boundary is visible, and assets resolve at 1440/390px');
}finally{await browser.close();}
