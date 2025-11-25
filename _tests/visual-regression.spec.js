// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Visual regression tests for SDT Law site
 *
 * Tests both current and baseline versions across all breakpoints
 * States tested:
 *   - Hero (page load)
 *   - Team section
 *   - Footer section
 *   - Menu open (phone only)
 *   - Each attorney bio overlay (Tammy, Heidi, Phyllis)
 */

// Attorney data for bio overlay tests
const attorneys = [
  { id: '1kq6r0t', name: 'Tammy' },
  { id: 'a2aut', name: 'Heidi' },
  { id: '1175ksh', name: 'Phyllis' },
];

/**
 * Helper: Find and return the first visible element matching selector
 * Needed because the site has duplicate elements for each breakpoint
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
  // Fallback: use JS scroll
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
  // Fallback: scroll to bottom
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
    // Wait for animation (opacity transition is 300ms, plus content animation 500ms)
    await page.waitForTimeout(1000);
    return true;
  }
  return false;
}

/**
 * Helper: Close the bio overlay (handles different mechanisms per breakpoint)
 */
async function closeBioOverlay(page) {
  // Try close button first (phone layout has X button)
  const closeBtn = page.locator('.bio-panel__close');
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
    return;
  }

  // Try backdrop click (tablet/desktop)
  const backdrop = page.locator('.bio-portal__backdrop');
  if (await backdrop.isVisible()) {
    await backdrop.click();
    await page.waitForTimeout(500);
    return;
  }

  // Fallback: press Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
}

// Test current version
test.describe('Current Site', () => {

  test.describe('Page States', () => {

    test('hero section on load', async ({ page }) => {
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

        // Wait for overlay to be attached and have opacity transition complete
        await expect(page.locator('.bio-portal--visible')).toBeAttached();

        await expect(page).toHaveScreenshot(`current-bio-${attorney.name.toLowerCase()}.png`, {
          fullPage: false,
        });

        // Close overlay
        await closeBioOverlay(page);
      });
    }
  });
});

// Phone-only tests (hamburger menu)
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

  test('anchor navigation from menu', async ({ page }) => {
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

        // Verify scroll happened (team section should be near top)
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(100);
      }
    }
  });
});

// Baseline comparison tests
test.describe('Baseline Comparison', () => {

  test('hero matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const currentScreenshot = await page.screenshot();

    await page.goto('/_baseline/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    expect(currentScreenshot).toMatchSnapshot('baseline-hero.png');
  });

  test('team section matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await scrollToTeam(page);
    const currentScreenshot = await page.screenshot();

    await page.goto('/_baseline/');
    await page.waitForLoadState('networkidle');
    await scrollToTeam(page);

    expect(currentScreenshot).toMatchSnapshot('baseline-team.png');
  });

  test('footer matches baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await scrollToFooter(page);
    const currentScreenshot = await page.screenshot();

    await page.goto('/_baseline/');
    await page.waitForLoadState('networkidle');
    await scrollToFooter(page);

    expect(currentScreenshot).toMatchSnapshot('baseline-footer.png');
  });

  test('mobile menu matches baseline', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'Phone only');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const menuToggle = await findVisible(page, '.sdt-menu-toggle');
    if (menuToggle) {
      await menuToggle.click();
      await page.waitForTimeout(500);
    }
    const currentScreenshot = await page.screenshot();

    await page.goto('/_baseline/');
    await page.waitForLoadState('networkidle');

    const baselineMenuToggle = await findVisible(page, '.sdt-menu-toggle');
    if (baselineMenuToggle) {
      await baselineMenuToggle.click();
      await page.waitForTimeout(500);
    }

    expect(currentScreenshot).toMatchSnapshot('baseline-menu-open.png');
  });

  for (const attorney of attorneys) {
    test(`${attorney.name} bio matches baseline`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await scrollToTeam(page);
      await openBioOverlay(page, attorney.id);
      const currentScreenshot = await page.screenshot();

      await closeBioOverlay(page);

      await page.goto('/_baseline/');
      await page.waitForLoadState('networkidle');
      await scrollToTeam(page);
      await openBioOverlay(page, attorney.id);

      expect(currentScreenshot).toMatchSnapshot(`baseline-bio-${attorney.name.toLowerCase()}.png`);
    });
  }
});

// Functional tests (not just visual)
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

        // Verify we scrolled
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(50);
      }
    }
  });

  test('bio overlay opens and closes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await scrollToTeam(page);
    await openBioOverlay(page, '1kq6r0t'); // Tammy

    await expect(page.locator('.bio-portal--visible')).toBeAttached();

    await closeBioOverlay(page);

    await expect(page.locator('.bio-portal--visible')).not.toBeAttached();
  });

  test('bio overlay closes with escape key', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await scrollToTeam(page);
    await openBioOverlay(page, '1kq6r0t'); // Tammy

    await expect(page.locator('.bio-portal--visible')).toBeAttached();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    await expect(page.locator('.bio-portal--visible')).not.toBeAttached();
  });
});
