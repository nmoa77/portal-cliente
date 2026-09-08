const fs=require('fs');
const path=require('path');

try{
  const file=path.join(__dirname,'meta-report-automation.js');
  let s=fs.readFileSync(file,'utf8');

  const oldMake=`  async function makePdf(data,file){let puppeteer;try{puppeteer=require('puppeteer-core');}catch(_){throw new Error('puppeteer-core não instalado.');}const browser=await puppeteer.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});try{const page=await browser.newPage();await page.setContent(html(data),{waitUntil:'networkidle0',timeout:60000});await page.pdf({path:file,printBackground:true,preferCSSPageSize:true});}finally{await browser.close();}}`;
  const newMake=`  async function makePdf(data,file){let puppeteer;try{puppeteer=require('puppeteer-core');}catch(_){throw new Error('puppeteer-core não instalado.');}const browser=await puppeteer.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});try{const page=await browser.newPage();await page.setViewport({width:1123,height:794,deviceScaleFactor:1});await page.setContent(html(data),{waitUntil:'networkidle0',timeout:60000});await page.screenshot({path:file.replace(/\\.pdf$/i,'.preview.png'),type:'png',clip:{x:0,y:0,width:1123,height:794}});await page.pdf({path:file,printBackground:true,preferCSSPageSize:true});}finally{await browser.close();}}`;
  if(s.includes(oldMake))s=s.replace(oldMake,newMake);

  fs.writeFileSync(file,s,'utf8');
}catch(e){console.warn('[meta-report-preview-sync]',e.message);}
