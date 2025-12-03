const { chromium } = require('playwright');

(async () => {
  // Check baseline first
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  await page.goto('http://localhost:9753/_baseline/');
  await page.waitForLoadState('networkidle');

  // Scroll to team
  await page.evaluate(() => {
    const team = document.querySelector('#team');
    if (team) team.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(300);

  // Click Tammy's card
  await page.click('.framer-74g9dq', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);

  // Get styles from baseline
  const baselineStyles = await page.evaluate(() => {
    const overlay = document.querySelector('.bio-portal--visible');
    if (!overlay) return { error: 'no overlay' };

    const results = {};

    // Get all paragraph text in bio content area
    const bioParagraphs = overlay.querySelectorAll('.framer-1tylomn p.sdt-text');
    if (bioParagraphs.length > 0) {
      const p = bioParagraphs[0];
      const cs = window.getComputedStyle(p);
      results.bioParagraph = {
        class: p.className,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        margin: cs.margin
      };
    }

    // Get biography heading (h5)
    const bioHeading = overlay.querySelector('h5');
    if (bioHeading) {
      const cs = window.getComputedStyle(bioHeading);
      results.bioHeading = {
        class: bioHeading.className,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight
      };
    }

    // Get name heading
    const nameHeading = overlay.querySelector('h2, .sdt-bio-name');
    if (nameHeading) {
      const cs = window.getComputedStyle(nameHeading);
      results.nameHeading = {
        class: nameHeading.className,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight
      };
    }

    return results;
  });

  console.log('BASELINE:');
  console.log(JSON.stringify(baselineStyles, null, 2));

  await browser.close();

  // Now check current
  const browser2 = await chromium.launch({ headless: true });
  const page2 = await browser2.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  await page2.goto('http://localhost:9753/');
  await page2.waitForLoadState('networkidle');

  // Scroll to team
  await page2.evaluate(() => {
    const team = document.querySelector('#team');
    if (team) team.scrollIntoView({ behavior: 'instant' });
  });
  await page2.waitForTimeout(300);

  // Click Tammy's card
  await page2.click('.framer-74g9dq', { timeout: 5000 }).catch(() => {});
  await page2.waitForTimeout(500);

  // Get styles from current
  const currentStyles = await page2.evaluate(() => {
    const overlay = document.querySelector('.bio-portal--visible');
    if (!overlay) return { error: 'no overlay' };

    const results = {};

    const bioParagraphs = overlay.querySelectorAll('.framer-1tylomn p.sdt-text');
    if (bioParagraphs.length > 0) {
      const p = bioParagraphs[0];
      const cs = window.getComputedStyle(p);
      results.bioParagraph = {
        class: p.className,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        margin: cs.margin
      };
    }

    const bioHeading = overlay.querySelector('h5');
    if (bioHeading) {
      const cs = window.getComputedStyle(bioHeading);
      results.bioHeading = {
        class: bioHeading.className,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight
      };
    }

    const nameHeading = overlay.querySelector('h2, .sdt-bio-name');
    if (nameHeading) {
      const cs = window.getComputedStyle(nameHeading);
      results.nameHeading = {
        class: nameHeading.className,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight
      };
    }

    return results;
  });

  console.log('\nCURRENT:');
  console.log(JSON.stringify(currentStyles, null, 2));

  await browser2.close();
})();
