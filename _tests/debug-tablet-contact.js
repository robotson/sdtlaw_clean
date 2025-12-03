const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });

  await page.goto('http://localhost:9753/');
  await page.waitForLoadState('networkidle');

  // Click first attorney card
  await page.click('.sdt-team__card');
  await page.waitForTimeout(500);

  // Find the contact text elements and get their computed styles
  const styles = await page.evaluate(() => {
    const overlay = document.querySelector('.bio-portal--visible');
    if (!overlay) return { error: 'no overlay' };

    // Get all .sdt-text elements in the overlay's contact area
    const contactRows = overlay.querySelectorAll('.bio-panel__contact-row');
    const allSdtText = overlay.querySelectorAll('.sdt-text');

    const results = {
      overlayClasses: overlay.className,
      contactRowCount: contactRows.length,
      sdtTextCount: allSdtText.length,
      contactTexts: []
    };

    // Check each contact row
    contactRows.forEach((row, i) => {
      const sdtText = row.querySelector('.sdt-text');
      if (sdtText) {
        const cs = window.getComputedStyle(sdtText);
        results.contactTexts.push({
          index: i,
          text: sdtText.textContent?.substring(0, 40),
          classes: sdtText.className,
          rowClasses: row.className,
          fontSize: cs.fontSize,
          lineHeight: cs.lineHeight,
          fontFamily: cs.fontFamily?.substring(0, 40)
        });
      }
    });

    // Also check for the specific framer classes
    const framerContainers = ['.framer-go17s5', '.framer-fly4qh', '.framer-1cexlgh'];
    results.framerContainers = {};
    framerContainers.forEach(sel => {
      const el = overlay.querySelector(sel);
      if (el) {
        const sdtText = el.querySelector('.sdt-text');
        if (sdtText) {
          const cs = window.getComputedStyle(sdtText);
          results.framerContainers[sel] = {
            text: sdtText.textContent?.substring(0, 30),
            fontSize: cs.fontSize
          };
        }
      }
    });

    return results;
  });

  console.log(JSON.stringify(styles, null, 2));

  await browser.close();
})();
