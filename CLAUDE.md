# SDT Law - Clean Vanilla Site

## Project Context

This is a vanilla HTML/CSS/JS version of the SDT Law firm website, converted from Framer. We are progressively refactoring from Framer's generated code toward clean, semantic HTML/CSS using a "strangler fig" pattern.

### Key URLs
- **Original Framer app**: https://biggest-apartment-576487.framer.app/
- **This repo**: Clean, deployable static site

### Refactoring Progress
- ✅ Header - extracted to semantic HTML/CSS, mobile-first responsive
- ✅ Footer - extracted to semantic HTML/CSS, mobile-first responsive
- 🔲 Hero section - still Framer markup with triplicated breakpoint containers
- 🔲 Team section - still Framer markup
- 🔲 Firm section - still Framer markup

## Rules

### Test Suite Must Always Pass
- **ALL tests must pass before any work is considered complete**
- Failing tests are NEVER acceptable - they indicate broken functionality
- Do not rationalize, explain away, or defer fixing failing tests
- Do not suggest "moving forward" with failing tests
- If tests fail after changes, the changes must be fixed or reverted
- The test suite is the contract - 67 passing (8 skipped) is the expected state

### Always Reference Live Framer
- When matching Framer behavior, check the actual live Framer app
- Never guess colors, hover states, or behaviors - verify against the live site
- The Framer app is the source of truth for visual fidelity

### Development Server Ports
- **NEVER use common ports** (3000, 8000, 8080, 5000, etc.) for local servers
- Other development work may be running on these ports simultaneously
- Use the configured port 9753 (npm run serve) or other uncommon ports (9000+)

### Refactoring Approach
- **Small, incremental changes** - never rewrite large sections at once
- **Test after every change** - run `npm test` constantly
- **Strangler fig pattern**:
  1. Add semantic classes alongside Framer classes
  2. Move inline styles to CSS with semantic selectors
  3. Test, verify visual fidelity
  4. Remove Framer classes once semantic styles are working
  5. Consolidate duplicate breakpoint markup into single responsive element
- **Manual tweaks expected** - sub-pixel adjustments often needed to maintain fidelity

### Code Style

**CSS**
- Prefer semantic custom properties (`--color-red`, `--space-4`) over Framer tokens
- Use BEM naming (`.sdt-footer__contact`, `.sdt-header__inner`)
- Mobile-first responsive design with min-width media queries
- Keep Framer's `--token-*` properties only where still needed by unconverted sections

**JavaScript**
- Vanilla JS only, no external dependencies
- Handle all three responsive breakpoints: <810px, 810-1199px, ≥1200px

**HTML**
- New/refactored sections: semantic class names (`.sdt-*`)
- Legacy Framer sections: preserve `data-*` attributes and `.framer-*` classes until refactored

## Breakpoints

```
Phone:   max-width: 809px
Tablet:  810px - 1199px
Desktop: min-width: 1200px
```

## File Structure

```
sdtlaw_clean/
├── index.html          # Main site
├── assets/
│   ├── css/            # Stylesheets
│   ├── js/             # site.js - interactions
│   ├── images/         # Photos
│   ├── svg/            # Icons and dividers
│   ├── icons/          # Favicons
│   └── fonts/          # Local fonts
├── _baseline/          # Frozen pristine copy for visual regression
├── _tests/             # Playwright visual regression tests
├── playwright.config.js
├── package.json
└── CLAUDE.md           # This file
```

## Visual Regression Testing

Uses Playwright for visual regression testing across all breakpoints.

### Test Architecture

Two separate test files with distinct purposes:

| File | Purpose | Snapshots From | Update Command |
|------|---------|----------------|----------------|
| `baseline.spec.js` | Golden reference from frozen HTML | `/_baseline/index.html` | `npm run test:update-baseline` |
| `current-site.spec.js` | Current working site state | `/index.html` | `npm run test:update` |

**Key distinction**: Baseline snapshots are generated from the frozen `_baseline/` folder - a pristine copy. This ensures baseline PNGs are provably derived from known-good HTML, not accidentally blessed from broken changes.

### Test Coverage
- **Breakpoints**: Phone (390px), Tablet (900px), Desktop (1400px)
- **States**: Hero, Team section, Footer, Bio overlays (3 attorneys), Phone menu
- **Functional**: Anchor links, overlay open/close, escape key
- **Comparison**: Current site vs baseline (catches regressions)

### Commands

```bash
# Install dependencies (first time)
npm install && npx playwright install chromium

# Run all tests (67 tests, 8 skipped)
npm test

# Run only current site tests
npm run test:current

# Run only baseline tests
npm run test:baseline

# Run tests for specific breakpoint
npm run test:phone
npm run test:tablet
npm run test:desktop

# Update current site snapshots (safe - use after intentional changes)
npm run test:update

# Regenerate baseline from _baseline/index.html (use sparingly)
npm run test:update-baseline

# View HTML test report
npm run test:report

# Start local server (port 9753)
npm run serve
```

### Workflow
1. Make changes to main site files (`index.html`, `assets/css/styles.css`)
2. Run `npm test` to catch visual regressions
3. If current-site tests fail but changes are intentional: `npm run test:update`
4. If baseline comparison tests fail: your changes diverged from baseline - fix or accept
5. Commit updated snapshots

### Debugging Visual Differences
- Compare actual screenshots in `test-results/` against expected
- Check for sub-pixel differences - look at which side of elements the diff pixels appear
- Use sub-pixel CSS adjustments (`transform: translateX(0.5px)`) if needed for fidelity
- Run `npm run test:report` to view detailed HTML diff report

## Common Commands

```bash
# Open local site
open index.html

# Start local server (if needed for testing)
npm run serve
```