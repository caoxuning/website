import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from '@playwright/test';
import {PNG} from 'pngjs';

const root=resolve(process.env.PACKAGE_ROOT||'dist');
await access(resolve(root,'index.html'));
await access(resolve(root,'START_HERE.cmd'));
await access(resolve(root,'preview-server.ps1'));
for(const obsolete of ['legacy.html','design-preview.html','cell-film.mp4','scene-analysis.png','scene-atlas.png']){
  await assert.rejects(access(resolve(root,obsolete)),undefined,`${obsolete} should not be in the current package`);
}

const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
let server;
try{
  const filePage=await browser.newPage();
  await filePage.goto(pathToFileURL(resolve(root,'index.html')).href);
  assert.match(await filePage.locator('body').innerText(),/START_HERE\.cmd/);
  await filePage.close();

  server=spawn('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',resolve(root,'preview-server.ps1'),'-NoBrowser'],{windowsHide:true});
  const url=await new Promise((resolveUrl,reject)=>{
    let output='';
    const timer=setTimeout(()=>reject(new Error(`Preview server did not start: ${output}`)),10000);
    server.stdout.on('data',data=>{
      output+=data.toString();
      const match=output.match(/http:\/\/127\.0\.0\.1:\d+\//);
      if(match){clearTimeout(timer);resolveUrl(match[0]);}
    });
    server.stderr.on('data',data=>{output+=data.toString();});
    server.on('exit',code=>{clearTimeout(timer);reject(new Error(`Preview server exited ${code}: ${output}`));});
  });
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const response=await page.goto(url,{waitUntil:'networkidle'});
  assert.equal(response.status(),200);
  assert.match(await page.locator('h1').innerText(),/cartabio/);
  assert.equal(await page.locator('.story-world').evaluate(element=>getComputedStyle(element).backgroundColor),'rgb(17, 22, 24)');
  assert.deepEqual(await page.evaluate(()=>[...document.images].filter(image=>!image.naturalWidth).map(image=>image.src)),[]);
  const canvas=PNG.sync.read(await page.locator('#story-canvas').screenshot());
  let colored=0;
  for(let i=0;i<canvas.data.length;i+=4){
    const [r,g,b]=canvas.data.subarray(i,i+3);
    if(Math.max(r,g,b)>90&&Math.max(r,g,b)-Math.min(r,g,b)>16)colored++;
  }
  assert.ok(colored>1000,`offline 3D canvas is blank (${colored} colored pixels)`);
  assert.deepEqual(errors,[]);
  await page.screenshot({path:'test-results/offline-home.png'});
  assert.equal((await page.goto(`${url}legacy.html`)).status(),404);
  assert.equal((await page.goto(`${url}design-preview.html`)).status(),404);
  await page.close();
  console.log(`Offline launcher serves the current homepage at ${url}`);
}finally{
  if(server)server.kill();
  await browser.close();
}
