# SDT Law - Clean Vanilla Site

## Project Context

This is a vanilla HTML/CSS/JS version of the SDT Law firm website, converted from Framer. We are progressively refactoring from Framer's generated code toward clean, semantic HTML/CSS using a "strangler fig" pattern.

### Key URLs
- **Original Framer app**: https://biggest-apartment-576487.framer.app/
- **This repo**: Clean, deployable static site

### Refactoring Progress

**Layout extraction complete:**
- ✅ Header - consolidated to global element, semantic CSS, inline SVG hamburger/close icons
- ✅ Footer - consolidated to global element, semantic CSS
- ✅ Hero section - consolidated to global element, semantic CSS
- ✅ Firm section - consolidated to global element, semantic CSS
- ✅ Gift section (Star Quilt) - consolidated to global element, semantic CSS
- 🔲 Team section - semantic classes added, typography hoisted, still in breakpoint containers

**Typography migration:**
- ✅ All typography presets hoisted to global scope (no longer require parent class context)
- ✅ Semantic aliases created for all presets (e.g., `.sdt-section-heading`, `.sdt-attorney-name`)

**Mobile menu:**
- ✅ Hamburger/close icons converted to inline SVG
- ✅ JS updated to use `.is-open` class instead of Framer classes
- ✅ Removed all Framer class dependencies

**Remaining Framer dependencies (long-term cleanup):**
- 🔲 `assets/css/framer-ssr.css` - Still actively loaded and required for styling
- 🔲 Font declarations in `<head>` - 14 font families loaded (only 2 used: EB Garamond, Montserrat)
- 🔲 Team section still in breakpoint containers with Framer layout classes

## Rules

### Test Suite Must Always Pass
- **ALL tests must pass before any work is considered complete**
- Failing tests are NEVER acceptable - they indicate broken functionality
- Do not rationalize, explain away, or defer fixing failing tests
- Do not suggest "moving forward" with failing tests
- If tests fail after changes, the changes must be fixed or reverted
- The test suite is the contract - 73 passing (14 skipped) is the expected state

### Always Reference Live Framer
- When matching Framer behavior, check the actual live Framer app
- Never guess colors, hover states, or behaviors - verify against the live site
- The Framer app is the source of truth for visual fidelity

### Development Server Ports
- **NEVER use common ports** (3000, 8000, 8080, 5000, etc.) for local servers
- Other development work may be running on these ports simultaneously
- Use the configured port 9753 (npm run serve) or other uncommon ports (9000+)

### Temporary/Debug Scripts
- Put all ephemeral scripts in `_scratch/` folder (gitignored)
- Use for one-off debugging, style inspection, testing ideas
- Don't clutter `_tests/` with temporary utilities

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
│   ├── css/            # Stylesheets (includes framer-ssr.css - still required!)
│   ├── js/             # site.js - interactions
│   ├── images/         # Photos
│   ├── svg/            # Icons and dividers
│   ├── icons/          # Favicons
│   └── fonts/          # Local fonts
├── _baseline/          # Frozen pristine copy for visual regression
├── _scratch/           # Ephemeral debug scripts (gitignored)
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

# Run all tests (73 passed, 14 skipped)
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

## Typography System

### Hoisted Presets

All Framer typography presets have been hoisted to work outside breakpoint containers. Each preset has a semantic alias:

| Preset Class | Semantic Alias | Used For |
|-------------|----------------|----------|
| `framer-styles-preset-2kmccc` | `.sdt-section-heading` | Section headings (tablet/desktop) |
| `framer-styles-preset-1dbdxg9` | `.sdt-section-heading--phone` | Section headings (phone) |
| `framer-styles-preset-1gd00jq` | `.sdt-body-text` | Body text paragraphs |
| `framer-styles-preset-grvcjq` | `.sdt-tagline` | Tagline ("Indians Serving Indians") |
| `framer-styles-preset-1ur8ep5` | `.sdt-attorney-name` | Attorney names (desktop) |
| `framer-styles-preset-1054p22` | `.sdt-attorney-name--phone` | Attorney names (phone/tablet) |
| `framer-styles-preset-te7ga4` | `.sdt-attorney-title` | Attorney titles (desktop) |
| `framer-styles-preset-1cqgywt` | `.sdt-attorney-title--phone` | Attorney titles (phone/tablet) |
| `framer-styles-preset-19zukr5` | `.sdt-bio-heading` | Bio panel headings |

### How Hoisting Works

Original Framer presets required parent class context:
```css
.framer-Ay79T .framer-styles-preset-2kmccc h1 { ... }
```

Hoisted presets work globally:
```css
.framer-styles-preset-2kmccc:not(.rich-text-wrapper),
.sdt-section-heading { ... }
```

## Global Extraction Pattern

### The Process

When extracting a section from breakpoint containers to a global element:

1. **Hoist typography** - Ensure all text presets work outside containers
2. **Create semantic CSS** - Duplicate Framer layout rules with `.sdt-*` classes
3. **Add semantic classes to HTML** - Tag all elements in breakpoint copies
4. **Create global HTML** - Build new element with semantic classes
5. **Add hide rules** - CSS to hide breakpoint copies, show global
6. **Test and fix** - Iterate on CSS until visual tests pass
7. **Delete breakpoint copies** - Remove redundant HTML

### JavaScript Considerations

When sections have interactive elements (like Team cards with bio overlays), the JavaScript may depend on specific selectors:

```javascript
// JS looks for these specific classes/IDs
const cards = document.querySelectorAll('.framer-1kq6r0t-container');
const cardId = cardContainer.id;  // expects "1kq6r0t"
```

The global element must include these same classes/IDs for JS to work, OR the JS must be updated to use semantic selectors.

## Lessons Learned

### Don't Revert on First Failure

When tests fail after changes, the correct approach is:

1. **Look at the diff images** in `test-results/` - understand what's actually different
2. **Identify the specific CSS gaps** - compare computed styles
3. **Fix incrementally** - add missing styles one by one, testing after each
4. **Keep going until tests pass**

Reverting immediately when "visual differences are too significant" is giving up. The strangler fig pattern expects iteration.

### Test After Every Atomic Change

Don't batch multiple changes:
- ❌ "Hoist typography + extract to global" in one step
- ✅ Hoist typography → test → extract to global → test

### Global Extraction Requires Full CSS Audit

Moving sections outside breakpoint containers means losing:
- Parent selector context
- Inherited styles from wrapper elements
- Document flow positioning

All of these must be explicitly replicated in the semantic CSS.

### Bio Overlay JS Dependencies

The bio overlay system in `site.js` depends on:
- Container classes: `.framer-1kq6r0t-container`, `.framer-a2aut-container`, `.framer-1175ksh-container`
- Card class: `.framer-74g9dq`
- Container IDs: `1kq6r0t`, `a2aut`, `1175ksh` (used as keys in `bioData`)

Global Team extraction must preserve these or update the JS.

### Current State

Tests pass (73 passed, 14 skipped). Team section has:
- ✅ Typography presets hoisted
- ✅ Semantic CSS created (`.sdt-team__*`)
- ✅ Semantic classes added to all breakpoint copies
- 🔲 Global extraction pending - needs CSS iteration to match visual fidelity
