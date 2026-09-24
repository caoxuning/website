import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';
import {PNG} from 'pngjs';

const screenshotDir='test-results/design-preview';
await mkdir(screenshotDir,{recursive:true});

function changedPixels(first,second){
  const a=PNG.sync.read(first).data;
  const b=PNG.sync.read(second).data;
  let changed=0;
  for(let i=0;i<a.length;i+=4){
    if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>30)changed++;
  }
  return changed;
}

const browser=await chromium.launch({
  headless:true,
  executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});

try{
  for(const [width,height] of [[1920,1080],[1440,900],[1024,768],[390,844]]){
    const page=await browser.newPage({viewport:{width,height}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const response=await page.goto('http://127.0.0.1:5188/design-preview.html',{waitUntil:'networkidle'});
    assert.equal(response.status(),200);
    assert.equal(await page.locator('.story-beat').count(),6);
    assert.equal(await page.locator('#story-canvas').count(),1);

    for(const [id,phase,solution] of [
      ['collaboration','collaboration','0'],
      ['delivery','delivery','0'],
      ['technology','safe','0'],
      ['spatial','spatial','1'],
      ['analysis','ai','2'],
    ]){
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(180);
      assert.equal(await page.locator('.story-world').getAttribute('data-phase'),phase,`${width}px ${id} phase`);
      assert.equal(await page.locator('#story-canvas').getAttribute('data-solution'),solution,`${width}px ${id} visual state`);
    }

    await page.locator('#top').scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    if(width===1440){
      await page.mouse.move(width*.85,height*.48);
      await page.waitForTimeout(450);
      const beforeMove=await page.locator('#story-canvas').screenshot();
      await page.mouse.move(width*.12,height*.48);
      await page.waitForTimeout(450);
      const afterMove=await page.locator('#story-canvas').screenshot();
      assert.ok(changedPixels(beforeMove,afterMove)>1500,'3D scene should visibly respond over time and pointer motion');
    }
    const toggle=page.getByRole('button',{name:'暂停三维动效'});
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-pressed'),'true');
    if(width===1440){
      await page.waitForTimeout(150);
      const pausedFrame=await page.locator('#story-canvas').screenshot();
      await page.waitForTimeout(300);
      const laterPausedFrame=await page.locator('#story-canvas').screenshot();
      assert.ok(changedPixels(pausedFrame,laterPausedFrame)<100,'paused 3D scene should stop changing');
    }
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-pressed'),'false');

    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0,`${width}px overflow`);
    assert.deepEqual(await page.evaluate(()=>[...document.images].filter(image=>!image.naturalWidth).map(image=>image.src)),[]);
    assert.deepEqual(errors,[]);

    const png=PNG.sync.read(await page.locator('#story-canvas').screenshot());
    let lit=0;
    for(let i=0;i<png.data.length;i+=4){
      const [r,g,b]=png.data.subarray(i,i+3);
      if(Math.max(r,g,b)>90&&Math.max(r,g,b)-Math.min(r,g,b)>16)lit++;
    }
    assert.ok(lit>(width===390?300:1000),`${width}px canvas is blank (${lit} colored pixels)`);
    if(width===1440||width===390){
      for(const id of ['top','collaboration','technology','evidence','people']){
        await page.locator(`#${id}`).evaluate(element=>element.scrollIntoView({block:'start'}));
        await page.waitForTimeout(700);
        await page.screenshot({path:`${screenshotDir}/current-${width}-${id}.png`});
      }
    }
    console.log(`${width}px: phases, controls, images, overflow and canvas passed`);
    await page.close();
  }

  const reduced=await browser.newPage({viewport:{width:1024,height:768},reducedMotion:'reduce'});
  await reduced.goto('http://127.0.0.1:5188/design-preview.html',{waitUntil:'networkidle'});
  assert.equal(await reduced.locator('.story-world').getAttribute('data-motion'),'reduced');
  assert.equal(await reduced.locator('.story-line').first().evaluate(element=>getComputedStyle(element).opacity),'1');
  await reduced.close();
  console.log('Reduced motion passed');

  for(const [width,height] of [[1440,900],[390,844]]){
    const page=await browser.newPage({viewport:{width,height}});
    for(const hash of ['#evidence','#people']){
      await page.goto(`http://127.0.0.1:5188/design-preview.html${hash}`,{waitUntil:'networkidle'});
      const geometry=await page.evaluate(id=>({
        titleTop:document.querySelector(`#${id} h2`).getBoundingClientRect().top,
        headerHeight:document.getElementById('site-header').getBoundingClientRect().height,
        headerLight:document.getElementById('site-header').classList.contains('is-light'),
      }),hash.slice(1));
      assert.ok(geometry.titleTop>=geometry.headerHeight&&geometry.titleTop<height,`${width}px ${hash} title should be visible below header`);
      assert.ok(geometry.headerLight,`${width}px ${hash} should use light header`);
    }
    await page.close();
  }
  console.log('Direct anchors passed');

  const historyPage=await browser.newPage({viewport:{width:1440,height:900}});
  await historyPage.goto('http://127.0.0.1:5188/design-preview.html',{waitUntil:'networkidle'});
  await historyPage.locator('.site-header nav a[href="#evidence"]').click();
  assert.equal(new URL(historyPage.url()).hash,'#evidence');
  await historyPage.waitForFunction(()=>document.getElementById('site-header').classList.contains('is-light'));
  await historyPage.goBack({waitUntil:'networkidle'});
  assert.equal(new URL(historyPage.url()).hash,'');
  await historyPage.waitForFunction(()=>!document.getElementById('site-header').classList.contains('is-light'));
  await historyPage.close();
  console.log('Navigation history passed');

  const revealPage=await browser.newPage({viewport:{width:1440,height:900}});
  await revealPage.goto('http://127.0.0.1:5188/design-preview.html',{waitUntil:'networkidle'});
  const titleY=await revealPage.locator('#people h2').evaluate(element=>element.getBoundingClientRect().top+scrollY);
  await revealPage.evaluate(y=>scrollTo(0,y),titleY-900*.96);
  await revealPage.waitForTimeout(550);
  const before=Number(await revealPage.locator('#people h2').evaluate(element=>getComputedStyle(element).opacity));
  await revealPage.evaluate(y=>scrollTo(0,y),titleY-900*.35);
  await revealPage.waitForTimeout(700);
  const after=Number(await revealPage.locator('#people h2').evaluate(element=>getComputedStyle(element).opacity));
  assert.ok(before<.8&&after>.95,`team heading should reveal with scroll (${before} -> ${after})`);
  await revealPage.close();
  console.log('Lower-story typography reveal passed');
}finally{
  await browser.close();
}
