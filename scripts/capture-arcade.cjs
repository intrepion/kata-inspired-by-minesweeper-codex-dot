'use strict';
const {chromium}=require('playwright');const {mkdir,readFile,writeFile,readdir}=require('node:fs/promises');const {createHash}=require('node:crypto');const path=require('node:path');
(async()=>{const output=process.env.CAPTURE_OUTPUT||'/tmp/fieldwork-captures',site=process.env.CAPTURE_SITE||'capture-site';await mkdir(output,{recursive:true});const inputs={};for(const f of ['index.html',...(await readdir(path.join(site,'assets'))).map(x=>'assets/'+x)])inputs[f]=createHash('sha256').update(await readFile(path.join(site,f))).digest('hex');const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1,locale:'en-US',reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4221/',{waitUntil:'domcontentloaded'});await page.addInitScript(() => { let seed=3521; Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296); });
 await page.reload({waitUntil:'domcontentloaded'}); await page.locator('.cell').nth(40).click(); await page.waitForTimeout(300);
 await page.locator('main').screenshot({path:path.join(output,'fieldwork-01.png'),animations:'disabled'});
 await page.locator('[data-difficulty="intermediate"]').click(); await page.locator('.cell').nth(80).click(); await page.waitForTimeout(300);
 await page.locator('main').screenshot({path:path.join(output,'fieldwork-02.png'),animations:'disabled'});
 await writeFile(path.join(output,'capture.json'),JSON.stringify({schemaVersion:1,workflowCommit:process.env.GITHUB_SHA||null,sourceCommit:process.env.GAME_SOURCE_COMMIT||null,runId:process.env.GITHUB_RUN_ID||null,url:'http://127.0.0.1:4221/',inputs,browser:browser.version(),seed:3521,viewport:{width:1280,height:1000},screenshots:['fieldwork-01.png','fieldwork-02.png']},null,2)+'\n');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
