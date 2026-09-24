import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-webgl','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const idle=()=>page.waitForFunction(()=>document.body.dataset.transitioning==='false');
const panel=()=>page.locator('body').getAttribute('data-active-panel');
const inquiry=page.locator('#inquiry');
try{
  await mkdir('test-results/footer',{recursive:true});
  await page.goto('http://127.0.0.1:5188/#inquiry',{waitUntil:'networkidle'});
  await idle();
  assert.equal(await panel(),'5');
  assert.ok(await inquiry.evaluate(el=>el.scrollHeight>el.clientHeight+20),'desktop final chapter has native readable overflow');
  await inquiry.screenshot({path:'test-results/footer/team-top.png'});

  await inquiry.hover();
  await page.mouse.wheel(0,680);
  await page.waitForTimeout(180);
  const middle=await inquiry.evaluate(el=>el.scrollTop);
  assert.ok(middle>20,'downward wheel scrolls the final chapter itself');
  assert.equal(await panel(),'5','final chapter scrolling preserves chapter state');
  await page.mouse.wheel(0,-160);
  await page.waitForTimeout(160);
  assert.equal(await panel(),'5','upward input within final chapter does not leave it');
  assert.ok(await inquiry.evaluate(el=>el.scrollTop)<middle,'upward input scrolls final chapter before deck navigation');

  await inquiry.evaluate(el=>{el.scrollTop=0;});
  await page.mouse.wheel(0,-360);
  await page.waitForTimeout(120);
  assert.equal(await panel(),'5','top-edge momentum is absorbed before a reverse transition');
  await page.waitForTimeout(620);
  await page.mouse.wheel(0,-360);
  await idle();
  assert.equal(await panel(),'4','a new deliberate upward gesture at top returns to research');

  await page.locator('.deck-rail a[href="#inquiry"]').click();await idle();
  await inquiry.evaluate(el=>{el.scrollTop=el.scrollHeight;});
  await page.locator('[data-scroll-team]').click();
  await page.waitForTimeout(500);
  assert.ok(await inquiry.evaluate(el=>el.scrollTop)<5,'footer team navigation returns to the team heading');
  await inquiry.focus();
  await page.keyboard.press('End');await page.waitForTimeout(320);
  assert.ok(await inquiry.evaluate(el=>el.scrollTop>20),'keyboard End scrolls the final chapter');
  await page.screenshot({path:'test-results/footer/footer-desktop.png'});

  await page.locator('.footer-contact [data-contact]').click();
  assert.equal(await page.locator('#contact-dialog').isVisible(),true,'footer consultation opens the local draft dialog');
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);
  assert.equal(await inquiry.evaluate(el=>getComputedStyle(el).overflowY),'visible','mobile keeps the document native scroll');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0,'mobile footer has no horizontal overflow');
  await inquiry.scrollIntoViewIfNeeded();
  await page.screenshot({path:'test-results/footer/footer-mobile.png',fullPage:true});
  console.log('PASS: final chapter native scroll boundary, footer navigation, dialog CTA and mobile footer');
}finally{await browser.close();}
