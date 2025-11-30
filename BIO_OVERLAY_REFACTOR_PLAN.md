# Bio Overlay Refactoring Plan

## Overview

The bio overlay system is the largest remaining Framer-dependent component, with **272 Framer class instances** across 9 overlay variants (3 attorneys × 3 breakpoints). This document outlines a comprehensive plan to refactor the bio overlays from Framer-generated markup to clean, semantic HTML/CSS.

## Current State

### Structure
- **9 overlay variants** total:
  - 3 attorneys (Tammy, Heidi, Phyllis)
  - 3 breakpoints each (Phone, Tablet, Desktop)
- **Location**: `index.html` lines 294-1026
- **Framer classes**: 272 instances
- **Semantic classes already added**: 
  - `.sdt-bio-overlay` (container)
  - `.sdt-bio-overlay--phone`, `--tablet`, `--desktop` (breakpoint variants)
  - `.bio-portal` (animation hook)
  - `.sdt-bio-link` (email/phone links)
  - `.sdt-bio-name`, `.sdt-bio-title`, `.sdt-bio-text`, `.sdt-bio-section-heading` (typography)
  - `.bio-panel__photo-wrapper`, `.bio-panel__photo-img` (photo)
  - `.bio-panel__address-label`, `.bio-panel__address-value` (address)
  - `.sdt-bio-close` (close button)

### JavaScript Dependencies
**File**: `assets/js/site.js`

The JavaScript currently depends on:
- Container classes: `.framer-1kq6r0t-container`, `.framer-a2aut-container`, `.framer-1175ksh-container` (team cards)
- Card IDs: `attorney-tjs`, `attorney-had`, `attorney-pot` (used to find overlays)
- Overlay structure: `.framer-185jkq1`, `.framer-nis8ht`, `.framer-1tylomn` (phone overlay structure)
- Dialog element: `[role="dialog"]` (for animations)

**Action Required**: Update JS to use semantic selectors instead of Framer classes.

### CSS Dependencies
**Files**:
- `assets/css/framer-overlay.css` - Desktop/Tablet overlay styles
- `assets/css/phone-overlay.css` - Phone overlay styles
- `assets/css/bio-overlay.css` - Legacy overlay styles
- `assets/css/overlay.css` - Base overlay styles
- `assets/css/framer-ssr.css` - Framer base styles (still required)

**Action Required**: Create semantic CSS equivalents in `assets/css/styles.css` to replace Framer-specific rules.

## Refactoring Strategy

### Phase 1: Analysis & Mapping (Foundation)
**Goal**: Document all Framer classes and their semantic equivalents

1. **Inventory Framer Classes**
   - List all unique Framer classes used in overlays
   - Map each class to its purpose (layout, typography, spacing, etc.)
   - Identify which classes are critical vs. decorative

2. **Create Semantic Class Mapping**
   - Design BEM-style semantic class names (`.sdt-bio-*`)
   - Map each Framer class to its semantic equivalent
   - Document any special cases or edge cases

3. **Identify Layout Patterns**
   - Desktop/Tablet: Two-column layout (photo+contact | biography)
   - Phone: Single column with buttons at bottom
   - Document responsive breakpoints and layout changes

### Phase 2: CSS Migration (Incremental)
**Goal**: Create semantic CSS that matches Framer styling exactly

1. **Create Semantic CSS Rules**
   - Add new `.sdt-bio-*` classes to `assets/css/styles.css`
   - Duplicate all Framer layout rules with semantic selectors
   - Maintain exact visual fidelity (pixel-perfect matching)

2. **Test After Each Section**
   - Run `npm test` after each major section (photo, contact, biography, etc.)
   - Fix any visual differences immediately
   - Don't proceed until tests pass

3. **Keep Framer Classes During Transition**
   - Add semantic classes alongside Framer classes (strangler fig pattern)
   - Both sets of classes active during transition
   - Allows gradual migration without breaking functionality

