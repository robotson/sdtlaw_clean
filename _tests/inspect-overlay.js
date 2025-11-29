const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  await page.goto('http://localhost:9753/');
  await page.waitForLoadState('networkidle');

  // Scroll to team section
  await page.evaluate(() => {
    const teams = document.querySelectorAll('#team');
    for (const team of teams) {
      if (team.offsetWidth > 0 && team.offsetHeight > 0) {
        team.scrollIntoView({ behavior: 'instant', block: 'start' });
        return;
      }
    }
  });
  await page.waitForTimeout(300);

  // Click Tammy's card
  const card = page.locator('[id="1kq6r0t"] .sdt-team__card, [id="1kq6r0t"] .framer-74g9dq').first();
  await card.click();
  await page.waitForTimeout(500);

  // Check overlay and all ancestors
  const info = await page.evaluate(() => {
    const overlay = document.querySelector('.bio-portal--visible');
    if (!overlay) return { found: false };

    const getStyles = (el) => {
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        classes: (el.className || '').toString().slice(0, 80),
        display: cs.display,
        position: cs.position,
        top: cs.top,
        left: cs.left,
        width: cs.width,
        height: cs.height,
        overflow: cs.overflow
      };
    };

    return {
      overlay: getStyles(overlay),
      overlayParent: getStyles(overlay.parentElement),
      dialog: getStyles(overlay.querySelector('[role="dialog"]')),
      framer185: getStyles(overlay.querySelector('.framer-185jkq1')),
      framer1udf: getStyles(overlay.querySelector('.framer-1udf3gh')),
      framerNis: getStyles(overlay.querySelector('.framer-nis8ht')),
      framer1tylomn: getStyles(overlay.querySelector('.framer-1tylomn'))
    };
  });

  console.log(JSON.stringify(info, null, 2));

  await browser.close();
})();
