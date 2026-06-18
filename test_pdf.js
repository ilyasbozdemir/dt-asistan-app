const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('file://d:/Github/ilyas-bozdemir/dt-desktop-app/resources/templates/1-ihtiyac-tespiti-ve-baslangic/ihtiyac-listesi/index.html');
  await new Promise(r => setTimeout(r, 2000)); // wait for pagedjs
  await page.pdf({
    path: 'C:/Users/ilyas bozdemir/.gemini/antigravity-ide/brain/13376cca-ea8d-4276-978a-246037229d73/test.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  await browser.close();
})();
