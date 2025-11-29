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
// - id: Framer ID (used for baseline tests with frozen HTML)
// - semanticId: Semantic ID (used for comparison tests with current site)
const attorneys = [
  { id: '1kq6r0t', semanticId: 'attorney-tjs', name: 'Tammy' },
  { id: 'a2aut', semanticId: 'attorney-had', name: 'Heidi' },
  { id: '1175ksh', semanticId: 'attorney-pot', name: 'Phyllis' },
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
 * Helper: Open an attorney's bio overlay on the CURRENT site (using semantic IDs)
 */
async function openBioOverlayCurrent(page, semanticId) {
  const cardSelector = `[id="${semanticId}"] .sdt-team__card`;
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

    test('firm section via phone menu navigation', async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'phone', 'Phone only');
      
      await page.goto('/_baseline/');
      await page.waitForLoadState('networkidle');
      await page.waitForFunction(() => document.fonts.ready);

      // Open mobile menu
      const menuToggle = await findVisible(page, '.sdt-menu-toggle, .framer-1080cat');
      if (menuToggle) {
        await menuToggle.click();
        
        // Wait for menu to be visible
        try {
          const menuOverlay = page.locator('.framer-lxsbpu, .sdt-mobile-menu, [data-framer-name="Menu"]').first();
          await menuOverlay.waitFor({ state: 'visible', timeout: 2000 });
        } catch (e) {
          // If menu selector doesn't work, wait for JS to execute
        }
        await page.waitForTimeout(300);
      }

      // Click "Our Firm" link in mobile menu
      // Baseline uses nested links: spans with data-nested-link="true" inside the menu
      // The span has href="#firm" and data-nested-link="true"
      let firmLink = await findVisible(page, '.framer-lxsbpu span[data-nested-link="true"][href="#firm"]');
      if (!firmLink) {
        // Fallback to regular anchor if nested link not found
        firmLink = await findVisible(page, '.framer-lxsbpu a[href="#firm"]');
      }
      if (firmLink) {
        await firmLink.click();
        
        // Wait for smooth scroll animation to complete
        // Wait for scroll position to stabilize (smooth scroll can take 500-1000ms)
        await page.waitForFunction(() => {
          return new Promise((resolve) => {
            let lastScrollY = window.scrollY;
            let stableCount = 0;
            const checkStable = () => {
              const currentScrollY = window.scrollY;
              if (currentScrollY === lastScrollY) {
                stableCount++;
                if (stableCount >= 3) {
                  resolve(true);
                  return;
                }
              } else {
                stableCount = 0;
                lastScrollY = currentScrollY;
              }
              requestAnimationFrame(checkStable);
            };
            checkStable();
            // Timeout after 2 seconds
            setTimeout(() => resolve(true), 2000);
          });
        }, { timeout: 3000 });
        
        // Additional small delay to ensure rendering is stable
        await page.waitForTimeout(200);
      }

      await expect(page).toHaveScreenshot('baseline-firm-navigation-phone-menu.png', { fullPage: false });
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

      // Baseline uses Framer classes: .framer-1080cat for toggle, .framer-lxsbpu for menu
      const menuToggle = await findVisible(page, '.sdt-menu-toggle, .framer-1080cat');
      if (menuToggle) {
        await menuToggle.click();
        
        // Wait for menu to be visible - baseline uses .framer-lxsbpu
        try {
          const menuOverlay = page.locator('.framer-lxsbpu, .sdt-mobile-menu, [data-framer-name="Menu"]').first();
          await menuOverlay.waitFor({ state: 'visible', timeout: 2000 });
        } catch (e) {
          // If menu selector doesn't work, wait for JS to execute
        }
        
        // Wait for any animations to complete (baseline uses same 300ms animation)
        await page.waitForTimeout(500);
        
        // Verify menu is actually visible before screenshot
        const menuVisible = await page.evaluate(() => {
          const menu = document.querySelector('.framer-lxsbpu, .sdt-mobile-menu, [data-framer-name="Menu"]');
          return menu && window.getComputedStyle(menu).display !== 'none';
        });
        
        if (!menuVisible) {
          console.warn('WARNING: Menu may not be visible in baseline - check if Framer JS loaded');
        }
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

  test('firm section via phone menu navigation matches baseline', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'Phone only');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => document.fonts.ready);

    // Open mobile menu
    const menuToggle = await findVisible(page, '.sdt-menu-toggle');
    if (menuToggle) {
      await menuToggle.click();
      
      // Wait for menu to be visible and animation to complete
      const menuOverlay = page.locator('.sdt-mobile-menu');
      await menuOverlay.waitFor({ state: 'visible' });
      
      // Wait for animation to complete
      await page.waitForFunction(() => {
        const menu = document.querySelector('.sdt-mobile-menu');
        return menu && menu.classList.contains('is-open') && !menu.classList.contains('menu-opening');
      }, { timeout: 1000 });
      
      await page.waitForTimeout(100);
    }

    // Click "Our Firm" link in mobile menu
    const firmLink = await findVisible(page, '.sdt-mobile-menu a[href="#firm"]');
    if (firmLink) {
      await firmLink.click();
      
      // Wait for smooth scroll animation to complete
      // Wait for scroll position to stabilize (smooth scroll can take 500-1000ms)
      await page.waitForFunction(() => {
        return new Promise((resolve) => {
          let lastScrollY = window.scrollY;
          let stableCount = 0;
          const checkStable = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY === lastScrollY) {
              stableCount++;
              if (stableCount >= 3) {
                resolve(true);
                return;
              }
            } else {
              stableCount = 0;
              lastScrollY = currentScrollY;
            }
            requestAnimationFrame(checkStable);
          };
          checkStable();
          // Timeout after 2 seconds
          setTimeout(() => resolve(true), 2000);
        });
      }, { timeout: 3000 });
      
      // Additional small delay to ensure rendering is stable
      await page.waitForTimeout(200);
    }

    await expect(page).toHaveScreenshot('baseline-firm-navigation-phone-menu.png', { fullPage: false });
  });

  test('mobile menu matches baseline', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone', 'Phone only');

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => document.fonts.ready);

    const menuToggle = await findVisible(page, '.sdt-menu-toggle');
    if (menuToggle) {
      await menuToggle.click();
      
      // Wait for menu to be visible and animation to complete
      const menuOverlay = page.locator('.sdt-mobile-menu');
      await menuOverlay.waitFor({ state: 'visible' });
      
      // Wait for animation to complete (menu-opening class is removed after 300ms)
      await page.waitForFunction(() => {
        const menu = document.querySelector('.sdt-mobile-menu');
        return menu && menu.classList.contains('is-open') && !menu.classList.contains('menu-opening');
      }, { timeout: 1000 });
      
      // Additional small delay to ensure rendering is stable
      await page.waitForTimeout(100);
    }

    await expect(page).toHaveScreenshot('baseline-menu-open.png', { fullPage: false });
  });

  for (const attorney of attorneys) {
    test(`${attorney.name} bio matches baseline`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForFunction(() => document.fonts.ready);
      await scrollToTeam(page);
      await openBioOverlayCurrent(page, attorney.semanticId);

      await expect(page).toHaveScreenshot(`baseline-bio-${attorney.name.toLowerCase()}.png`, { fullPage: false });
    });
  }
});
