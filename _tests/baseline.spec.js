// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Baseline tests - captures the frozen _baseline/index.html
 *
 * These snapshots should ONLY be updated when regenerating from the
 * frozen baseline HTML with: npm run test:update-baseline
 *
 * The baseline represents the "known good" state that the current
 * site should match. If these tests fail, it means the current site
 * has diverged from the baseline.
 */

// Attorney data for bio overlay tests
const attorneys = [
  { id: '1kq6r0t', name: 'Tammy' },
  { id: 'a2aut', name: 'Heidi' },
  { id: '1175ksh', name: 'Phyllis' },
];

/**
 * Helper: Find and return the first visible element matching selector
 */
async function findVisible(page, selector) {
  const elements = page.locator(selector);
  const count = await elements.count();
  for (let i = 0; i < count; i++) {
    const el = elements.nth(i);
    if (await el.isVisible()) {
      return el;
    }
  }
  return null;
}

/**
 * Helper: Scroll to the visible team section
 */
async function scrollToTeam(page) {
  const teamSection = await findVisible(page, '#team');
  if (teamSection) {
    await teamSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    return true;
  }
  await page.evaluate(() => {
    const teams = document.querySelectorAll('#team');
    for (const team of teams) {
      if (team.offsetWidth > 0 && team.offsetHeight > 0) {
        team.scrollIntoView({ behavior: 'instant', block: 'start' });
        return;
      }
    }
  });
  await page.waitForTimeout(500);
  return true;
}

/**
 * Helper: Scroll to the footer
 */
async function scrollToFooter(page) {
  const footer = await findVisible(page, '.sdt-footer');
  if (footer) {
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    return true;
  }
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(500);
  return true;
}

/**
 * Helper: Open an attorney's bio overlay
 */
async function openBioOverlay(page, attorneyId) {
  const cardSelector = `.framer-${attorneyId}-container .framer-74g9dq`;
  const card = await findVisible(page, cardSelector);
  if (card) {
    await card.click();
    await page.waitForTimeout(1000);
    return true;
  }
  return false;
}

/**
 * Helper: Navigate to the firm section by clicking the "Our Firm" link
 */
async function navigateToFirm(page) {
  const firmLink = await findVisible(page, 'a[href="#firm"]');
  if (firmLink) {
    await firmLink.click();
    await page.waitForTimeout(800); // Wait for smooth scroll animation
    // Ensure we're actually at the firm section
    const firmSection = await findVisible(page, '#firm');
    if (firmSection) {
      await firmSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
    return true;
  }
  return false;
}

test.describe('Baseline Snapshots (from _baseline/index.html)', () => {

  test.describe('Page States', () => {

    test('hero section', async ({ page }) => {
      await page.goto('/_baseline/');
      await page.waitForLoadState('networkidle');
      await page.waitForFunction(() => document.fonts.ready);
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('baseline-hero.png', { fullPage: false });
    });

    test('team section', async ({ page }) => {
      await page.goto('/_baseline/');
      await page.waitForLoadState('networkidle');
      await page.waitForFunction(() => document.fonts.ready);
      await scrollToTeam(page);

      await expect(page).toHaveScreenshot('baseline-team.png', { fullPage: false });
    });

    test('footer section', async ({ page }) => {
      await page.goto('/_baseline/');
      await page.waitForLoadState('networkidle');
      await page.waitForFunction(() => document.fonts.ready);
      await scrollToFooter(page);

      await expect(page).toHaveScreenshot('baseline-footer.png', { fullPage: false });
    });

    test('firm section via navigation', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === 'phone', 'Desktop and tablet only');
      
      await page.goto('/_baseline/');
      await page.waitForLoadState('networkidle');
      await page.waitForFunction(() => document.fonts.ready);
      await page.waitForTimeout(500);
      await navigateToFirm(page);

      await expect(page).toHaveScreenshot('baseline-firm-navigation.png', { fullPage: false });
    });
  });

  test.describe('Bio Overlays', () => {
    for (const attorney of attorneys) {
      test(`${attorney.name} bio overlay`, async ({ page }) => {
        await page.goto('/_baseline/');
        await page.waitForLoadState('networkidle');
        await page.waitForFunction(() => document.fonts.ready);
        await scrollToTeam(page);
        await openBioOverlay(page, attorney.id);

        await expect(page).toHaveScreenshot(`baseline-bio-${attorney.name.toLowerCase()}.png`, { fullPage: false });
      });
    }
  });

  test.describe('Phone Menu', () => {
    test('hamburger menu open', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'phone', 'Phone only');

      await page.goto('/_baseline/');
      await page.waitForLoadState('networkidle');
      await page.waitForFunction(() => document.fonts.ready);

      const menuToggle = await findVisible(page, '.sdt-menu-toggle');
      if (menuToggle) {
        await menuToggle.click();
        await page.waitForTimeout(500);
      }

      await expect(page).toHaveScreenshot('baseline-menu-open.png', { fullPage: false });
    });
  });
});

/**
 * Comparison tests - verify current site matches baseline
 *
 * These tests take screenshots of the CURRENT site and compare them
 * against the baseline snapshots. This catches regressions.
 */
test.describe('Current vs Baseline Comparison', () => {

  test('hero matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => document.fonts.ready);
    await page.waitForTimeout(500);

    // Compare current site against baseline snapshot
    await expect(page).toHaveScreenshot('baseline-hero.png', { fullPage: false });
  });

  test('team section matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => document.fonts.ready);
    await scrollToTeam(page);

    await expect(page).toHaveScreenshot('baseline-team.png', { fullPage: false });
  });

  test('footer matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => document.fonts.ready);
    await scrollToFooter(page);

    await expect(page).toHaveScreenshot('baseline-footer.png', { fullPage: false });
  });

  test('firm section via navigation matches baseline', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'phone', 'Desktop and tablet only');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await navigateToFirm(page);

    await expect(page).toHaveScreenshot('baseline-firm-navigation.png', { fullPage: false });
  });

  test('mobile menu matches baseline', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'Phone only');

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => document.fonts.ready);

    const menuToggle = await findVisible(page, '.sdt-menu-toggle');
    if (menuToggle) {
      await menuToggle.click();
      await page.waitForTimeout(500);
    }

    await expect(page).toHaveScreenshot('baseline-menu-open.png', { fullPage: false });
  });

  for (const attorney of attorneys) {
    test(`${attorney.name} bio matches baseline`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForFunction(() => document.fonts.ready);
      await scrollToTeam(page);
      await openBioOverlay(page, attorney.id);

      await expect(page).toHaveScreenshot(`baseline-bio-${attorney.name.toLowerCase()}.png`, { fullPage: false });
    });
  }
});
