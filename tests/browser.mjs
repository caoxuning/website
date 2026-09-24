import {chromium} from '@playwright/test';
import {PNG} from 'pngjs';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';

const output=path.resolve('test-results/deck');
await mkdir(output,{recursive:true});
const hardware=process.env.PLAYWRIGHT_USE_GPU==='1';
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:hardware?['--enable-webgl','--use-angle=d3d11']:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const result={environment:hardware?'D3D11 hardware requested':'SwiftShader software',viewports:[],errors:[],checks:[]};
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
page.on('pageerror',error=>result.errors.push(error.message));
const panel=()=>page.locator('body').getAttribute('data-active-panel');
const settle=()=>page.waitForFunction(()=>document.body.dataset.transitioning==='false');
const navigate=async(id)=>{await page.locator(`.deck-rail a[href="#${id}"]`).click();await settle();};
// Locator screenshots include overlapping chrome; hide it for canvas-only pixel checks.
const canvasFrame=locator=>locator.screenshot({style:'.header,.chapter-inner,.hero-actions,.hero-bottom,.specimen-label,.visual-caption,.scene-controls,.deck-rail,.section-top,.science-heading,.solution-grid,.technology-pulse,.spatial-controls,.data-deliverables,.analysis-sidebar,.technical-foundation,.analysis-next{visibility:hidden!important}'});
function differences(a,b){
  const first=PNG.sync.read(a),second=PNG.sync.read(b);let changed=0;
  for(let i=0;i<first.data.length;i+=4){if(Math.abs(first.data[i]-second.data[i])+Math.abs(first.data[i+1]-second.data[i+1])+Math.abs(first.data[i+2]-second.data[i+2])>8)changed++;}
  return changed;
}
function foreground(buffer,bg){
  const pixels=PNG.sync.read(buffer);let visible=0;
  for(let i=0;i<pixels.data.length;i+=4){if(Math.abs(pixels.data[i]-bg[0])+Math.abs(pixels.data[i+1]-bg[1])+Math.abs(pixels.data[i+2]-bg[2])>40)visible++;}
  return visible;
}
function assertFramed(buffer,label){
  const {width,height,data}=PNG.sync.read(buffer);
  let left=width,right=0,top=height,bottom=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=(y*width+x)*4;
    if(Math.abs(data[i]-17)+Math.abs(data[i+1]-22)+Math.abs(data[i+2]-24)<70)continue;
    left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  assert.ok(left>4&&right<width-4&&top>4&&bottom<height-4,`${label}: scene cropped (${left},${top})-(${right},${bottom}) in ${width}x${height}`);
}
try{
  await page.goto('http://127.0.0.1:5188/',{waitUntil:'networkidle'});
  await page.waitForSelector('.scene-sticky.is-ready');
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(600);
  assert.ok(await page.locator('body').evaluate(el=>el.classList.contains('deck-mode')));
  assert.equal(await page.locator('[data-panel][data-tone="dark"]').count(),6,'all chapters share a visual tone');
  assert.equal(await page.locator('.focus-marker').count(),4,'the focus-cell identity is repeated through the scientific story');
  for(const id of ['cell-scene','network-scene','atlas-scene','analysis-scene']){
    assert.equal(await page.locator(`#${id}`).evaluate(el=>!!el.getContext('webgl2')),true,`${id} is rendered in 3D`);
  }
  await page.screenshot({path:path.join(output,'desktop-hero.png')});
  const one=await canvasFrame(page.locator('#cell-scene'));
  await page.waitForTimeout(600);
  const moving=differences(one,await canvasFrame(page.locator('#cell-scene')));
  assert.ok(foreground(one,[17,22,24])>10000);
  assert.ok(moving>100);
  result.checks.push({heroAnimatedPixels:moving});

  await page.mouse.move(700,450);
  await page.evaluate(()=>{window.__wheelTrace=[];addEventListener('wheel',e=>window.__wheelTrace.push({t:performance.now(),y:e.deltaY,panel:document.body.dataset.activePanel}),{passive:true});});
  // Keep the accumulation pair within one browser frame: slow CDP round-trips
  // can otherwise turn it into two separate gestures in software WebGL.
  await page.evaluate(()=>{
    dispatchEvent(new WheelEvent('wheel',{deltaY:120,cancelable:true}));
    requestAnimationFrame(()=>dispatchEvent(new WheelEvent('wheel',{deltaY:240,cancelable:true})));
  });
  await page.waitForTimeout(120);
  assert.equal(await page.evaluate(()=>window.__wheelTrace[0].panel),'0','below-threshold motion must not navigate');
  assert.equal(await page.locator('body').getAttribute('data-transitioning'),'true',JSON.stringify(await page.evaluate(()=>({events:window.__wheelTrace,panel:document.body.dataset.activePanel}))));
  assert.notEqual(await page.locator('#home').evaluate(el=>getComputedStyle(el).transform),'none');
  await page.screenshot({path:path.join(output,'transition-in-progress.png')});
  await settle();
  assert.equal(await panel(),'1','accumulated threshold advances one panel');
  assert.equal(await page.evaluate(()=>scrollY),0);
  assert.equal(await page.locator('#home').evaluate(el=>el.inert),true);
  await page.screenshot({path:path.join(output,'desktop-network.png')});
  const network=await canvasFrame(page.locator('#network-scene'));
  await page.waitForTimeout(600);
  assert.ok(differences(network,await canvasFrame(page.locator('#network-scene')))>50);
  assert.equal(await page.locator('#cell-scene').isVisible(),false,'hero stays in its module');
  const cycleStatus=await page.evaluate(()=>new Promise(resolve=>{
    const caption=document.querySelector('#cycle-round');
    const observer=new MutationObserver(()=>{
      observer.disconnect();
      resolve({title:document.querySelector('#cycle-title').textContent,label:caption.textContent});
    });
    observer.observe(caption,{childList:true});
  }));
  assert.ok(cycleStatus.title.length>4,'SAFE technical cue updates with the animated process');
  assert.match(cycleStatus.label,/ROUND 0[1-2]/);
  const cycleLabel=await page.locator('#cycle-round').textContent();
  await page.waitForFunction(label=>document.querySelector('#cycle-round').textContent!==label,cycleLabel,{timeout:12000});
  assert.notEqual(await page.locator('#cycle-title').textContent(),cycleStatus.title);
  await page.locator('#motion-toggle').click();
  const pausedCycle=await page.locator('#cycle-round').textContent();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('#cycle-round').textContent(),pausedCycle);
  await page.locator('#motion-toggle').click();
  result.checks.push('SAFE technical cue advances with the scene and obeys global pause');

  await page.mouse.wheel(0,360);
  await page.evaluate(async()=>{
    for(let i=0;i<14;i++){
      await new Promise(resolve=>setTimeout(resolve,80));
      dispatchEvent(new WheelEvent('wheel',{deltaY:100,cancelable:true}));
    }
  });
  await settle();
  assert.equal(await panel(),'2','momentum never skips a second panel');
  await page.screenshot({path:path.join(output,'desktop-computation.png')});
  const atlas=await canvasFrame(page.locator('#atlas-scene'));
  await page.waitForTimeout(500);
  assert.ok(differences(atlas,await canvasFrame(page.locator('#atlas-scene')))>50);
  await page.locator('#motion-toggle').click();
  const still=await canvasFrame(page.locator('#atlas-scene'));
  await page.waitForTimeout(400);
  assert.ok(still.equals(await canvasFrame(page.locator('#atlas-scene'))));
  await page.locator('#motion-toggle').click();
  await page.waitForTimeout(600);
  await page.mouse.wheel(0,-360);
  await settle();
  assert.equal(await panel(),'1','reverse scrolling returns one panel');
  result.checks.push('threshold, inertia latch, reverse, inactive panels inert, independent moving graphics, global pause');

  await navigate('platform');
  await page.screenshot({path:path.join(output,'desktop-platform.png')});
  await page.locator('#motion-toggle').click();
  const singleCell=await canvasFrame(page.locator('#analysis-scene'));
  await page.getByRole('tab',{name:/空间邻域/}).click();
  assert.equal(await page.locator('#panel-title').textContent(),'空间邻域，保留位置关系。');
  assert.ok(differences(singleCell,await canvasFrame(page.locator('#analysis-scene')))>100,'ROI changes actual WebGL pixels even while ambient motion is paused');
  await page.getByRole('tab',{name:/空间邻域/}).press('ArrowDown');
  assert.equal(await page.getByRole('tab',{name:/组织区域/}).getAttribute('aria-selected'),'true');
  assert.equal(await panel(),'3','tab keyboard navigation does not change deck');
  await page.getByRole('tab',{name:/细胞特征/}).click();
  await page.locator('#motion-toggle').click();
  const analysisFrame=await canvasFrame(page.locator('#analysis-scene'));
  await page.waitForTimeout(500);
  assert.ok(differences(analysisFrame,await canvasFrame(page.locator('#analysis-scene')))>50);
  await navigate('research');
  await page.screenshot({path:path.join(output,'desktop-research.png')});
  await navigate('inquiry');
  await page.screenshot({path:path.join(output,'desktop-inquiry.png')});
  await page.locator('.collaboration-band [data-contact]').click();
  assert.equal(await page.locator('#contact-dialog').evaluate(el=>getComputedStyle(el).color),'rgb(28, 51, 61)','dialog text retains readable contrast');
  await page.mouse.wheel(0,-500);
  assert.equal(await panel(),'5','dialog scroll cannot navigate background');
  await page.locator('[name=name]').fill('Preview Tester');
  await page.locator('[name=email]').fill('preview@example.com');
  await page.locator('[name=message]').fill('Cellular context and computational biology.');
  const download=page.waitForEvent('download');
  await page.locator('.submit-button').click();
  assert.equal((await download).suggestedFilename(),'cartabio-conversation.txt');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#contact-dialog').isVisible(),false);
  await page.locator('#inquiry').focus();
  await page.keyboard.press('PageUp');await settle();
  assert.equal(await panel(),'4');
  await page.keyboard.press('Home');await settle();
  assert.equal(await panel(),'0');
  await navigate('platform');
  await page.goBack();await settle();
  assert.equal(await panel(),'0','browser Back restores section');
  result.checks.push('tabs, keyboard navigation, modal scroll isolation, draft download, browser Back');

  for(const [width,height] of [[1920,1080],[1440,900],[1024,768]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(350);
    for(const id of ['home','perspective','computation','platform','research','inquiry']){
      await navigate(id);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      assert.equal(overflow,0,`${width} ${id}: horizontal overflow`);
      const clipped=await page.locator(`#${id}`).evaluate(el=>el.scrollHeight-el.clientHeight);
      if(id==='inquiry')assert.ok(clipped>2,`${width} ${id}: final chapter must expose its full reading surface`);
      else assert.ok(clipped<=2,`${width} ${id}: vertical content clipped by ${clipped}`);
      const scientificCanvas=page.locator(`#${id} canvas`);
      if(await scientificCanvas.count()){
        const pixels=await canvasFrame(scientificCanvas);
        assert.ok(foreground(pixels,[17,22,24])>2500,`${width} ${id}: nonblank 3D scene`);
        assertFramed(pixels,`${width} ${id}`);
      }
      const broken=await page.locator(`#${id} img`).evaluateAll(images=>images.filter(image=>getComputedStyle(image).visibility!=='hidden'&&(!image.complete||!image.naturalWidth)).length);
      assert.equal(broken,0,`${width} ${id}: image assets must load`);
      if(width===1024)await page.screenshot({path:path.join(output,`1024-${id}.png`)});
    }
    await navigate('home');
    const canvasPixels=foreground(await canvasFrame(page.locator('#cell-scene')),[17,22,24]);
    assert.ok(canvasPixels>5000);
    await page.screenshot({path:path.join(output,`viewport-${width}.png`)});
    result.viewports.push({width,height,horizontalOverflow:0,panelsWithoutClipping:6,canvasPixels});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForTimeout(150);
  const reducedFrame=await canvasFrame(page.locator('#cell-scene'));
  await page.waitForTimeout(300);
  assert.ok(reducedFrame.equals(await canvasFrame(page.locator('#cell-scene'))));
  await navigate('perspective');
  assert.equal(await panel(),'1');
  assert.equal(await page.locator('body').getAttribute('data-transitioning'),'false');
  result.checks.push('reduced-motion freezes graphics and makes transitions immediate');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await navigate('home');
  for(const [width,height] of [[390,844],[800,900],[1280,600]]){
    await page.setViewportSize({width,height});
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await page.waitForTimeout(600);
    assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('deck-mode')),false);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0);
    assert.equal(await page.locator('[data-panel][inert]').count(),0);
    const canvasPixels=foreground(await canvasFrame(page.locator('#cell-scene')),[17,22,24]);
    assert.ok(canvasPixels>5000);
    await page.screenshot({path:path.join(output,`viewport-${width}.png`)});
    if(width===390){
      await page.screenshot({path:path.join(output,'mobile-full.png'),fullPage:true});
      for(const id of ['computation','platform']){
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();await page.waitForTimeout(500);
        const pixels=await canvasFrame(page.locator(`#${id} canvas`));
        assert.ok(foreground(pixels,[17,22,24])>1500);
        assertFramed(pixels,`390 ${id}`);
        await page.screenshot({path:path.join(output,`mobile-${id}.png`)});
      }
    }
    result.viewports.push({width,height,horizontalOverflow:0,nativeScroll:true,canvasPixels});
  }
  await page.locator('#inquiry').scrollIntoViewIfNeeded();
  await page.waitForTimeout(450);
  assert.equal(await panel(),'5');
  await page.setViewportSize({width:1024,height:768});await settle();
  assert.equal(await panel(),'5','resize into deck preserves the current section');
  await page.goto('http://127.0.0.1:5188/#computation',{waitUntil:'networkidle'});
  assert.equal(await panel(),'2','deep links open the selected section');
  await navigate('home');
  await page.evaluate(()=>document.querySelector('#cell-scene').dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
  assert.equal(await page.locator('.scene-sticky').getAttribute('data-fallback'),'true');
  result.checks.push('native scrolling on mobile and short windows; WebGL fallback');
  result.checks.push('six chapters, shared dark tone, repeated focus identity, four WebGL scenes verified on desktop/mobile');
  assert.deepEqual(result.errors,[]);
  await writeFile(path.join(output,'verification.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
