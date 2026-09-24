import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const output='test-results/approved-ui';
try{
  await mkdir(output,{recursive:true});
  await page.goto('http://127.0.0.1:5188/#home',{waitUntil:'networkidle'});
  await page.locator('.primary-link').hover({position:{x:28,y:18}});
  await page.waitForTimeout(280);
  const spotlight=await page.locator('.primary-link').evaluate(el=>({x:el.style.getPropertyValue('--spot-x'),opacity:Number(getComputedStyle(el,'::before').opacity)}));
  assert.ok(spotlight.x.endsWith('px')&&spotlight.opacity>.75,'CTA spotlight follows the pointer');
  await page.screenshot({path:`${output}/hero-hover.png`});

  await page.locator('.header a[href="#perspective"]').click();
  await page.waitForFunction(()=>document.body.dataset.activePanel==='1');
  await page.locator('#solution-spatial').click();
  await page.mouse.move(1090,470);
  await page.waitForTimeout(350);
  assert.equal(await page.locator('#solution-spatial').getAttribute('aria-selected'),'true');
  await page.screenshot({path:`${output}/spatial-desktop.png`});

  await page.setViewportSize({width:390,height:844});
  await page.locator('#perspective').scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
  await page.locator('#perspective').screenshot({path:`${output}/spatial-mobile.png`});
  console.log('PASS: CTA spotlight, spatial selection and responsive screenshots');
}finally{await browser.close();}
