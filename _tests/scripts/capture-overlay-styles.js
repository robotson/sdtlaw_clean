#!/usr/bin/env node

/**
 * Capture computed styles for phone bio overlays in baseline and current builds.
 * Outputs JSON to _tests/scripts/output/overlay-styles.json for side-by-side analysis.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const SERVER_URL = 'http://localhost:9753';
const OUTPUT_DIR = path.resolve('_tests/scripts/output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'overlay-styles.json');

const ENVIRONMENTS = [
  { name: 'baseline', path: '/_baseline/', type: 'framer' },
  { name: 'current', path: '/', type: 'semantic' },
];

const ATTORNEYS = [
  { id: '1kq6r0t', semanticId: 'attorney-tjs', name: 'Tammy' },
  { id: 'a2aut', semanticId: 'attorney-had', name: 'Heidi' },
  { id: '1175ksh', semanticId: 'attorney-pot', name: 'Phyllis' },
];

async function main() {
  ensureDir(OUTPUT_DIR);
  const server = spawn('npx', ['serve', '.', '-l', '9753'], {
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

    const results = [];
    for (const env of ENVIRONMENTS) {
      for (const attorney of ATTORNEYS) {
        const data = await captureOverlay(context, env, attorney);
        results.push(data);
        console.log(`Captured ${env.name} – ${attorney.name}`);
      }
    }

    await context.close();
    await browser.close();

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`\nOverlay style data written to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('Failed to capture overlay styles:', err);
    process.exitCode = 1;
  } finally {
    server.kill();
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const res = await fetch(SERVER_URL);
      if (res.ok) return;
    } catch (err) {
      // ignore and retry
    }
    await delay(500);
  }
  throw new Error('Local server did not start in time.');
}

async function captureOverlay(context, env, attorney) {
  const page = await context.newPage();
  await page.goto(`${SERVER_URL}${env.path}`, { waitUntil: 'load' });
  await waitForReady(page);
  await scrollToTeam(page);

  if (env.type === 'framer') {
    await openFramerOverlay(page, attorney.id);
  } else {
    await openSemanticOverlay(page, attorney.semanticId);
  }

  await page.waitForSelector('.bio-portal--visible', { timeout: 4000 });
  await delay(300);

  const data = await page.evaluate(() => {
    const overlay = document.querySelector('.bio-portal--visible') || document.querySelector('.sdt-bio-overlay--phone');
    if (!overlay) return null;

    const dialog = overlay.querySelector('[role="dialog"]');
    const content = overlay.querySelector('.sdt-bio-panel__content') || overlay.querySelector('[data-framer-name="Content"]');
    const textContainer = overlay.querySelector('.sdt-bio-content__text-container') || overlay.querySelector('.framer-1t70tm6');
    const paragraphs = overlay.querySelectorAll('p');

    const captureNode = (node) => {
      if (!node) return null;
      const cs = window.getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return {
        tag: node.tagName,
        classes: node.className,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        transform: cs.transform,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
    };

    const getNodePath = (node) => {
      const parts = [];
      while (node && node !== document.body) {
        let part = node.tagName.toLowerCase();
        if (node.id) part += `#${node.id}`;
        if (node.className) {
          const cls = node.className.trim().replace(/\s+/g, '.');
          if (cls.length) part += `.${cls}`;
        }
        parts.unshift(part);
        node = node.parentElement;
      }
      return parts.join(' > ');
    };

    const paragraphData = Array.from(paragraphs).map((p) => {
      const cs = window.getComputedStyle(p);
      const rect = p.getBoundingClientRect();
      return {
        path: getNodePath(p),
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        transform: cs.transform,
        top: rect.top,
        height: rect.height,
        textSample: p.textContent.trim().slice(0, 80),
      };
    });

    return {
      dialog: captureNode(dialog),
      content: captureNode(content),
      textContainer: captureNode(textContainer),
      paragraphs: paragraphData,
    };
  });

  await page.close();
  return { env: env.name, attorney: attorney.name, data };
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
  if (!card) throw new Error(`Unable to find Framer card ${selector}`);
  await card.click();
}

async function openSemanticOverlay(page, semanticId) {
  const selector = `[id='${semanticId}'] .sdt-team__card`;
  const card = await page.$(selector);
  if (!card) throw new Error(`Unable to find semantic card ${selector}`);
  await card.click();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();


