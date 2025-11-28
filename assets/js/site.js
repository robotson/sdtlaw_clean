/**
 * SD&T Law - Site Interactions
 * Handles bio overlays and mobile menu without Framer dependencies
 */

(function() {
  'use strict';

  // Complete bio data extracted from live Framer app
  // Image insets extracted directly from Framer CSS for each attorney
  const bioData = {
    '1kq6r0t': {
      name: 'Tammy J. Swanson',
      title: 'Shareholder',
      image: './assets/images/attorney-tammy-swanson.jpg',
      email: 'TSwanson@sdtlaw.com',
      phone: '651-739-9615',
      // Framer insets: desktop/tablet for image cropping
      imageInsets: {
        desktop: { top: '-1px', right: '-6px', bottom: '-38px', left: '-6px' },
        tablet: { top: '10px', right: '-9px', bottom: '-32px', left: '-2px' }
      },
      bio: `Tammy is a shareholder at Swanson, Drobnick & Tousey and practices in the areas of family law, child protection and Federal Indian Law with a special emphasis on Indian Child Welfare Act cases. Tammy is a zealous advocate for her clients and was the 2008 Advocate of the Year for the Minnesota Fathers & Families Network. Her legal career has been devoted to protecting the best interests of children and the rights of parents and tribes. Prior to the founding of the firm in 2003, Tammy worked as staff attorney and later Director of Litigation at the Indian Child Welfare Law Center, a non-profit public defense organization that represents families in child protection cases governed by the Indian Child Welfare Act. She is also a qualified mediator for all types of family law cases.

Tammy brings not only a courtroom perspective to her cases, but a judicial one as well. Tammy began her legal career as law clerk to the Hon. Isabel Gomez in the Fourth Judicial District. She then went on to serve as Chief Judge of the Minnesota Chippewa Tribe Court of Appeals and Associate Appellate Judge for the Prairie Island Indian Community. Tammy currently serves as Special Magistrate for the Mille Lacs Band of Ojibwe Tribal Court.

Tammy Swanson is affiliated with the White Earth Band of Ojibwe Indians. She holds a B.A. in Psychology and a Juris Doctorate from the University of Minnesota.`
    },
    'a2aut': {
      name: 'Heidi A. Drobnick',
      title: 'Shareholder',
      image: './assets/images/attorney-heidi-drobnick.jpg',
      email: 'HDrobnick@sdtlaw.com',
      phone: '651-739-9615',
      imageInsets: {
        desktop: { top: '0px', right: '-1px', bottom: '-116px', left: '-12px' },
        tablet: { top: '13px', right: '-5px', bottom: '-61px', left: '0px' }
      },
      bio: `Heidi is the managing shareholder of Swanson, Drobnick & Tousey and practices in the areas of business law, contracts, Tribal governance, and wills and trusts. Prior to founding the firm Heidi was an Accountant and a small business owner. She brings real-world experience and an accountant's attention to detail to every case she handles. Her skills are well-suited for cases involving financial details; whether it be in developing an estate plan, reviewing contracts or starting a Tribal Business.

Heidi A. Drobnick is an enrolled member of the Minnesota Chippewa Tribe - Bois Forte Band of Lake Superior Chippewa. She holds a B.Ac. in Accounting from the University of Minnesota - Duluth and a Juris Doctorate from the University of Minnesota.`
    },
    '1175ksh': {
      name: 'Phyllis O. Tousey',
      title: 'Of-Counsel',
      image: './assets/images/attorney-phyllis-tousey.jpg',
      email: 'PTousey@sdtlaw.com',
      phone: '651-739-9615',
      imageInsets: {
        desktop: { top: '-15px', right: '-22px', bottom: '-74px', left: '-2px' },
        tablet: { top: '-6px', right: '-9px', bottom: '-30px', left: '-4px' }
      },
      bio: `Phyllis is Of-Counsel at Swanson, Drobnick & Tousey. Phyllis practiced in the areas of criminal defense, child protection and Federal Indian Law. Phyllis is passionate about justice, equality, and criminal defense work and it shows in her aggressive negotiation skills. She worked tirelessly both in and out of the courtroom on her clients' behalf. Prior to founding the firm in 2003, Phyllis worked as a criminal defense attorney at the Neighborhood Justice Center representing low-income defendants and as staff attorney at the Indian Child Welfare Law Center, a non-profit public defense organization that represents American Indian parents in child protection cases governed by the Indian Child Welfare Act.

Outside of the court room, Phyllis is committed to advancing equality and justice for all people, but particularly for Native and economically disadvantaged peoples. She has volunteered with The Partners in Human Rights Education Program at the University of Minnesota Human Rights Center. Prior to becoming an attorney she was a college-level educator and counselor in Women's and Indian Studies. She has also owned and operated several successful small businesses. Phyllis is a member of the Minnesota American Indian Bar Association.

Phyllis Tousey is an enrolled member of the Brothertown Indian Nation. She holds a B.A. in Broad Area Art and a M.S. of Education in Guidance Counseling from the University of Wisconsin, River Falls; and a Juris Doctorate from the University of Minnesota.`
    }
  };

  // Initialize bio overlays
  function initBioOverlays() {
    // Select by class to get ALL instances (phone, tablet, desktop variants)
    // Using attribute selector [id=x] doesn't reliably get duplicates
    const cards = document.querySelectorAll('.framer-1kq6r0t-container, .framer-a2aut-container, .framer-1175ksh-container');
    const overlay = document.getElementById('overlay');

    if (!overlay) return;

    cards.forEach(cardContainer => {
      const cardId = cardContainer.id;
      const card = cardContainer.querySelector('.framer-74g9dq');

      if (!card || !bioData[cardId]) return;

      // Skip cards that aren't actually visible (check bounding rect)
      const rect = card.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      // Make card clickable
      card.style.cursor = 'pointer';
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View ${bioData[cardId].name} bio`);

      card.addEventListener('click', (e) => {
        e.preventDefault();
        showBioOverlay(cardId, cardContainer);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showBioOverlay(cardId, cardContainer);
        }
      });
    });
  }

  // Currently open overlay info
  let currentOverlay = null;

  // Show bio overlay - matches Framer's INLINE panel design
  // The overlay is positioned absolutely within the card container, NOT as a fixed modal
  // Page scrolls normally with overlay open
  function showBioOverlay(cardId, cardContainer) {
    const data = bioData[cardId];
    if (!data) return;

    // Close any existing overlay first
    if (currentOverlay) {
      closeBioOverlay();
    }

    // Check viewport for responsive layout
    const isPhone = window.innerWidth < 810;
    const isTablet = window.innerWidth >= 810 && window.innerWidth < 1200;

    // Format bio paragraphs - phone uses simpler formatting without trailing breaks
    const bioParagraphs = isPhone
      ? data.bio.split('\n\n').map(p =>
          `<p class="framer-text framer-styles-preset-19qfgc8" data-styles-preset="WVaivrpMx">${p}</p>`
        ).join('')
      : data.bio.split('\n\n').map(p =>
          `<p class="framer-text framer-styles-preset-19qfgc8" data-styles-preset="WVaivrpMx">${p}</p><p class="framer-text framer-styles-preset-19qfgc8" data-styles-preset="WVaivrpMx"><br class="framer-text trailing-break"></p>`
        ).join('');

    // Create the portal container (like Framer does)
    // Phone needs framer-qTkKF framer-avUKP etc for style presets to work
    const portal = document.createElement('div');
    portal.className = isPhone
      ? 'bio-portal framer-qTkKF framer-Ay79T framer-rU5N4 framer-ja2YZ framer-qE7ir framer-avUKP framer-mfAtc framer-yNZqP'
      : 'bio-portal';
    portal.setAttribute('data-framer-portal-id', cardId);

    // Get card position for portal placement
    const card = cardContainer.querySelector('.framer-74g9dq');
    const cardRect = card.getBoundingClientRect();
    const scrollY = window.scrollY;

    if (isPhone) {
      // Phone layout: Using Framer's exact HTML structure
      // Contact buttons at top, then header, divider, biography
      portal.innerHTML = `
        <div aria-hidden="true" style="position: fixed; inset: 0px;"></div>
        <div>
          <div class="framer-esofaf" role="dialog" style="opacity: 1; transform: none;">
            <div class="framer-185jkq1 hidden-72rtr7 hidden-1xilv83" data-framer-name="Popover-Phone">
              <div class="framer-1udf3gh" data-framer-name="Pop over">
                <div class="framer-nis8ht" data-framer-name="Rectangle 23">
                  <div class="framer-1utqvcz">
                    <div class="framer-mpug57">
                      <!-- Email button -->
                      <div class="framer-rjug5d-container">
                        <div class="framer-htz6z framer-yBnve framer-1myzxpd framer-v-1myzxpd" data-border="true" tabindex="0" style="--border-bottom-width: 1px; --border-color: rgb(65, 33, 4); --border-left-width: 1px; --border-right-width: 1px; --border-style: solid; --border-top-width: 1px; background-color: rgba(0, 0, 0, 0); width: 100%; border-radius: 40px;">
                          <div class="framer-1gcx4ct">
                            <div class="framer-1v239di" data-framer-component-type="RichTextContainer" style="--extracted-r6o4lv: rgb(65, 33, 4);">
                              <p class="framer-text" style="--framer-font-family: 'EB Garamond', serif; --framer-text-alignment: center; --framer-text-color: var(--extracted-r6o4lv, rgb(65, 33, 4));">
                                <a class="framer-text framer-styles-preset-bmzyej" href="mailto:${data.email}" rel="noopener">Email: ${data.email}</a>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- Phone button -->
                      <div class="framer-h10esh-container">
                        <div class="framer-htz6z framer-yBnve framer-1myzxpd framer-v-1myzxpd" data-border="true" tabindex="0" style="--border-bottom-width: 1px; --border-color: rgb(65, 33, 4); --border-left-width: 1px; --border-right-width: 1px; --border-style: solid; --border-top-width: 1px; background-color: rgba(0, 0, 0, 0); width: 100%; border-radius: 40px;">
                          <div class="framer-1gcx4ct">
                            <div class="framer-1v239di" data-framer-component-type="RichTextContainer" style="--extracted-r6o4lv: rgb(65, 33, 4);">
                              <p class="framer-text" style="--framer-font-family: 'EB Garamond', serif; --framer-text-alignment: center; --framer-text-color: var(--extracted-r6o4lv, rgb(65, 33, 4));">
                                <a class="framer-text framer-styles-preset-bmzyej" href="tel:${data.phone}">Phone: ${data.phone}</a>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Bio page -->
                <div class="framer-1tylomn" data-framer-name="Bio page" style="transform: translateX(-50%);">
                  <div class="framer-q1pkkl" data-framer-name="Header">
                    <div class="framer-8w1a51">
                      <div class="framer-1iwl8ez" data-framer-component-type="RichTextContainer">
                        <h5 class="framer-text framer-styles-preset-19zukr5" id="bio-name">${data.name}</h5>
                      </div>
                      <div class="framer-1iuxll0" data-framer-component-type="RichTextContainer">
                        <h6 class="framer-text framer-styles-preset-gxwp0p">${data.title}</h6>
                      </div>
                    </div>
                    <!-- Close button -->
                    <div class="framer-lg96rc" tabindex="0" role="button" aria-label="Close">
                      <div class="framer-ppocil-container">
                        <div class="framer-uGpGz framer-9s8yld framer-v-9s8yld" data-highlight="true" tabindex="0" style="height: 100%; width: 100%;">
                          <div class="framer-IRM4W framer-fpfecg" style="--esondr: rgb(126, 104, 62);"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Divider -->
                  <div class="framer-1l9pg37" data-framer-name="Divider">
                    <div data-framer-component-type="SVG" class="framer-1oxt2pa" aria-hidden="true" style="fill: var(--token-04d28ab2-8152-4d1c-a89d-d5104464ce03, rgb(126, 104, 62)); color: var(--token-04d28ab2-8152-4d1c-a89d-d5104464ce03, rgb(126, 104, 62));">
                      <div class="svgContainer" style="width: 100%; height: 100%;">
                        <svg viewBox="0 0 300 3" preserveAspectRatio="none" width="100%" height="100%">
                          <line x1="0" y1="1.5" x2="300" y2="1.5" stroke="currentColor" stroke-width="0.5"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <!-- Biography -->
                  <div class="framer-181u6dr" data-framer-name="Biography">
                    <div class="framer-mvaie3" data-framer-component-type="RichTextContainer">
                      <h5 class="framer-text framer-styles-preset-19zukr5" style="--framer-text-color: var(--token-0f5e4091-1546-4168-9926-3cb355a3b190, rgb(65, 33, 4));">Biography</h5>
                    </div>
                    <div class="framer-1t70tm6" data-framer-name="Frame 27">
                      <div class="framer-z3ffe3" data-framer-component-type="RichTextContainer">
                        ${bioParagraphs}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // Desktop/Tablet layout - Using Framer's exact HTML structure and class names
      // Image variant class based on attorney (for per-attorney image cropping)
      // Tablet uses different variant classes than desktop
      const imageVariant = isTablet ? {
        '1kq6r0t': 'framer-1l6mjat framer-v-ys564s',    // Tammy tablet
        'a2aut': 'framer-6s7snk framer-v-1hckrtz',      // Heidi tablet
        '1175ksh': 'framer-1ouk2x7 framer-v-1g5jp36'    // Phyllis tablet
      }[cardId] || 'framer-1l6mjat framer-v-ys564s' : {
        '1kq6r0t': 'framer-v-1l6mjat',  // Tammy desktop
        'a2aut': 'framer-v-6s7snk',     // Heidi desktop
        '1175ksh': 'framer-v-1ouk2x7'   // Phyllis desktop
      }[cardId] || 'framer-v-1l6mjat';

      // Tablet uses 16px border radius, desktop uses 24px
      const borderRadius = isTablet ? '16px' : '24px 24px 0px 0px';

      portal.innerHTML = `
        <div class="framer-SXe1m framer-yBnve framer-avUKP framer-yNZqP${isTablet ? ' framer-10ae6pz framer-v-xc8jbw' : ''}" role="dialog" aria-labelledby="bio-name" style="height: 100%; width: 100%;">
          <div class="framer-rop5of">
            <div class="framer-1edteoo" style="background-color: rgb(242, 240, 233); border-radius: ${borderRadius};">
              <!-- Profile Card (left column) -->
              <div class="framer-1k4oklk">
                <div class="framer-1p8rmjh">
                  <div class="framer-1pi7at3">
                    <div class="framer-mxqsoo-container">
                      <div class="framer-DCJfz ${imageVariant}" style="height: 100%; width: 100%;">
                        <div class="framer-1si2gga">
                          <div class="framer-o0j920">
                            <div data-framer-background-image-wrapper="true" style="position: absolute; border-radius: inherit; inset: 0px;">
                              <img src="${data.image}" alt="${data.name}" style="display: block; width: 100%; height: 100%; border-radius: inherit; object-position: center center; object-fit: cover;">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="framer-8siksq">
                    <div class="framer-hz73lt">
                      <div class="framer-vu0rjv" aria-hidden="true" style="flex-shrink: 0; width: 18px; height: 12px;">
                        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                          <g clip-path="url(#email-clip)">
                            <path d="M17.6931 0.306641V10.9839H0.306763V0.306641H17.6931ZM17.6931 0.306641V10.9839V0.357777L8.98972 7.91573L0.306763 0.357777V10.9839" stroke="#412104" stroke-width="0.715909" stroke-linejoin="round"/>
                          </g>
                          <rect x="0.256" y="0.256" width="17.489" height="10.78" stroke="#412104" stroke-width="0.511"/>
                          <defs><clipPath id="email-clip"><rect width="18" height="11.29" fill="white"/></clipPath></defs>
                        </svg>
                      </div>
                      <div class="framer-go17s5">
                        <p class="framer-text" style="font-family: 'EB Garamond', serif; font-size: 14px; color: rgb(65, 33, 4);">
                          <a class="framer-text framer-styles-preset-bmzyej" href="mailto:${data.email}" style="color: rgb(126, 104, 62);">Email:&nbsp; ${data.email}</a>
                        </p>
                      </div>
                    </div>
                    <div class="framer-e0xee0">
                      <div class="framer-1749sgb" aria-hidden="true" style="flex-shrink: 0; width: 17px; height: 17px;">
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                          <g clip-path="url(#phone-clip)">
                            <path d="M5.0079 11.9194C9.57923 16.5393 13.7747 16.6605 14.5386 16.6363C14.6113 16.6363 14.6841 16.5878 14.7326 16.5271L16.5999 13.4351C16.6605 13.326 16.6363 13.1926 16.5272 13.132L12.5864 10.5129C12.5136 10.4644 12.4045 10.4644 12.3317 10.5129L9.87024 12.2468C9.79749 12.2953 9.68836 12.3074 9.6156 12.2468C9.13058 11.9194 5.08065 7.86949 4.74114 7.37235C4.69264 7.29959 4.69264 7.19046 4.74114 7.11771L6.47509 4.65623C6.52359 4.58347 6.53572 4.47434 6.47509 4.40159L3.8681 0.460792C3.79535 0.363788 3.66197 0.327411 3.56496 0.388039L0.472951 2.2675C0.412324 2.30387 0.363822 2.37663 0.363822 2.46151C0.33957 3.23754 0.460826 7.43298 5.08065 11.9922L5.0079 11.9194Z" stroke="#412104" stroke-width="0.6" stroke-linejoin="round"/>
                          </g>
                          <defs><clipPath id="phone-clip"><rect width="17" height="17" fill="white"/></clipPath></defs>
                        </svg>
                      </div>
                      <div class="framer-fly4qh">
                        <p class="framer-text" style="font-family: 'EB Garamond', serif; font-size: 14px; color: rgb(65, 33, 4);">
                          <a class="framer-text framer-styles-preset-bmzyej" href="tel:${data.phone}" style="color: rgb(126, 104, 62);">Phone:&nbsp; ${data.phone}</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="framer-1cexlgh">
                  <p class="framer-text framer-address-label" style="font-family: 'EB Garamond', serif; font-weight: 600; line-height: 1.25em; color: rgb(65, 33, 4);">Address:</p>
                  <p class="framer-text framer-address-value" style="font-family: 'EB Garamond', serif; line-height: 1.25em; color: rgb(65, 33, 4);">3120 Woodbury Drive Suite 200</p>
                </div>
              </div>
              <!-- Biography (right column) -->
              <div class="framer-1etjeh">
                <div class="framer-1lwgu3k">
                  <h5 class="framer-text framer-styles-preset-19zukr5" style="color: rgb(65, 33, 4);">Biography</h5>
                </div>
                <div class="framer-1xy1e9l">
                  <div class="framer-4h32yw">
                    ${bioParagraphs}
                  </div>
                </div>
              </div>
              <!-- Header (positioned absolutely) -->
              <div class="framer-1hrcbbx" style="transform: translateX(-50%);">
                <div class="framer-9biryz">
                  <div class="framer-wjb9w6">
                    <h5 class="framer-text framer-styles-preset-19zukr5" id="bio-name">${data.name}</h5>
                    <h5 class="framer-text framer-styles-preset-19zukr5" style="color: rgb(65, 33, 4);">${data.title}</h5>
                  </div>
                  <div class="framer-a94fu2-container">
                    <button class="framer-uGpGz framer-9s8yld" aria-label="Close bio" tabindex="0">
                      <div class="framer-IRM4W framer-fpfecg"></div>
                    </button>
                  </div>
                </div>
                <div class="framer-17say78">
                  <div class="framer-ovoqie" aria-hidden="true" style="flex-shrink: 0; width: 100%; height: 1px;">
                    <svg style="width: 100%; height: 100%; display: block;" viewBox="0 0 1024 1" preserveAspectRatio="none">
                      <line x1="0" y1="0.5" x2="1024" y2="0.5" stroke="#412104" stroke-width="0.5"></line>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Position portal centered in viewport (like Framer does)
    // Framer uses a 1200px wrapper containing a 1123px panel, centered in the viewport
    // Phone: 380px wide, centered in viewport
    const portalWidth = isPhone ? 380 : (isTablet ? 810 : 1200);
    const leftPosition = (window.innerWidth - portalWidth) / 2;

    // Find the first visible card to get the correct page position for the cards row
    const allCards = document.querySelectorAll('[id="1kq6r0t"]');
    let cardsPageTop = 2000; // fallback
    for (const c of allCards) {
      const rect = c.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        cardsPageTop = rect.top + window.scrollY;
        break;
      }
    }

    // Position overlay above the cards
    // Offset varies by breakpoint - measured from Framer: card pageTop - portal pageTop
    // Desktop: ~291px; Tablet: ~191px; Phone: ~37px
    const overlayOffset = isPhone ? 37 : (isTablet ? 191 : 291);
    const overlayTop = cardsPageTop - overlayOffset;

    portal.style.position = 'absolute';
    portal.style.top = overlayTop + 'px';
    portal.style.left = leftPosition + 'px';
    portal.style.width = portalWidth + 'px';
    portal.style.zIndex = '100';

    document.body.appendChild(portal);

    // Store reference for closing
    currentOverlay = {
      portal: portal,
      cardId: cardId
    };

    // Animate in (slide up + fade)
    requestAnimationFrame(() => {
      portal.classList.add('bio-portal--visible');
      // Trigger animation after DOM is ready
      requestAnimationFrame(() => {
        const dialog = portal.querySelector('[role="dialog"]');
        if (dialog) dialog.classList.add('animate-in');
      });
    });

    // Close handlers - use Framer's close button class (same for all breakpoints now)
    const closeBtn = portal.querySelector('.framer-uGpGz') || portal.querySelector('.framer-lg96rc');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeBioOverlay);
    }
    document.addEventListener('keydown', handleEscape);

    // Close when clicking anywhere except links
    portal.addEventListener('click', function(e) {
      // Don't close if clicking on a link
      if (e.target.closest('a')) return;
      closeBioOverlay();
    });
  }

  // Close bio overlay
  function closeBioOverlay() {
    if (!currentOverlay) return;

    const { portal } = currentOverlay;

    // Animate out
    portal.classList.remove('bio-portal--visible');
    portal.classList.add('bio-portal--closing');

    // Remove after animation
    setTimeout(() => {
      if (portal.parentNode) {
        portal.parentNode.removeChild(portal);
      }
      currentOverlay = null;
    }, 300);

    document.removeEventListener('keydown', handleEscape);
  }

  // Handle escape key
  function handleEscape(e) {
    if (e.key === 'Escape') {
      closeBioOverlay();
      closeMobileMenu();
    }
  }

  // Mobile menu state (shared between init and close functions)
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
            // Close menu first
            closeMobileMenu();

            // Scroll to target with offset for header only (menu is closing)
            // Use setTimeout to let menu close animation start
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

    // Reset the shared state
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
  // (needed because there are duplicate IDs for responsive variants)
  // Also handles Framer's nested links (data-nested-link="true" with href attribute)
  function initAnchorLinks() {
    document.addEventListener('click', function(e) {
      let targetId = null;

      // Check for nested link first (span with data-nested-link and href)
      const nestedLink = e.target.closest('[data-nested-link="true"][href^="#"]');
      if (nestedLink) {
        targetId = nestedLink.getAttribute('href').slice(1);
        e.preventDefault();
        e.stopPropagation(); // Prevent parent <a> from firing
      } else {
        // Regular anchor link
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        targetId = link.getAttribute('href').slice(1);
      }

      if (!targetId) return;

      // Check if mobile menu is open (we'll close it, so need to scroll extra)
      const menuOverlay = document.querySelector('.sdt-mobile-menu');
      const isPhone = window.innerWidth < 810;
      const menuWasOpen = menuOverlay && window.getComputedStyle(menuOverlay).display !== 'none';

      // Find all elements with this ID and scroll to the visible one
      const elements = document.querySelectorAll('#' + targetId);
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        // Check if element is visible (has dimensions and not display:none)
        if (rect.width > 0 && rect.height > 0) {
          e.preventDefault();

          // On phone, if menu was open, scroll extra to compensate for menu closing
          // Menu height is ~121px, so scroll further to match Framer's visual position
          if (isPhone && menuWasOpen) {
            const targetY = el.getBoundingClientRect().top + window.scrollY - 60; // Position below header
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
