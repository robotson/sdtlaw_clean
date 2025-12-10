#!/usr/bin/env node

/**
 * Scan baseline vs current PNG snapshots and report detected line centers
 * using simple image analysis. Useful for understanding line-height
 * differences in the rendered screenshots.
 *
 * Usage: node _tests/scripts/scan-line-spacing.js
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const CASES = [
  {
    name: 'Tammy',
    baseline: '_tests/baseline.spec.js-snapshots/baseline-bio-tammy-phone-darwin.png',
    current: '_tests/current-site.spec.js-snapshots/current-bio-tammy-phone-darwin.png',
  },
  {
    name: 'Heidi',
    baseline: '_tests/baseline.spec.js-snapshots/baseline-bio-heidi-phone-darwin.png',
    current: '_tests/current-site.spec.js-snapshots/current-bio-heidi-phone-darwin.png',
  },
  {
    name: 'Phyllis',
    baseline: '_tests/baseline.spec.js-snapshots/baseline-bio-phyllis-phone-darwin.png',
    current: '_tests/current-site.spec.js-snapshots/current-bio-phyllis-phone-darwin.png',
  },
];

function loadPng(filePath) {
  const data = fs.readFileSync(filePath);
  return PNG.sync.read(data);
}

function measureLineCenters(png) {
  const width = png.width;
  const height = png.height;
  const data = png.data;

  const centers = [];
  const coverageThreshold = 0.02; // 2% of pixels dark in a row
  const darkThreshold = 200;

  let y = 0;
  while (y < height) {
    const coverage = rowCoverage(data, width, height, y, darkThreshold);
    if (coverage < coverageThreshold) {
      y++;
      continue;
    }

    // Accumulate contiguous rows
    let blockRows = [];
    while (y < height) {
      const cov = rowCoverage(data, width, height, y, darkThreshold);
      if (cov < coverageThreshold) break;
      blockRows.push(sampleRow(data, width, y));
      y++;
    }

    if (blockRows.length > 0) {
      centers.push(findRowWithMaxDark(blockRows));
    }
  }

  return centers;
}

function rowCoverage(data, width, height, y, darkThreshold) {
  let darkPixels = 0;
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (a > 0 && luminance < darkThreshold) darkPixels++;
  }
  return darkPixels / width;
}

function sampleRow(data, width, y) {
  let darkCount = 0;
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (a > 0 && luminance < 200) darkCount++;
  }
  return { y, darkCount };
}

function findRowWithMaxDark(rows) {
  let best = rows[0];
  for (const row of rows) {
    if (row.darkCount > best.darkCount) best = row;
  }
  return best.y;
}

function summarize(name, centers) {
  console.log(`Line centers for ${name} (first 20):`);
  centers.slice(0, 20).forEach((c, idx) => {
    const prev = idx > 0 ? centers[idx - 1] : null;
    const delta = prev !== null ? (c - prev).toFixed(2) : '--';
    console.log(`  ${idx + 1}. y=${c.toFixed(2)} Δ=${delta}`);
  });
}

function compareSpacing(name, baselineCenters, currentCenters) {
  const minCount = Math.min(baselineCenters.length, currentCenters.length);
  const differences = [];
  for (let i = 0; i < minCount; i++) {
    differences.push({
      line: i + 1,
      baselineY: baselineCenters[i],
      currentY: currentCenters[i],
      delta: currentCenters[i] - baselineCenters[i],
    });
  }

  console.log(`\nΔ line positions (current - baseline) for ${name}:`);
  differences.slice(0, 20).forEach((d) => {
    console.log(
      `  line ${d.line}: baseline=${d.baselineY.toFixed(2)} current=${d.currentY.toFixed(
        2
      )} Δ=${d.delta.toFixed(2)}`
    );
  });
}

function run() {
  CASES.forEach((testCase) => {
    const baselinePng = loadPng(path.resolve(testCase.baseline));
    const currentPng = loadPng(path.resolve(testCase.current));

    if (baselinePng.width !== currentPng.width || baselinePng.height !== currentPng.height) {
      console.warn(`Skipping ${testCase.name}: image dimensions differ.`);
      return;
    }

    const baselineCenters = measureLineCenters(baselinePng);
    const currentCenters = measureLineCenters(currentPng);

    console.log(`\n=== ${testCase.name} ===`);
    summarize('baseline', baselineCenters);
    summarize('current', currentCenters);
    compareSpacing(testCase.name, baselineCenters, currentCenters);
  });
}

run();

