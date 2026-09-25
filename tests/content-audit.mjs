import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';

const home=await readFile(new URL('../index.html',import.meta.url),'utf8');
assert.doesNotMatch(home,/design-preview\.html|legacy\.html/,'homepage should have one current entry');
await mkdir('test-results/content-audit',{recursive:true});

const browser=await chromium.launch({
  headless:true,
  executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});

try{
  for(const [width,height] of [[1440,900],[390,844]]){
    const page=await browser.newPage({viewport:{width,height}});
    await page.goto('http://127.0.0.1:5188/',{waitUntil:'networkidle'});

    const main=await page.locator('main').innerText();
    assert.match(main,/从组织图像，\s*走向下一步研究/);
    assert.doesNotMatch(main,/不能直接作为.*证明|不是已发布的服务目录|不是模型或实验结果|仅为交付类型预览/);
    assert.equal(await page.locator('.site-header nav a[href="#evidence"]').innerText(),'研究场景');
    assert.equal(await page.locator('.site-footer nav a[href="#evidence"]').innerText(),'研究场景');
    assert.match(await page.locator('.archive-figure figcaption').innerText(),/历史.*图像.*待核实/s);
    assert.equal(await page.locator('#evidence [data-contact]').count(),1);

    await page.locator('#evidence').scrollIntoViewIfNeeded();
    await page.locator('#evidence').screenshot({path:`test-results/content-audit/evidence-${width}.png`});
    const actionBoxes=await page.locator('.evidence-actions button').evaluateAll(buttons=>buttons.map(button=>{
      const {x,y,width,height}=button.getBoundingClientRect();
      return {x,y,width,height};
    }));
    assert.ok(actionBoxes.every(box=>box.width>0&&box.height>0));
    assert.ok(actionBoxes[0].x+actionBoxes[0].width<=actionBoxes[1].x || actionBoxes[0].y+actionBoxes[0].height<=actionBoxes[1].y,'research actions must not overlap');
    await page.locator('#evidence [data-contact]').click();
    assert.ok(await page.locator('#contact-dialog').evaluate(dialog=>dialog.open));
    assert.match(await page.locator('#contact-dialog').innerText(),/本地.*不会发送/s);
    await page.locator('#contact-dialog [data-close]').click();

    await page.locator('#research-detail-open').click();
    const research=await page.locator('#research-dialog').innerText();
    assert.match(research,/SAFE/);
    assert.match(research,/来源|样本/);
    await page.locator('#research-dialog [data-close]').click();

    await page.locator('#about-open').click();
    assert.match(await page.locator('#about-dialog').innerText(),/活细胞|活组织/);
    await page.locator('#about-dialog [data-close]').click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0);
    await page.close();
    console.log(`${width}px content, provenance and consultation passed`);
  }
}finally{
  await browser.close();
}