### Phase 3: HTML Migration (One Overlay at a Time)
**Goal**: Replace Framer classes with semantic classes in HTML

**Approach**: Start with one overlay variant, test thoroughly, then replicate

1. **Start with Desktop Tammy Overlay**
   - Replace Framer classes with semantic equivalents
   - Keep both classes initially (backward compatibility)
   - Test visual fidelity

2. **Remove Framer Classes (After CSS Verified)**
   - Once semantic CSS is proven, remove Framer classes
   - Test again to ensure nothing breaks

3. **Replicate to Other Variants**
   - Apply same pattern to Tablet Tammy
   - Then Phone Tammy
   - Then repeat for Heidi (all 3 breakpoints)
   - Then repeat for Phyllis (all 3 breakpoints)

### Phase 4: JavaScript Updates
**Goal**: Update JS to use semantic selectors

1. **Update Selectors**
   - Replace `.framer-*` selectors with `.sdt-bio-*` equivalents
   - Update any ID-based lookups if needed
   - Test all interactions (open, close, escape key)

2. **Verify Functionality**
   - Test bio overlay opening/closing on all breakpoints
   - Test escape key functionality
   - Test click-outside-to-close (if implemented)
   - Test animations (fade in/out, slide up)

### Phase 5: Cleanup
**Goal**: Remove Framer dependencies

1. **Remove Framer CSS Rules**
   - Remove Framer-specific rules from `framer-overlay.css` (if no longer needed)
   - Keep `framer-ssr.css` if still required by other sections
   - Document any remaining Framer dependencies

2. **Final Testing**
   - Run full test suite
   - Manual testing on all breakpoints
   - Verify all 9 overlay variants work correctly

## Semantic Class Naming Convention

### Proposed Structure
```
.sdt-bio-overlay              - Main container
  .sdt-bio-overlay--phone     - Phone variant
  .sdt-bio-overlay--tablet    - Tablet variant
  .sdt-bio-overlay--desktop   - Desktop variant

.sdt-bio-dialog               - Dialog wrapper [role="dialog"]
.sdt-bio-panel                - Main panel container (cream background)
  .sdt-bio-panel--desktop     - Desktop panel
  .sdt-bio-panel--tablet      - Tablet panel
  .sdt-bio-panel--phone       - Phone panel

.sdt-bio-profile               - Profile column (photo + contact)
  .sdt-bio-profile__photo      - Photo section
  .sdt-bio-profile__contact    - Contact info section
  .sdt-bio-profile__address    - Address section

.sdt-bio-content               - Biography content column
  .sdt-bio-content__heading     - "Biography" heading
  .sdt-bio-content__text        - Biography paragraphs

.sdt-bio-header                - Header row (name + close button)
  .sdt-bio-header__name         - Name and title
  .sdt-bio-header__close        - Close button

.sdt-bio-contact                - Contact info row
  .sdt-bio-contact__icon        - Email/phone icon
  .sdt-bio-contact__text        - Contact text/link
```

## Key Framer Classes to Replace

### Desktop/Tablet Overlays
- `.framer-SXe1m` → `.sdt-bio-dialog`
- `.framer-rop5of` → `.sdt-bio-panel-wrapper`
- `.framer-1edteoo` → `.sdt-bio-panel`
- `.framer-1k4oklk` → `.sdt-bio-profile`
- `.framer-1p8rmjh` → `.sdt-bio-profile__photo`
- `.framer-1pi7at3` → `.sdt-bio-profile__photo-wrapper`
- `.framer-8siksq` → `.sdt-bio-profile__contact`
- `.framer-1cexlgh` → `.sdt-bio-profile__address`
- `.framer-1etjeh` → `.sdt-bio-content`
- `.framer-1lwgu3k` → `.sdt-bio-content__heading`
- `.framer-1xy1e9l` → `.sdt-bio-content__text-wrapper`
- `.framer-4h32yw` → `.sdt-bio-content__text`
- `.framer-1hrcbbx` → `.sdt-bio-header`
- `.framer-9biryz` → `.sdt-bio-header__row`
- `.framer-wjb9w6` → `.sdt-bio-header__name`
- `.framer-17say78` → `.sdt-bio-header__divider`

