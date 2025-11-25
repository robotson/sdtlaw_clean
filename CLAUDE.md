# SDT Law - Clean Vanilla Site

## Project Context

This is a vanilla HTML/CSS/JS version of the SDT Law firm website, converted from Framer.

### Key URLs
- **Original Framer app**: https://biggest-apartment-576487.framer.app/
- **This repo**: Clean, deployable static site

## Rules

### Test Suite Must Always Pass
- **ALL tests must pass before any work is considered complete**
- Failing tests are NEVER acceptable - they indicate broken functionality
- Do not rationalize, explain away, or defer fixing failing tests
- Do not suggest "moving forward" with failing tests
- If tests fail after changes, the changes must be fixed or reverted
- The test suite is the contract - 48/48 passing is the only acceptable state

### Always Reference Live Framer
- When matching Framer behavior, check the actual live Framer app
- Never guess colors, hover states, or behaviors - verify against the live site
- The Framer app is the source of truth for visual fidelity

### Development Server Ports
- **NEVER use common ports** (3000, 8000, 8080, 5000, etc.) for local servers
- Other development work may be running on these ports simultaneously
- Use the configured port 9753 (npm run serve) or other uncommon ports (9000+)

### Code Style

**CSS**
- Use Framer's CSS custom properties (--token-*) when available
- Match Framer's class naming for compatibility with base CSS

**JavaScript**
- Vanilla JS only, no external dependencies
- Handle all three responsive breakpoints: <810px, 810-1199px, ≥1200px

**HTML**
- Preserve Framer's data-* attributes where possible
- Use same class names as Framer for CSS compatibility

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

### Test Coverage
- **Breakpoints**: Phone (390px), Tablet (900px), Desktop (1400px)
- **States**: Hero, Team section, Bio overlays (3 attorneys), Phone menu
- **Functional**: Anchor links, overlay open/close, escape key

### Commands

```bash
# Install dependencies (first time)
npm install && npx playwright install chromium

# Run all visual regression tests
npm test

# Run tests for specific breakpoint
npm run test:phone
npm run test:tablet
npm run test:desktop

# Update snapshots after intentional changes
npm run test:update

# View HTML test report
npm run test:report

# Start local server (port 9753)
npm run serve
```

### Workflow
1. Make changes to main site files
2. Run `npm test` to catch visual regressions
3. If changes are intentional, run `npm run test:update`
4. Commit updated snapshots

## Common Commands

```bash
# Open local site
open index.html

# Start local server (if needed for testing)
npm run serve
```
- my global todo is, if you are running into visual differences, actually compare what you can see vs what we know is good. also check if it's sub pixel differences, try looking at what side of the diff the pixels are biased on and see if you can nudge elements by sub pixel amounts to get them into place if you have to.