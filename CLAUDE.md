# SDT Law - Clean Vanilla Site

## Project Context

This is a vanilla HTML/CSS/JS version of the SDT Law firm website, converted from Framer. We are progressively refactoring from Framer's generated code toward clean, semantic HTML/CSS using a "strangler fig" pattern.

### Key URLs
- **Original Framer app**: https://biggest-apartment-576487.framer.app/
- **This repo**: Clean, deployable static site

### Refactoring Progress

**Layout extraction complete:**
- ✅ Header - consolidated to global element, semantic CSS
- ✅ Footer - consolidated to global element, semantic CSS
- ✅ Hero section - consolidated to global element, semantic CSS
- ✅ Firm section - semantic layout CSS (still in breakpoint containers)
- 🔲 Team section - still Framer markup

**Blocking issue for full consolidation:**
- Framer text presets (`framer-styles-preset-*`) require parent class context (`.framer-Ay79T`, etc.)
- Sections with text styling can't be extracted from breakpoint containers until typography is migrated
- See "Typography System Migration" section below

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

## Typography System Migration

### The Problem

Framer generates text styling through "style presets" that use CSS custom properties. These presets require parent class context to work:

```css
/* Example: This preset only works inside .framer-Ay79T */
.framer-Ay79T .framer-styles-preset-2kmccc h1 {
  --framer-font-family: "Montserrat", sans-serif;
  --framer-font-size: 28px;
  --framer-text-color: #c12b20;
  /* ... many more properties */
}
```

When we extract sections from breakpoint containers, they lose this parent context and text styling breaks.

### Current Framer Typography Classes

| Preset Class | Parent Required | Element | Used For |
|-------------|-----------------|---------|----------|
| `framer-styles-preset-2kmccc` | `.framer-Ay79T` | h1 | Section headings (tablet/desktop "our firm", "our team") |
| `framer-styles-preset-1dbdxg9` | `.framer-rU5N4` | h1 | Section headings (phone variant) |
| `framer-styles-preset-1gd00jq` | `.framer-ja2YZ` | p | Body text paragraphs |
| `framer-styles-preset-grvcjq` | `.framer-qE7ir` | h2 | Tagline ("Indians Serving Indians") |
| `framer-styles-preset-19zukr5` | `.framer-avUKP` | h5 | Bio panel headings |
| `framer-styles-preset-gxwp0p` | `.framer-mfAtc` | h6 | Photo captions ("Star Quilt...") |
| `framer-styles-preset-19qfgc8` | `.framer-yNZqP` | p | Bio panel body text |
| `framer-styles-preset-5gdcdh` | `.framer-QhN6u` | a/span | Navigation links |
| `framer-styles-preset-1ur8ep5` | `.framer-Yvx1F` | h3 | Attorney names (desktop) |
| `framer-styles-preset-1054p22` | `.framer-8OqIg` | h3 | Attorney names (tablet/phone) |
| `framer-styles-preset-tbuoeu` | `.framer-W8HVz` | h2 | Attorney names variant |
| `framer-styles-preset-te7ga4` | `.framer-5k5uO` | h4 | Attorney titles (desktop) |
| `framer-styles-preset-1cqgywt` | `.framer-fmga6` | h4 | Attorney titles (tablet/phone) |

### Migration Strategy Options

**Option A: Replace presets with semantic classes**
1. Audit all `framer-styles-preset-*` usage
2. Create semantic typography classes (`.sdt-heading-section`, `.sdt-body-text`, etc.)
3. Write CSS that doesn't depend on parent context
4. Replace preset classes in HTML with semantic classes
5. Then extract sections from breakpoint containers

**Option B: Hoist preset styles to global scope**
1. Copy preset CSS rules and remove parent selector requirement
2. Add to `styles.css` without `.framer-Ay79T` parent
3. Preset classes continue to work outside breakpoint containers
4. Less HTML changes, but keeps Framer naming

**Option C: Hybrid approach**
1. Create semantic typography system
2. Map semantic classes to Framer CSS variables (keeps visual fidelity)
3. Gradually replace in HTML as sections are extracted

### Recommended Approach

Option A (semantic classes) is cleanest long-term but most work.

For incremental progress:
1. Start with Option B to unblock section extraction
2. Gradually migrate to Option A as sections are refactored
3. Eventually remove all `framer-styles-preset-*` classes