### Phone Overlays
- `.framer-185jkq1` → `.sdt-bio-panel--phone`
- `.framer-1udf3gh` → `.sdt-bio-panel__inner`
- `.framer-nis8ht` → `.sdt-bio-panel__card`
- `.framer-1tylomn` → `.sdt-bio-panel__content`
- `.framer-mpug57` → `.sdt-bio-panel__contact-buttons`
- `.framer-181u6dr` → `.sdt-bio-panel__biography`

### Contact Elements
- `.framer-hz73lt` → `.sdt-bio-contact--email`
- `.framer-e0xee0` → `.sdt-bio-contact--phone`
- `.framer-vu0rjv` → `.sdt-bio-contact__icon--email`
- `.framer-1749sgb` → `.sdt-bio-contact__icon--phone`
- `.framer-go17s5` → `.sdt-bio-contact__text--email`
- `.framer-fly4qh` → `.sdt-bio-contact__text--phone`

## Testing Strategy

### Visual Regression Tests
- Run `npm test` after each phase
- All 73 tests must pass before proceeding
- Check test results for any visual differences
- Fix any regressions immediately

### Manual Testing Checklist
- [ ] Desktop: All 3 attorney overlays open/close correctly
- [ ] Tablet: All 3 attorney overlays open/close correctly
- [ ] Phone: All 3 attorney overlays open/close correctly
- [ ] Animations work (fade in/out, slide up)
- [ ] Escape key closes overlay
- [ ] Close button works
- [ ] Links are clickable (email/phone)
- [ ] Text is readable and properly styled
- [ ] Images display correctly
- [ ] Layout is responsive at all breakpoints

## Risk Assessment

### High Risk Areas
1. **JavaScript Dependencies**: JS relies on specific Framer class selectors
   - **Mitigation**: Update JS incrementally, test after each change

2. **Layout Complexity**: Desktop/Tablet uses absolute positioning
   - **Mitigation**: Copy Framer positioning exactly, test pixel-perfect

3. **Animation System**: Animations depend on `.bio-portal` class
   - **Mitigation**: Keep `.bio-portal` class, only replace internal Framer classes

4. **Responsive Breakpoints**: Different layouts for phone/tablet/desktop
   - **Mitigation**: Test each breakpoint separately, verify all variants

### Low Risk Areas
1. **Typography**: Already migrated to semantic classes (`.sdt-bio-text`, etc.)
2. **Links**: Already migrated to `.sdt-bio-link`
3. **Photos**: Already using `.bio-panel__photo-*` classes

## Estimated Effort

- **Phase 1 (Analysis)**: 1-2 hours
- **Phase 2 (CSS Migration)**: 4-6 hours
- **Phase 3 (HTML Migration)**: 6-8 hours
- **Phase 4 (JS Updates)**: 2-3 hours
- **Phase 5 (Cleanup)**: 1-2 hours

**Total**: 14-21 hours (2-3 days of focused work)

## Success Criteria

✅ All 9 overlay variants use semantic classes only
✅ All 73 tests passing
✅ No Framer classes in bio overlay HTML
✅ JavaScript uses semantic selectors
✅ Visual fidelity maintained (pixel-perfect)
✅ All interactions work (open, close, animations)
✅ Code is maintainable and well-documented

## Notes

- This is a **major refactoring** - take it slow and test frequently
- Follow the **strangler fig pattern**: add semantic classes alongside Framer, then remove Framer
- **Never proceed** if tests are failing
- **Document** any special cases or gotchas discovered during refactoring
- Consider **breaking this into multiple commits** (one per phase or per overlay variant)

