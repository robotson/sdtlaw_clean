// @ts-check
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 } // Phone viewport
  });

  await page.goto('http://localhost:9753/_baseline/');
  await page.waitForLoadState('networkidle');

  // Find the visible logo subtitle text (Framer uses p.framer-text inside .framer-webw9m)
  const subtitles = page.locator('.framer-webw9m .framer-text');
  const count = await subtitles.count();

  console.log(`Found ${count} subtitle elements`);

  for (let i = 0; i < count; i++) {
    const subtitle = subtitles.nth(i);
    const isVisible = await subtitle.isVisible();

    console.log(`\n=== Subtitle ${i + 1} ===`);
    console.log(`isVisible: ${isVisible}`);

    const box = await subtitle.boundingBox();
    console.log('Bounding box:', box);

    const styles = await subtitle.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      const parent = el.parentElement;
      const parentComputed = parent ? window.getComputedStyle(parent) : null;
      return {
        element: {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          width: computed.width,
          height: computed.height,
          margin: computed.margin,
          padding: computed.padding,
          position: computed.position,
          overflow: computed.overflow,
          fontSize: computed.fontSize,
          lineHeight: computed.lineHeight,
          color: computed.color,
          transform: computed.transform,
          clip: computed.clip,
          clipPath: computed.clipPath,
          top: computed.top,
          left: computed.left,
          bottom: computed.bottom,
          right: computed.right,
        },
        parent: parentComputed ? {
          display: parentComputed.display,
          overflow: parentComputed.overflow,
          height: parentComputed.height,
          gap: parentComputed.gap,
        } : null
      };
    });

    console.log('Computed styles:', JSON.stringify(styles, null, 2));

    // Get the text content
    const text = await subtitle.textContent();
    console.log('Text content:', text);
  }

  await browser.close();
})();
