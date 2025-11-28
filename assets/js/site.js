/**
 * SD&T Law - Site Interactions
 * Handles bio overlays (show/hide) and mobile menu
 */

(function() {
  'use strict';

  // Currently open overlay element
  let currentOverlay = null;

  // Initialize bio overlays - make cards clickable
  function initBioOverlays() {
    // Select card containers by ID (works across all breakpoint variants)
    const cards = document.querySelectorAll('[id="1kq6r0t"], [id="a2aut"], [id="1175ksh"]');
    console.log('[BIO] initBioOverlays - found', cards.length, 'card containers');

    cards.forEach(cardContainer => {
      const cardId = cardContainer.id;
      // Card can have either semantic or Framer class
      const card = cardContainer.querySelector('.sdt-team__card, .framer-74g9dq');

      if (!card || !cardId) {
        console.log('[BIO] Skipping - no card or cardId', cardId);
        return;
      }

      // Skip cards that aren't visible
      const rect = card.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.log('[BIO] Skipping invisible card:', cardId, rect);
        return;
      }

      console.log('[BIO] Setting up card:', cardId, 'classes:', card.className.slice(0, 50));

      // Make card clickable
      card.style.cursor = 'pointer';
      card.setAttribute('role', 'button');

      card.addEventListener('click', (e) => {
        console.log('[BIO] Card clicked:', cardId);
        e.preventDefault();
        showBioOverlay(cardId);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showBioOverlay(cardId);
        }
      });
    });

    // Set up close handlers for all overlays
    document.querySelectorAll('.sdt-bio-close').forEach(btn => {
      btn.addEventListener('click', closeBioOverlay);
    });

    // Close on clicking overlay background (but not content)
    document.querySelectorAll('.sdt-bio-overlay').forEach(overlay => {
      overlay.addEventListener('click', function(e) {
        // Don't close if clicking on a link
        if (e.target.closest('a')) return;
        // Only close if clicking directly on overlay or its immediate wrapper
        if (e.target === overlay || e.target.parentElement === overlay) {
          closeBioOverlay();
        }
      });
    });
  }

  // Show bio overlay - find the right breakpoint variant and show it
  function showBioOverlay(cardId) {
    console.log('[BIO] showBioOverlay called with cardId:', cardId);

    // Close any existing overlay first
    if (currentOverlay) {
      closeBioOverlay();
    }

    // Determine which breakpoint overlay to show
    const isPhone = window.innerWidth < 810;
    const isTablet = window.innerWidth >= 810 && window.innerWidth < 1200;
    const breakpoint = isPhone ? 'phone' : (isTablet ? 'tablet' : 'desktop');
    console.log('[BIO] Breakpoint:', breakpoint, 'width:', window.innerWidth);

    // Find the correct overlay
    const selector = `.sdt-bio-overlay--${breakpoint}[data-bio-id="${cardId}"]`;
    console.log('[BIO] Looking for overlay:', selector);
    const overlay = document.querySelector(selector);

    if (!overlay) {
      console.warn('[BIO] No overlay found for', cardId, breakpoint);
      return;
    }
    console.log('[BIO] Found overlay:', overlay.className);

    // Calculate overlay position
    const portalWidth = isPhone ? 380 : (isTablet ? 810 : 1200);
    const leftPosition = (window.innerWidth - portalWidth) / 2;

    // Find the first visible card (Tammy's) to get the correct page position for the cards row
    // All overlays should appear at the same vertical position, aligned to first card row
    const allCards = document.querySelectorAll('[id="1kq6r0t"]');
    let cardsPageTop = 2000; // fallback
    for (const c of allCards) {
      const rect = c.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        cardsPageTop = rect.top + window.scrollY;
        break;
      }
    }
    const overlayOffset = isPhone ? 37 : (isTablet ? 191 : 291);
    const overlayTop = cardsPageTop - overlayOffset;

    console.log('[BIO] Positioning overlay:', { top: overlayTop, left: leftPosition, width: portalWidth });

    // Position and show the overlay using absolute positioning (like old code)
    overlay.style.position = 'absolute';
    overlay.style.top = overlayTop + 'px';
    overlay.style.left = leftPosition + 'px';
    overlay.style.width = portalWidth + 'px';
    overlay.style.zIndex = '100';
    overlay.removeAttribute('hidden');
    overlay.classList.add('bio-portal--visible');

    console.log('[BIO] Overlay should now be visible. Hidden attr:', overlay.hidden, 'Classes:', overlay.className);

    // Animate in the dialog (especially important for phone breakpoint)
    // Use requestAnimationFrame to ensure DOM is ready before triggering animation
    requestAnimationFrame(() => {
      const innerDialog = overlay.querySelector('[role="dialog"]');
      if (innerDialog) {
        // Remove any existing animate-in class first to reset animation
        innerDialog.classList.remove('animate-in');
        // Force reflow
        innerDialog.offsetHeight;
        // Add animate-in class to trigger the animation
        requestAnimationFrame(() => {
          innerDialog.classList.add('animate-in');
          console.log('[BIO] Added animate-in class to dialog');
        });
      } else {
        console.warn('[BIO] No dialog element found for animation');
      }
    });

    // Debug: Check inner elements
    const innerDialog = overlay.querySelector('[role="dialog"]');
    const mainContainer = overlay.querySelector('.framer-185jkq1');
    const beigeCard = overlay.querySelector('.framer-nis8ht');
    const bioPage = overlay.querySelector('.framer-1tylomn');
    console.log('[BIO] Inner elements found:', {
      innerDialog: !!innerDialog,
      mainContainer: !!mainContainer,
      beigeCard: !!beigeCard,
      bioPage: !!bioPage
    });
    if (mainContainer) {
      const cs = window.getComputedStyle(mainContainer);
      console.log('[BIO] mainContainer computed styles:', {
        display: cs.display,
        width: cs.width,
        height: cs.height,
        position: cs.position
      });
    }
    if (beigeCard) {
      const cs = window.getComputedStyle(beigeCard);
      console.log('[BIO] beigeCard computed styles:', {
        display: cs.display,
        width: cs.width,
        height: cs.height,
        backgroundColor: cs.backgroundColor
      });
    }

    // Store reference for closing
    currentOverlay = overlay;

    // Listen for escape key
    document.addEventListener('keydown', handleEscape);
  }

  // Close bio overlay
  function closeBioOverlay() {
    if (!currentOverlay) return;

    // Remove animate-in class from dialog to trigger fade out
    const dialog = currentOverlay.querySelector('[role="dialog"]');
    if (dialog) {
      dialog.classList.remove('animate-in');
    }

    // Animate out
    currentOverlay.classList.remove('bio-portal--visible');
    currentOverlay.classList.add('bio-portal--closing');

    const overlay = currentOverlay;

    // Hide after animation
    setTimeout(() => {
      overlay.setAttribute('hidden', '');
      overlay.classList.remove('bio-portal--closing');
      overlay.style.position = '';
      overlay.style.top = '';
      overlay.style.left = '';
      overlay.style.width = '';
      overlay.style.zIndex = '';
    }, 500); // Match animation duration (500ms)

    currentOverlay = null;
    document.removeEventListener('keydown', handleEscape);
  }

  // Handle escape key
  function handleEscape(e) {
    if (e.key === 'Escape') {
      closeBioOverlay();
      closeMobileMenu();
    }
  }

  // Mobile menu state
  let mobileMenuOpen = false;

  // Initialize mobile menu
  function initMobileMenu() {
    const menuToggle = document.querySelector('.sdt-menu-toggle');
    const menuOverlay = document.querySelector('.sdt-mobile-menu');

    if (!menuToggle || !menuOverlay) {
      return;
    }

    menuOverlay.style.display = 'none';
    menuToggle.classList.remove('is-open');
    mobileMenuOpen = false;

    menuToggle.addEventListener('click', () => {
      mobileMenuOpen = !mobileMenuOpen;

      if (mobileMenuOpen) {
        menuOverlay.classList.add('is-open');
        menuOverlay.style.display = 'flex';
        menuOverlay.classList.add('menu-opening');
        menuToggle.classList.add('is-open');
        menuToggle.setAttribute('aria-label', 'Close menu');

        setTimeout(() => {
          menuOverlay.classList.remove('menu-opening');
        }, 300);
      } else {
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-label', 'Open menu');

        const collapseDiv = document.createElement('div');
        collapseDiv.style.cssText = `
          position: fixed;
          top: 89px;
          left: 0;
          right: 0;
          width: 100%;
          height: 122px;
          background: rgb(242, 240, 233);
          z-index: 10000;
          will-change: height;
          transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        document.body.appendChild(collapseDiv);

        collapseDiv.offsetHeight;
        menuOverlay.style.display = 'none';
        menuOverlay.classList.remove('is-open');

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            collapseDiv.style.height = '0px';
          });
        });

        setTimeout(() => {
          collapseDiv.remove();
        }, 350);
      }
    });

    // Handle mobile menu links
    const menuLinks = menuOverlay.querySelectorAll('.sdt-mobile-menu__link');

    menuLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const href = link.getAttribute('href');

        if (href && href.startsWith('#')) {
          const targetId = href.slice(1);
          const target = document.querySelector('#' + targetId);

          if (target) {
            closeMobileMenu();

            setTimeout(() => {
              const targetY = target.getBoundingClientRect().top + window.scrollY - 60;
              window.scrollTo({ top: targetY, behavior: 'smooth' });
            }, 50);
          }
        }
      });
    });
  }

  // Close mobile menu
  function closeMobileMenu() {
    const menuToggle = document.querySelector('.sdt-menu-toggle');
    const menuOverlay = document.querySelector('.sdt-mobile-menu');

    if (!menuToggle || !menuOverlay) {
      return;
    }

    mobileMenuOpen = false;

    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-label', 'Open menu');
    menuOverlay.classList.remove('is-open');

    const collapseDiv = document.createElement('div');
    collapseDiv.style.cssText = `
      position: fixed;
      top: 89px;
      left: 0;
      right: 0;
      width: 100%;
      height: 122px;
      background: rgb(242, 240, 233);
      z-index: 10000;
      will-change: height;
      transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    document.body.appendChild(collapseDiv);

    collapseDiv.offsetHeight;
    menuOverlay.style.display = 'none';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        collapseDiv.style.height = '0px';
      });
    });

    setTimeout(() => {
      collapseDiv.remove();
    }, 350);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initBioOverlays();
    initMobileMenu();
    initAnchorLinks();
  }

  // Handle anchor links - scroll to visible element with matching ID
  function initAnchorLinks() {
    document.addEventListener('click', function(e) {
      let targetId = null;

      // Check for nested link first
      const nestedLink = e.target.closest('[data-nested-link="true"][href^="#"]');
      if (nestedLink) {
        targetId = nestedLink.getAttribute('href').slice(1);
        e.preventDefault();
        e.stopPropagation();
      } else {
        // Regular anchor link
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        targetId = link.getAttribute('href').slice(1);
      }

      if (!targetId) return;

      // Check if mobile menu is open
      const menuOverlay = document.querySelector('.sdt-mobile-menu');
      const isPhone = window.innerWidth < 810;
      const menuWasOpen = menuOverlay && window.getComputedStyle(menuOverlay).display !== 'none';

      // Find all elements with this ID and scroll to the visible one
      const elements = document.querySelectorAll('#' + targetId);
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          e.preventDefault();

          if (isPhone && menuWasOpen) {
            const targetY = el.getBoundingClientRect().top + window.scrollY - 60;
            window.scrollTo({ top: targetY, behavior: 'smooth' });
          } else {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        }
      }
    });
  }

})();
