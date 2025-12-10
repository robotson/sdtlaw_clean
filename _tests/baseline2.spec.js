// @ts-check
const { test, expect } = require('@playwright/test');

// Temporary gate: keep this harness out of the default test suite unless explicitly enabled.
const ENABLE_BASELINE2 = process.env.ENABLE_BASELINE2 === '1';

if (ENABLE_BASELINE2) {
  /**
   * Harness to compare our second frozen baseline (_baseline2/) against both the
   * original baseline and the current site. Snapshot naming rules:
   *   - baseline-*.png     => original baseline snapshots (already exist)
   *   - baseline2-*.png    => new snapshots generated from _baseline2
   */

  const BASELINE2_ROOT = '/_baseline2/';
  const CURRENT_ROOT = '/';

  const attorneys = [
    { id: '1kq6r0t', semanticId: 'attorney-tjs', name: 'Tammy' },
    { id: 'a2aut', semanticId: 'attorney-had', name: 'Heidi' },
    { id: '1175ksh', semanticId: 'attorney-pot', name: 'Phyllis' },
  ];

  const SECTION_TESTS = [
    { id: 'hero', label: 'hero section' },
    { id: 'team', label: 'team section', prepare: scrollToTeam },
    { id: 'footer', label: 'footer section', prepare: scrollToFooter },
    { id: 'firm-navigation', label: 'firm section via navigation', skipProjects: ['phone'], prepare: navigateToFirm },
    { id: 'firm-navigation-phone-menu', label: 'firm section via phone menu navigation', onlyProjects: ['phone'], prepare: navigateViaPhoneMenu },
    { id: 'menu-open', label: 'mobile menu open', onlyProjects: ['phone'], prepare: openAnyPhoneMenu },
  ];

  // ---------------------------- Helper utilities -----------------------------
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

async function waitForReady(page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

async function loadAndPrepare(page, path, prepareFn) {
  await page.goto(path);
  await waitForReady(page);
  if (prepareFn) {
    await prepareFn(page);
  }
}

async function scrollToTeam(page) {
  const team = await findVisible(page, '#team');
  if (team) {
    await team.scrollIntoViewIfNeeded();
  } else {
    await page.evaluate(() => {
      const nodes = document.querySelectorAll('#team');
      for (const node of nodes) {
        if (node.offsetWidth > 0 && node.offsetHeight > 0) {
          node.scrollIntoView({ behavior: 'instant', block: 'start' });
          break;
        }
      }
    });
  }
  await page.waitForTimeout(400);
}

async function scrollToFooter(page) {
  const footer = await findVisible(page, '.sdt-footer');
  if (footer) {
    await footer.scrollIntoViewIfNeeded();
  } else {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }
  await page.waitForTimeout(400);
}

async function navigateToFirm(page) {
  const link = await findVisible(page, 'a[href="#firm"]');
  if (link) {
    await link.click();
    await waitForScrollToSettle(page);
  }
}

async function waitForScrollToSettle(page) {
  await page.waitForFunction(() => {
    return new Promise((resolve) => {
      let last = window.scrollY;
      let stable = 0;
      const step = () => {
        const current = window.scrollY;
        if (current === last) {
          stable++;
          if (stable >= 3) {
            resolve(true);
            return;
          }
        } else {
          stable = 0;
          last = current;
        }
        requestAnimationFrame(step);
      };
      step();
      setTimeout(() => resolve(true), 2000);
    });
  });
}

async function openAnyPhoneMenu(page) {
  const menuToggle = await findVisible(page, '.sdt-menu-toggle, .framer-1080cat, [data-framer-name="Menu Toggle"]');
  if (menuToggle) {
    await menuToggle.click();
    await page.waitForTimeout(400);
  }
}

async function navigateViaPhoneMenu(page) {
  await openAnyPhoneMenu(page);
  const firmLink = await findVisible(page, '.sdt-mobile-menu a[href="#firm"], .framer-lxsbpu a[href="#firm"]');
  if (firmLink) {
    await firmLink.click();
    await waitForScrollToSettle(page);
    await page.waitForTimeout(200);
  }
}

async function openBioOverlay(page, framerId) {
  const card = await findVisible(page, `.framer-${framerId}-container .framer-74g9dq`);
  if (card) {
    await card.click();
    await page.waitForTimeout(800);
  }
}

async function openBioOverlayCurrent(page, semanticId) {
  const card = await findVisible(page, `[id="${semanticId}"] .sdt-team__card`);
  if (card) {
    await card.click();
    await page.waitForTimeout(800);
  }
}

// ----------------------------- Section runners -----------------------------
function runSectionSuite({ label, path, snapshotPrefix }) {
  test.describe(label, () => {
    for (const section of SECTION_TESTS) {
      test(section.label, async ({ page }, testInfo) => {
        if (section.onlyProjects && !section.onlyProjects.includes(testInfo.project.name)) {
          test.skip(`Only runs on ${section.onlyProjects.join(', ')}`);
        }
        if (section.skipProjects && section.skipProjects.includes(testInfo.project.name)) {
          test.skip(`Skipped on ${testInfo.project.name}`);
        }

        await loadAndPrepare(page, path, section.prepare);
        await expect(page).toHaveScreenshot(`${snapshotPrefix}${section.id}.png`, { fullPage: false });
      });
    }
  });
}

function runBioOverlaySuite({ label, path, snapshotPrefix, opener }) {
  test.describe(label, () => {
    for (const attorney of attorneys) {
      test(`${attorney.name} bio overlay`, async ({ page }) => {
        await loadAndPrepare(page, path, scrollToTeam);
        await opener(page, attorney);
        await expect(page).toHaveScreenshot(`${snapshotPrefix}bio-${attorney.name.toLowerCase()}.png`, { fullPage: false });
      });
    }
  });
}

// ------------------------------- Test Suites -------------------------------
runSectionSuite({
  label: 'Baseline2 Snapshots (/_baseline2/)',
  path: BASELINE2_ROOT,
  snapshotPrefix: 'baseline2-',
});

runSectionSuite({
  label: 'Baseline2 vs Baseline1',
  path: BASELINE2_ROOT,
  snapshotPrefix: 'baseline-',
});

runSectionSuite({
  label: 'Current vs Baseline2',
  path: CURRENT_ROOT,
  snapshotPrefix: 'baseline2-',
});

  runBioOverlaySuite({
    label: 'Baseline2 Bio Snapshots',
    path: BASELINE2_ROOT,
    snapshotPrefix: 'baseline2-',
    opener: async (page, attorney) => openBioOverlay(page, attorney.id),
  });

  runBioOverlaySuite({
    label: 'Baseline2 vs Baseline1 Bios',
    path: BASELINE2_ROOT,
    snapshotPrefix: 'baseline-',
    opener: async (page, attorney) => openBioOverlay(page, attorney.id),
  });

  runBioOverlaySuite({
    label: 'Current vs Baseline2 Bios',
    path: CURRENT_ROOT,
    snapshotPrefix: 'baseline2-',
    opener: async (page, attorney) => openBioOverlayCurrent(page, attorney.semanticId),
  });
} else {
  test.describe('Baseline2 harness disabled', () => {
    test('skipped', () => {
      test.skip(true, 'Baseline2 comparisons are disabled (set ENABLE_BASELINE2=1 to re-enable).');
    });
  });
}
