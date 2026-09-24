import {chromium} from '@playwright/test';

const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-webgl','--use-angle=d3d11']});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
try{
  await page.goto('http://127.0.0.1:5188/#home',{waitUntil:'networkidle'});
  await page.addStyleTag({content:'.specimen-label { display: none !important; }'});
  for(const [section,canvas,file,progress] of [
    ['#perspective','#network-scene','public/scene-network.png',.32],
    ['#computation','#atlas-scene','public/scene-atlas.png',.20],
    ['#platform','#analysis-scene','public/scene-analysis.png',.20],
  ]){
    await page.locator(section).evaluate((el,value)=>scrollTo({top:el.offsetTop+el.offsetHeight*value,behavior:'instant'}),progress);
    await page.waitForTimeout(300);
    await page.locator(canvas).screenshot({path:file});
  }
}finally{await browser.close();}
