import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-webgl','--use-angle=d3d11']});
const brightness=value=>{
  const channels=value.match(/[\d.]+/g)?.slice(0,3).map(Number) || [];
  return channels.reduce((sum,channel)=>sum+channel,0)/3;
};
try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto('http://127.0.0.1:5188/#home',{waitUntil:'networkidle'});
  const desktop=await page.evaluate(()=>{
    const rect=selector=>{const {left,right,width,height}=document.querySelector(selector).getBoundingClientRect();return {left,right,width,height};};
    const css=selector=>getComputedStyle(document.querySelector(selector));
    return {
      deliveryBackground:css('#computation').backgroundColor,
      technologyBackground:css('#platform').backgroundColor,
      deliveryVisualBackground:css('#computation .module-visual').backgroundColor,
      deliveryText:css('#computation').color,
      deliveryMutedText:css('#computation .science-heading > p').color,
      researchBackground:css('#research').backgroundColor,
      deliveryHeight:rect('#computation').height,
      deliveryControls:rect('#computation .spatial-controls'),
      deliveryVisual:rect('#computation .module-visual'),
      deliveryTypesDisplay:css('#computation .data-deliverables').display,
      technologyVisual:rect('#platform .module-visual'),
      researchImage:rect('#research .specimen-image img'),
      teamIntroduction:document.querySelector('.inquiry-content p').textContent,
      teamArchiveNote:document.querySelector('.archive-note').textContent,
    };
  });
  assert.ok(brightness(desktop.deliveryBackground)<50,'service chapter continues the graphite tissue field');
  assert.equal(desktop.deliveryBackground,desktop.technologyBackground,'service and technology share one visual field');
  assert.equal(desktop.deliveryBackground,desktop.deliveryVisualBackground,'service specimen has no rectangular background seam');
  assert.ok(brightness(desktop.deliveryText)>180&&brightness(desktop.deliveryMutedText)>140,'service copy stays readable on graphite');
  assert.ok(desktop.deliveryControls.right<desktop.deliveryVisual.left,'service process precedes the specimen view');
  assert.equal(desktop.deliveryTypesDisplay,'grid','deliverable examples form a clear four-column register');
  assert.ok(desktop.deliveryHeight<1000,'service chapter has no long empty tail');
  assert.ok(desktop.technologyVisual.width>650&&desktop.technologyVisual.height>520,'technology chapter gives the 3D scene primary scale');
  assert.ok(brightness(desktop.researchBackground)>180,'historical material reads as a distinct evidence chapter');
  assert.ok(desktop.researchImage.width<=410,'historical 400px image is not enlarged beyond its source');
  assert.ok(!desktop.teamIntroduction.includes('确认')&&desktop.teamArchiveNote.includes('正式发布前确认'),'team provenance is consolidated below the people');
  await page.setViewportSize({width:390,height:844});
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0,'mobile has no horizontal overflow');
  const mobile=await page.evaluate(()=>({
    researchStoryTop:document.querySelector('#research .research-story').getBoundingClientRect().top,
    researchImageTop:document.querySelector('#research .research-image').getBoundingClientRect().top,
    featureMapWidth:document.querySelector('#platform .feature-map').getBoundingClientRect().width,
  }));
  assert.ok(mobile.researchStoryTop<mobile.researchImageTop,'mobile research question precedes the archival image');
  assert.ok(mobile.featureMapWidth>=230,'mobile feature map is large enough to inspect');
  assert.ok(await page.locator('#computation .spatial-modes button').first().isVisible());
  assert.ok(await page.locator('#platform .perspective-tabs button').first().isVisible());
  console.log('PASS: lower chapters have distinct roles, compact pacing, intact interactions and mobile flow');
}finally{await browser.close();}
