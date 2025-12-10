#!/usr/bin/env node

// Measure line box positions for each bio overlay across different environments.
// Usage: node _tests/scripts/measure-line-heights.js

const { spawn } = require('child_process');
const { chromium } = require('playwright');

const SERVER_URL = 'http://localhost:9753';
const ENVIRONMENTS = [
  { name: 'baseline1', path: '/_baseline/' },
  { name: 'baseline2', path: '/_baseline2/' },
  { name: 'current', path: '/' },
];

const ATTORNEYS = [
  { framerId: '1kq6r0t', semanticId: 'attorney-tjs', name: 'Tammy' },
  { framerId: 'a2aut', semanticId: 'attorney-had', name: 'Heidi' },
  { framerId: '1175ksh', semanticId: 'attorney-pot', name: 'Phyllis' },
];

async function main() {
  const serverProcess = spawn('npx', ['serve', '.', '-l', '9753'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  try {
    await waitForServer();
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    for (const env of ENVIRONMENTS) {
      console.log(`\n=== Measuring ${env.name} (${env.path}) ===`);
      for (const attorney of ATTORNEYS) {
        await measureOverlay(context, env, attorney);
      }
    }

    await context.close();
    await browser.close();
  } catch (err) {
    console.error('Measurement failed:', err);
    process.exitCode = 1;
  } finally {
    serverProcess.kill();
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const res = await fetch(SERVER_URL, { method: 'GET' });
      if (res.ok) return;
    } catch (err) {
      // ignore and retry
    }
    await delay(500);
  }
  throw new Error('Local dev server did not start in time.');
}

async function measureOverlay(context, env, attorney) {
  const page = await context.newPage();
  await loadPage(page, env.path);
  await scrollToTeam(page);

  if (env.path.startsWith('/_baseline')) {
    await openFramerOverlay(page, attorney.framerId);
  } else {
    await openSemanticOverlay(page, attorney.semanticId);
  }

  await page.waitForSelector('.bio-portal--visible', { timeout: 5000 });
  await delay(200); // allow any animations to settle

  const data = await page.evaluate(() => {
    const elements = Array.from(
      document.querySelectorAll(
        '.bio-portal--visible .sdt-bio-text, .bio-portal--visible .framer-styles-preset-19qfgc8'
      )
    );
    const results = [];

    elements.forEach((el, paragraphIndex) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = Array.from(range.getClientRects());
      rects.forEach((rect, lineIndex) => {
        results.push({
          paragraphIndex,
          lineIndex,
          top: rect.top,
          height: rect.height,
          textSample: el.textContent.trim().slice(0, 40),
        });
      });
    });

    const sample = elements[0] ? window.getComputedStyle(elements[0]).lineHeight : 'unknown';
    return { lines: results, computedLineHeight: sample };
  });

  console.log(`\n${env.name} – ${attorney.name}`);
  console.log(`Computed line-height: ${data.computedLineHeight}`);
  data.lines.forEach((line) => {
    console.log(
      `  p${line.paragraphIndex + 1}-l${line.lineIndex + 1}: top=${line.top.toFixed(
        2
      )} height=${line.height.toFixed(2)} "${line.textSample}"`
    );
  });

  await page.close();
}

async function loadPage(page, path) {
  await page.goto(`${SERVER_URL}${path}`, { waitUntil: 'load' });
  await waitForReady(page);
}

async function waitForReady(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => document.fonts.ready);
}

async function scrollToTeam(page) {
  const team = await page.$('#team');
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
  await delay(400);
}

async function openFramerOverlay(page, framerId) {
  const selector = `.framer-${framerId}-container .framer-74g9dq`;
  const card = await page.$(selector);
  if (!card) throw new Error(`Unable to find card ${selector}`);
  await card.click();
}

async function openSemanticOverlay(page, semanticId) {
  const selector = `[id='${semanticId}'] .sdt-team__card`;
  const card = await page.$(selector);
  if (!card) throw new Error(`Unable to find card ${selector}`);
  await card.click();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();

