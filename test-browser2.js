const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => fs.appendFileSync('browser-log.txt', 'LOG: ' + msg.text() + '\n'));
    page.on('pageerror', error => fs.appendFileSync('browser-log.txt', 'ERROR: ' + error.message + '\n'));
    
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle0' });
    
    const html = await page.content();
    fs.writeFileSync('browser-html.txt', html);
    
    await browser.close();
    console.log("Done. Check browser-log.txt and browser-html.txt");
  } catch(e) {
    console.error(e);
  }
})();
