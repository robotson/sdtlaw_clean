// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Current site tests - captures the state of the working index.html
 *
 * These snapshots represent the "current" state and can be updated
 * freely during development with: npm run test:update-current
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
 * Helper: Close the bio overlay
 */
async function closeBioOverlay(page) {
  const closeBtn = page.locator('.bio-panel__close');
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
    return;
  }

  const backdrop = page.locator('.bio-portal__backdrop');
  if (await backdrop.isVisible()) {
    await backdrop.click();
    await page.waitForTimeout(500);
    return;
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

test.describe('Current Site Snapshots', () => {

  test.describe('Page States', () => {

    test('hero section', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('current-hero.png', {
        fullPage: false,
      });
    });

    test('team section', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await scrollToTeam(page);

      await expect(page).toHaveScreenshot('current-team.png', {
        fullPage: false,
      });
    });

    test('footer section', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await scrollToFooter(page);

      await expect(page).toHaveScreenshot('current-footer.png', {
        fullPage: false,
      });
    });
  });

  test.describe('Bio Overlays', () => {
    for (const attorney of attorneys) {
      test(`${attorney.name} bio overlay`, async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await scrollToTeam(page);
        await openBioOverlay(page, attorney.id);

        await expect(page.locator('.bio-portal--visible')).toBeAttached();
        
        // Wait for the dialog to have animate-in class (for phone breakpoint)
        await page.waitForFunction(() => {
          const dialog = document.querySelector('.bio-portal--visible [role="dialog"]');
          return dialog && dialog.classList.contains('animate-in');
        }, { timeout: 2000 }).catch(() => {
          // If no dialog found or class not added, that's okay - continue
        });

        await expect(page).toHaveScreenshot(`current-bio-${attorney.name.toLowerCase()}.png`, {
          fullPage: false,
        });

        await closeBioOverlay(page);
      });
    }
  });

  test.describe('Phone Menu', () => {
    test.beforeEach(async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'phone', 'Phone only');
    });

    test('hamburger menu open', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const menuToggle = await findVisible(page, '.sdt-menu-toggle');
      if (menuToggle) {
        await menuToggle.click();
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot('current-menu-open.png', {
          fullPage: false,
        });
      }
    });
  });
});

// Functional tests (not visual)
test.describe('Functional Checks', () => {

  test('all anchor links navigate correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const anchors = ['#firm', '#team'];

    for (const anchor of anchors) {
      const link = await findVisible(page, `a[href="${anchor}"]`);
      if (link) {
        await link.click();
        await page.waitForTimeout(500);

        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(50);
      }
    }
  });

  test('bio overlay opens and closes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await scrollToTeam(page);
    await openBioOverlay(page, '1kq6r0t');

    await expect(page.locator('.bio-portal--visible')).toBeAttached();

    await closeBioOverlay(page);

    await expect(page.locator('.bio-portal--visible')).not.toBeAttached();
  });

  test('bio overlay closes with escape key', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await scrollToTeam(page);
    await openBioOverlay(page, '1kq6r0t');

    await expect(page.locator('.bio-portal--visible')).toBeAttached();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    await expect(page.locator('.bio-portal--visible')).not.toBeAttached();
  });

  test('anchor navigation from phone menu', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'Phone only');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const menuToggle = await findVisible(page, '.sdt-menu-toggle');
    if (menuToggle) {
      await menuToggle.click();
      await page.waitForTimeout(400);

      const teamLink = await findVisible(page, '.framer-lxsbpu a[href="#team"]');
      if (teamLink) {
        await teamLink.click();
        await page.waitForTimeout(800);

        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(100);
      }
    }
  });
});
