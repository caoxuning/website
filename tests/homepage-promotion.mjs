import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';

const browser=await chromium.launch({
  headless:true,
  executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});

try{
  for(const [width,height] of [[1440,900],[1024,768],[390,844]]){
    const page=await browser.newPage({viewport:{width,height},acceptDownloads:true});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const response=await page.goto('http://127.0.0.1:5188/',{waitUntil:'networkidle'});
    assert.equal(response.status(),200);
    assert.equal(await page.locator('#story-canvas').count(),1,'main route should render the narrative scene');
    assert.equal(await page.locator('.story-beat').count(),6);
    assert.equal(await page.locator('a[href="/#inquiry"],a[href="/#research"]').count(),0,'new homepage should not link to retired anchors');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0,`${width}px horizontal overflow`);

    const copySize=await page.locator('.beat-hero .beat-copy').evaluate(element=>parseFloat(getComputedStyle(element).fontSize));
    assert.ok(copySize>= (width<=600?16:18),`${width}px hero body text is too small: ${copySize}`);

    await page.getByRole('button',{name:'咨询项目'}).first().click();
    const contact=page.locator('#contact-dialog');
    assert.ok(await contact.evaluate(element=>element.open));
    assert.match(await contact.innerText(),/本地.*不会发送/);
    await contact.getByLabel('姓名').fill('Test Researcher');
    await contact.getByLabel('电子邮箱').fill('test@example.org');
    await contact.getByLabel('研究问题或合作方向').fill('Spatial research question');
    const [download]=await Promise.all([
      page.waitForEvent('download'),
      contact.getByRole('button',{name:/下载咨询项目草稿/}).click(),
    ]);
    const draft=await readFile(await download.path(),'utf8');
    assert.match(draft,/Test Researcher/);
    assert.match(draft,/尚未发送/);
    await contact.getByRole('button',{name:'关闭'}).click();

    await page.getByRole('button',{name:/图像资料说明/}).click();
    assert.ok(await page.locator('#research-dialog').evaluate(element=>element.open));
    await page.locator('#research-dialog').getByRole('button',{name:'关闭'}).click();
    await page.getByRole('button',{name:'关于此概念站'}).click();
    assert.ok(await page.locator('#about-dialog').evaluate(element=>element.open));
    await page.locator('#about-dialog').getByRole('button',{name:'关闭'}).click();
    assert.deepEqual(errors,[]);
    await page.close();
    console.log(`${width}px homepage, consultation draft and content notes passed`);
  }
}finally{
  await browser.close();
}
