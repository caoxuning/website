import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-webgl','--use-angle=d3d11']});
try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto('http://127.0.0.1:5188/#home',{waitUntil:'networkidle'});
  assert.equal(await page.locator('main [data-panel]').count(),6,'six business chapters are independently navigable');
  assert.match(await page.locator('#home').textContent(),/科研服务与联合研发合作/);
  assert.match(await page.locator('#commercial-intro').textContent(),/固定样本研究团队/);
  assert.match(await page.locator('#commercial-intro').textContent(),/待项目确认/);
  assert.equal(await page.locator('#home [data-contact]').count(),1,'the hero primary action starts a project consultation');
  assert.equal(await page.locator('.solution-grid article').count(),3,'solutions are organized around three research directions');
  for(const article of await page.locator('.solution-grid article').allTextContents()){
    assert.match(article,/研究需求/);assert.match(article,/合作内容/);assert.match(article,/交付示例/);assert.match(article,/待项目确认/);
  }
  assert.match(await page.locator('#computation').textContent(),/需求沟通/);
  assert.match(await page.locator('#computation').textContent(),/不代表价格、周期、通量或验收承诺/);
  assert.equal(await page.locator('.data-deliverables strong').count(),4,'delivery examples are explicit without sales promises');
  await page.locator('.header a[href="#platform"]').click();
  await page.waitForFunction(()=>document.body.dataset.activePanel==='3');
  assert.equal(await page.locator('#chapter-count').textContent(),'04 / 06');
  assert.match(await page.locator('#platform').textContent(),/SAFE 获取读出/);
  assert.match(await page.locator('#platform').textContent(),/非平台性能说明/);
  assert.equal(await page.locator('#analysis-scene').count(),1,'AI preserves the tissue scene');
  await page.locator('#tab-connect').click();
  assert.equal(await page.locator('#analysis-region').textContent(),'ROI 02 / NEIGHBORHOOD');
  assert.match(await page.locator('#panel-title').textContent(),/空间邻域/);
  await page.locator('#tab-connect').press('ArrowDown');
  assert.equal(await page.locator('#tab-explore').getAttribute('aria-selected'),'true');
  assert.equal(await page.locator('#analysis-region').textContent(),'ROI 03 / TISSUE REGION');
  assert.equal(await page.locator('body').getAttribute('data-active-panel'),'3');
  await page.locator('.header a[href="#research"]').click();
  await page.waitForFunction(()=>document.body.dataset.activePanel==='4');
  assert.equal(await page.locator('#chapter-count').textContent(),'05 / 06');
  assert.match(await page.locator('#research').textContent(),/待确认/);
  await page.locator('#research-detail-open').click();
  assert.equal(await page.locator('#research-dialog').isVisible(),true);
  await page.keyboard.press('Escape');
  await page.locator('.header a[href="#inquiry"]').click();
  await page.waitForFunction(()=>document.body.dataset.activePanel==='5');
  assert.equal(await page.locator('.team-member').count(),4);
  assert.match(await page.locator('#inquiry').textContent(),/历史资料/);
  assert.match(await page.locator('#inquiry-title').textContent(),/连接实验、数据与 AI 的团队/);
  assert.equal(await page.locator('.collaboration-band [data-contact]').count(),1,'the collaboration invitation follows the team');
  assert.equal(await page.locator('.footer-columns').count(),1,'the site has one complete footer');
  assert.equal(await page.locator('.footer-navigation a').count(),5,'footer navigation maps to real sections');
  assert.match(await page.locator('.footer-contact').textContent(),/正式联系信息待确认/);
  assert.equal(await page.locator('.footer-contact').textContent().then(text=>/(@|\+\d|\d{3}[- ]?\d{3})/.test(text)),false,'unverified contact details are not guessed');
  await page.locator('[data-contact]').first().click();
  assert.match(await page.locator('#contact-dialog').textContent(),/本地咨询草稿/);
  assert.match(await page.locator('#contact-dialog').textContent(),/不会发送或保存/);
  assert.equal(await page.locator('#chapter-count').textContent(),'06 / 06');
  console.log('PASS: commercial hierarchy, solution and delivery boundaries, technical interaction, case dialog and historical team');
}finally{await browser.close();}
