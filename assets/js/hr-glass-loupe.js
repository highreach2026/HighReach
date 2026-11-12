/**
 * High Reach Glass Magnifying Effect (Ultra High Optical Clarity)
 * Proprietary interactive optical lens engineered exclusively for High Reach Media
 * Active across entire pages and on all pages of the website.
 * Provides a pure, crystal-clear zoom view on letters with zero blur,
 * zero double-vision, authentic bevel reflection, seamless background, and smooth inertia.
 */
(function () {
  'use strict';

  function initUniversalGlass() {
    // 1. Ensure the loupe DOM exists and is attached directly to document.body
    var loupe = document.getElementById('hrGlassLoupe');
    if (!loupe) {
      loupe = document.createElement('div');
      loupe.className = 'hr-glass-loupe';
      loupe.id = 'hrGlassLoupe';
      loupe.innerHTML = '<div class="hr-glass-loupe__content" id="hrGlassContent"></div><div class="hr-glass-loupe__glare"></div><div class="hr-glass-loupe__rim"></div>';
      document.body.appendChild(loupe);
    } else if (loupe.parentElement !== document.body) {
      document.body.appendChild(loupe);
    }

    var loupeContent = document.getElementById('hrGlassContent');
    if (!loupeContent) return;

    // High Reach Chromatic Aberration & Refraction Filter (Custom Brand Palette):
    // Glitches letter edges using the 4 brand colors: #0062F3, #36c2b0, #a6ec6a, #ffd60a
    // Combined with optical displacement from displace.png for authentic edge chromatic glitch fringe.
    if (!document.getElementById('hrLensFilterSvg')) {
      var base = 'assets/images/';
      var scripts = document.getElementsByTagName('script');
      for (var s = 0; s < scripts.length; s++) {
        var src = scripts[s].getAttribute('src') || '';
        if (src.indexOf('hr-glass-loupe.js') !== -1) {
          base = src.replace(/js\/hr-glass-loupe\.js.*$/, 'images/');
        }
      }
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('id', 'hrLensFilterSvg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
      svg.innerHTML =
        '<filter id="hrLensRefract" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">' +
        '<feTurbulence id="hrLensMap" type="fractalNoise" baseFrequency="0.02" numOctaves="1" result="map"/>' +
        // 1. #ffd60a (Yellow): outer negative offset
        '<feOffset id="hrGlitchYellow" in="SourceGraphic" dx="-2.0" dy="1.16" result="sYellow"/>' +
        '<feColorMatrix in="sYellow" type="matrix" values="0 0 0 1.000 0  0 0 0 0.839 0  0 0 0 0.039 0  0 0 0 0.82 0" result="cYellow"/>' +
        // 2. #a6ec6a (Lime): inner negative offset
        '<feOffset id="hrGlitchLime" in="SourceGraphic" dx="-1.0" dy="0.58" result="sLime"/>' +
        '<feColorMatrix in="sLime" type="matrix" values="0 0 0 0.651 0  0 0 0 0.925 0  0 0 0 0.416 0  0 0 0 0.82 0" result="cLime"/>' +
        // 3. #36c2b0 (Cyan): inner positive offset
        '<feOffset id="hrGlitchCyan" in="SourceGraphic" dx="1.0" dy="-0.58" result="sCyan"/>' +
        '<feColorMatrix in="sCyan" type="matrix" values="0 0 0 0.212 0  0 0 0 0.761 0  0 0 0 0.690 0  0 0 0 0.82 0" result="cCyan"/>' +
        // 4. #0062F3 (Electric Blue): outer positive offset
        '<feOffset id="hrGlitchBlue" in="SourceGraphic" dx="2.0" dy="-1.16" result="sBlue"/>' +
        '<feColorMatrix in="sBlue" type="matrix" values="0 0 0 0.000 0  0 0 0 0.384 0  0 0 0 0.953 0  0 0 0 0.82 0" result="cBlue"/>' +
        // Merge brand color fringe layers with crisp SourceGraphic on top
        '<feMerge result="colorFringe">' +
        '<feMergeNode in="cBlue"/>' +
        '<feMergeNode in="cCyan"/>' +
        '<feMergeNode in="cLime"/>' +
        '<feMergeNode in="cYellow"/>' +
        '<feMergeNode in="SourceGraphic"/>' +
        '</feMerge>' +
        // Refract the composite through procedural map (zero 404 / network fail dependency)
        '<feDisplacementMap in="colorFringe" in2="map" scale="5" xChannelSelector="R" yChannelSelector="R"/>' +
        '</filter>';
      document.body.appendChild(svg);
    }

    var ZOOM = 1.42; // Optical zoom: crystal clarity without distortion
    var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    function getRadius() {
      return (loupe.offsetWidth || 80) / 2;
    }

    var targetX = window.innerWidth / 2;
    var targetY = window.innerHeight / 2;
    var currentX = targetX;
    var currentY = targetY;
    var hasMoved = false;
    var isTargetActive = false;
    var currentTarget = null;
    var activeClone = null;

    function clearMask(el) {
      if (el) {
        el.style.maskImage = '';
        el.style.webkitMaskImage = '';
        if (el.parentElement) {
          el.parentElement.style.maskImage = '';
          el.parentElement.style.webkitMaskImage = '';
        }
      }
    }

    function getDistToRect(x, y, rect) {
      var dx = Math.max(rect.left - x, 0, x - rect.right);
      var dy = Math.max(rect.top - y, 0, y - rect.bottom);
      return Math.hypot(dx, dy);
    }

    // Helper functions: explicitly exclude navbar phone and WhatsApp contact action buttons from bubble effect
    function isNavbarActionElement(el) {
      if (!el) return false;
      return !!(el.closest && (
        el.closest('.main-header__actions, .hr-header-icon-btn, .main-header .hr-hero-icon-btn, .sticky-header .hr-hero-icon-btn, .main-header .hr-hero-action-buttons, .sticky-header .hr-hero-action-buttons') ||
        (el.closest('.main-header, .sticky-header') && el.closest('a[href^="tel:"], a[href*="wa.me"]'))
      ));
    }

    function isNavbarActionCoords(x, y) {
      var topEl = document.elementFromPoint ? document.elementFromPoint(x, y) : null;
      if (isNavbarActionElement(topEl)) return true;

      var elements = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [];
      for (var ei = 0; ei < elements.length; ei++) {
        if (isNavbarActionElement(elements[ei])) return true;
      }

      var navbarBtns = document.querySelectorAll('.main-header__actions, .hr-header-icon-btn, .main-header .hr-hero-icon-btn, .sticky-header .hr-hero-icon-btn, .main-header a[href^="tel:"], .main-header a[href*="wa.me"], .sticky-header a[href^="tel:"], .sticky-header a[href*="wa.me"]');
      for (var bi = 0; bi < navbarBtns.length; bi++) {
        var bRect = navbarBtns[bi].getBoundingClientRect();
        if (bRect.width > 0 && bRect.height > 0) {
          if (x >= bRect.left - 6 && x <= bRect.right + 6 && y >= bRect.top - 6 && y <= bRect.bottom + 6) {
            return true;
          }
        }
      }
      return false;
    }

    // Helper functions: explicitly exclude the Home page popup form from the bubble effect (retaining it on Contact page)
    function isHomePopupElement(el) {
      if (!el) return false;
      return !!(el.closest && el.closest(
        '#homeContactPopup, .hr-home-popup, .hr-home-popup__dialog, .contact-one--popup, #homePopupContactForm'
      ));
    }

    function isHomePopupCoords(x, y) {
      var popup = document.getElementById('homeContactPopup');
      if (!popup || !popup.classList.contains('is-active')) return false;

      var topEl = document.elementFromPoint ? document.elementFromPoint(x, y) : null;
      if (isHomePopupElement(topEl)) return true;

      var elements = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [];
      for (var ei = 0; ei < elements.length; ei++) {
        if (isHomePopupElement(elements[ei])) return true;
      }

      var popupDialog = popup.querySelector('.hr-home-popup__dialog');
      if (popupDialog) {
        var dRect = popupDialog.getBoundingClientRect();
        if (dRect.width > 0 && dRect.height > 0) {
          if (x >= dRect.left - 4 && x <= dRect.right + 4 && y >= dRect.top - 4 && y <= dRect.bottom + 4) {
            return true;
          }
        }
      }
      return false;
    }

    // Identify the best interactive target (logos, images, typography, badges) under coordinates (clientX, clientY)
    function findInteractiveTarget(clientX, clientY) {
      if (isNavbarActionCoords(clientX, clientY) || isHomePopupCoords(clientX, clientY)) {
        return null;
      }
      var elements = document.elementsFromPoint ? document.elementsFromPoint(clientX, clientY) : [];
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        if (!el || el === document.body || el === document.documentElement) continue;

        // Skip loupe itself, cursors, preloader, videos, form inputs, action buttons, home popup form, and navbar phone/whatsapp icons
        if (isNavbarActionElement(el) || isHomePopupElement(el) || el.closest('#hrGlassLoupe, .custom-cursor__cursor, .custom-cursor__cursor-two, .preloader, canvas, video, input, textarea, select, .cr-btn, .hr-btn, button, .btn, .main-header__actions, .hr-header-icon-btn, .main-header .hr-hero-icon-btn, .sticky-header .hr-hero-icon-btn, #homeContactPopup, .hr-home-popup, .contact-one--popup')) {
          continue;
        }

        // Priority 1: About Us section badge in left corner (.about-badge)
        var aboutBadge = el.closest('.about-badge');
        if (aboutBadge && aboutBadge.offsetWidth > 15) {
          return aboutBadge;
        }

        // Priority 1.5: High Reach footer stroke title (.main-footer__bottom__title, .stroke-text-title, or footer svg)
        var footerTitle = el.closest('.main-footer__bottom__title, .stroke-text-title, .is-footer-title');
        if (footerTitle) {
          var fSvg = footerTitle.querySelector('svg') || (footerTitle.tagName && footerTitle.tagName.toLowerCase() === 'svg' ? footerTitle : null);
          if (fSvg) return fSvg;
          return footerTitle;
        }
        var parentSvg = el.closest('svg');
        if (parentSvg) {
          var footerSvg = parentSvg.closest('.main-footer__bottom, .is-footer-title, .stroke-text-title');
          if (footerSvg) return parentSvg;
          var sRect = parentSvg.getBoundingClientRect ? parentSvg.getBoundingClientRect() : null;
          if (sRect && sRect.width > 10 && sRect.height > 10) {
            return parentSvg;
          }
        }

        // Priority 2: Direct Image element (logos, client cards, hero/about/portfolio/blog images)
        var tagName = el.tagName ? el.tagName.toLowerCase() : '';
        if (tagName === 'img' && el.offsetWidth > 10 && el.offsetHeight > 10) {
          return el;
        }

        // Priority 3: Direct SVG element or path inside SVG (vector logos, SVG icons)
        if (tagName === 'svg' && el.offsetWidth > 10 && el.offsetHeight > 10) {
          return el;
        }
        var parentSvg = el.closest('svg');
        if (parentSvg && parentSvg.offsetWidth > 10 && parentSvg.offsetHeight > 10) {
          return parentSvg;
        }

        // Priority 4: About Us section image containers (ensures left corner image is always caught)
        var aboutImgContainer = el.closest('.about-one__image__one, .about-one__image__two, .bw-reveal-left, .bw-reveal-right');
        if (aboutImgContainer) {
          var aImg = aboutImgContainer.querySelector('img');
          if (aImg && aImg.offsetWidth > 10 && aImg.offsetHeight > 10) {
            return aImg;
          }
        }

        // Priority 5: Logo containers (.main-header__logo, .logo-box, .hr-client-card, .brand-one__item, etc.)
        var logoBox = el.closest('.main-header__logo, .logo-box, .hr-client-card, .brand-one__item, .logo-retina, .footer-widget__logo');
        if (logoBox) {
          var logoImg = logoBox.querySelector('img, svg');
          if (logoImg && logoImg.offsetWidth > 10 && logoImg.offsetHeight > 10) {
            return logoImg;
          }
          if (logoBox.offsetWidth > 10 && logoBox.offsetHeight > 10) {
            return logoBox;
          }
        }

        // Priority 6: Wrapped image inside an anchor or card (e.g. <a href="..."><img ...></a>)
        var childImg = el.querySelector ? el.querySelector('img, svg') : null;
        if (childImg && childImg.offsetWidth > 10 && childImg.offsetHeight > 10) {
          return childImg;
        }

        // Priority 7: 360° Counter & Funfact in About Us section
        var countTarget = el.closest('.about-one__funfact__count, .count-box');
        if (countTarget && countTarget.offsetHeight > 10) {
          return countTarget;
        }

        var funfactText = el.closest('.about-one__funfact__text');
        if (funfactText && funfactText.offsetHeight > 10) {
          return funfactText;
        }

        var funfactCard = el.closest('.about-one__funfact');
        if (funfactCard) {
          var fCount = funfactCard.querySelector('.about-one__funfact__count, .count-box');
          var fText = funfactCard.querySelector('.about-one__funfact__text');
          if (fCount) {
            var cBox = fCount.getBoundingClientRect();
            if (clientX <= cBox.right + 36) {
              return fCount;
            }
          }
          if (fText) return fText;
          if (fCount) return fCount;
        }

        // Priority 8: Contact page hero header content
        var headerContent = el.closest('#hrHeaderContent');
        if (headerContent) return headerContent;

        // Priority 9: Semantic typography tags and prominent text containers
        var textTarget = el.closest('h1, h2, h3, h4, h5, h6, .cr-cta__title, .cr-cta__sub, .sec-title__title, .hero-one__title, .page-header__title, .banner-title, .hr-breadcrumb, .amoxi-breadcrumb, p, a, button, li, .sec-title__tagline, .contact-one__info__title, .contact-one__info__link, .error-404__title, .hr-404__number, .hr-404__title, .hr-404__eyebrow, .hr-404__text, .hr-404__button');
        if (textTarget && textTarget.textContent && textTarget.textContent.trim().length > 0) {
          return textTarget;
        }

        // Priority 10: Any leaf text container
        if (el.textContent && el.textContent.trim().length > 0 && el.offsetHeight > 10 && el.offsetHeight < 350 && el.offsetWidth < 1400) {
          return el;
        }
      }
      return null;
    }

    // Switch active target and create clean styled clone inside loupe
    function setTarget(newTarget) {
      if (newTarget && (isNavbarActionElement(newTarget) || isHomePopupElement(newTarget))) {
        newTarget = null;
      }
      if (currentTarget === newTarget) return;

      if (currentTarget) {
        clearMask(currentTarget);
      }

      currentTarget = newTarget;

      if (!currentTarget) {
        loupeContent.innerHTML = '';
        activeClone = null;
        loupe.classList.remove('hr-glass-loupe--badge');
        return;
      }

      // Loupe stays 100% transparent so background gradient shines through
      loupe.style.backgroundColor = 'transparent';

      var isBadge = currentTarget.classList && currentTarget.classList.contains('about-badge');
      if (isBadge) {
        loupe.classList.add('hr-glass-loupe--badge');
      } else {
        loupe.classList.remove('hr-glass-loupe--badge');
      }

      // Temporarily clear any mask on currentTarget while cloning so clone is full & unmasked
      var prevMask = currentTarget.style.maskImage;
      var prevWebkitMask = currentTarget.style.webkitMaskImage;
      currentTarget.style.maskImage = '';
      currentTarget.style.webkitMaskImage = '';

      loupeContent.innerHTML = '';
      activeClone = currentTarget.cloneNode(true);

      // Restore mask on currentTarget
      currentTarget.style.maskImage = prevMask;
      currentTarget.style.webkitMaskImage = prevWebkitMask;

      // Remove duplicate IDs from clone
      activeClone.removeAttribute('id');
      var ids = activeClone.querySelectorAll ? activeClone.querySelectorAll('[id]') : [];
      for (var i = 0; i < ids.length; i++) ids[i].removeAttribute('id');

      // Guarantee clone itself has no mask
      activeClone.style.maskImage = 'none';
      activeClone.style.webkitMaskImage = 'none';

      var rect = currentTarget.getBoundingClientRect();

      // Mirror computed styling so zoomed typography, logos, and images render pixel-identical
      var TEXT_PROPS = [
        'color', '-webkit-text-fill-color', '-webkit-text-stroke-width', '-webkit-text-stroke-color', 'text-shadow',
        'font-family', 'font-size', 'font-weight', 'font-style', 'font-variant', 'line-height',
        'letter-spacing', 'word-spacing', 'text-transform', 'text-align', 'text-decoration',
        'text-indent', 'white-space', 'word-break', 'overflow-wrap', 'vertical-align',
        'display', 'box-sizing', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'background-color', 'background-image', 'background-size', 'background-position',
        'background-repeat', '-webkit-background-clip', 'background-clip',
        'border-top-width', 'border-top-style', 'border-top-color',
        'border-right-width', 'border-right-style', 'border-right-color',
        'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
        'border-left-width', 'border-left-style', 'border-left-color',
        'border-radius',
        'border-top-left-radius', 'border-top-right-radius',
        'border-bottom-left-radius', 'border-bottom-right-radius',
        'clip-path', '-webkit-clip-path',
        'gap', 'align-items', 'justify-content', 'flex-direction',
        'object-fit', 'object-position', 'fill', 'stroke', 'stroke-width',
        'stroke-dasharray', 'stroke-dashoffset'
      ];

      var origNodes = [currentTarget].concat(currentTarget.querySelectorAll ? Array.prototype.slice.call(currentTarget.querySelectorAll('*')) : []);
      var cloneNodes = [activeClone].concat(activeClone.querySelectorAll ? Array.prototype.slice.call(activeClone.querySelectorAll('*')) : []);

      for (var n = 0; n < cloneNodes.length && n < origNodes.length; n++) {
        var o = origNodes[n];
        var c = cloneNodes[n];
        var ocs = window.getComputedStyle(o);

        // Special handling for circular text around the logo (.curved-circle span):
        // Preserve exact circleType geometry (position, rotation, radius transform-origin)
        var isCurvedTextChild = o.closest && o.closest('.curved-circle');
        if (isCurvedTextChild && o.tagName && o.tagName.toLowerCase() === 'span') {
          c.style.position = o.style.position || 'absolute';
          c.style.left = o.style.left || '50%';
          c.style.marginLeft = o.style.marginLeft || '';
          c.style.transform = o.style.transform || o.style.webkitTransform || '';
          c.style.transformOrigin = o.style.transformOrigin || o.style.webkitTransformOrigin || 'center 5.35em';
          c.style.webkitTransform = c.style.transform;
          c.style.webkitTransformOrigin = c.style.transformOrigin;
          c.style.display = 'inline-block';
          c.style.color = '#ffffff';
          c.style.fontSize = ocs.getPropertyValue('font-size') || '14px';
          c.style.fontWeight = ocs.getPropertyValue('font-weight') || '500';
          c.style.letterSpacing = ocs.getPropertyValue('letter-spacing') || '1.5px';
          c.style.textTransform = 'uppercase';
          c.style.opacity = '1';
          c.style.visibility = 'visible';
          continue;
        }

        if (o.classList && o.classList.contains('curved-circle')) {
          c.style.position = 'absolute';
          c.style.inset = '0';
          c.style.margin = 'auto';
          c.style.width = o.offsetWidth + 'px';
          c.style.height = o.offsetHeight + 'px';
          c.style.display = 'flex';
          c.style.justifyContent = 'center';
          c.style.alignItems = 'center';
          continue;
        }

        // Hide duplicate 3D button ghost row inside loupe to keep typography clean
        if (o.classList && o.classList.contains('Button3D_labelRowGhost')) {
          c.style.display = 'none';
          continue;
        }

        for (var p = 0; p < TEXT_PROPS.length; p++) {
          var prop = TEXT_PROPS[p];
          var val = ocs.getPropertyValue(prop);
          if (val) c.style.setProperty(prop, val);
        }

        // Flatten GSAP SplitText 3D transforms, restore full opacity, kill shadows (razor-sharp glyphs)
        c.style.setProperty('opacity', '1');
        c.style.setProperty('visibility', 'visible');
        c.style.setProperty('transform', 'none');
        c.style.setProperty('perspective', 'none');

        // Soften shadows
        var sh = ocs.getPropertyValue('text-shadow');
        if (sh && sh !== 'none') {
          c.style.setProperty('text-shadow', sh.replace(/rgba\(([^)]+),\s*([\d.]+)\)/g, function (m, rgb, a) {
            return 'rgba(' + rgb + ', ' + (parseFloat(a) * 0.5).toFixed(3) + ')';
          }));
        }
        c.style.setProperty('mask-image', 'none');
        c.style.setProperty('-webkit-mask-image', 'none');
        c.style.setProperty('animation', 'none');
        c.style.setProperty('transition', 'none');
        c.style.setProperty('filter', 'none');
      }

      // Root: lock exact size so scaling inside the lens matches the page perfectly
      activeClone.style.setProperty('width', rect.width + 'px', 'important');
      activeClone.style.setProperty('min-width', rect.width + 'px', 'important');
      activeClone.style.setProperty('max-width', 'none', 'important');
      activeClone.style.setProperty('height', rect.height + 'px', 'important');
      activeClone.style.setProperty('min-height', rect.height + 'px', 'important');
      activeClone.style.setProperty('max-height', 'none', 'important');
      activeClone.style.boxSizing = 'border-box';
      activeClone.style.margin = '0';
      activeClone.style.position = 'absolute';
      activeClone.style.top = '0';
      activeClone.style.left = '0';
      activeClone.style.transformOrigin = '0 0';
      activeClone.style.pointerEvents = 'none';
      activeClone.style.userSelect = 'none';

      // Explicitly transfer root corner radii & clip-paths (e.g. pill-shaped 1000px corners on About images)
      var rootCs = window.getComputedStyle(currentTarget);
      var tl = rootCs.getPropertyValue('border-top-left-radius');
      var tr = rootCs.getPropertyValue('border-top-right-radius');
      var br = rootCs.getPropertyValue('border-bottom-right-radius');
      var bl = rootCs.getPropertyValue('border-bottom-left-radius');
      if (tl) activeClone.style.setProperty('border-top-left-radius', tl, 'important');
      if (tr) activeClone.style.setProperty('border-top-right-radius', tr, 'important');
      if (br) activeClone.style.setProperty('border-bottom-right-radius', br, 'important');
      if (bl) activeClone.style.setProperty('border-bottom-left-radius', bl, 'important');
      var cp = rootCs.getPropertyValue('clip-path') || rootCs.getPropertyValue('-webkit-clip-path');
      if (cp && cp !== 'none') {
        activeClone.style.setProperty('clip-path', cp, 'important');
        activeClone.style.setProperty('-webkit-clip-path', cp, 'important');
      }

      // Prevent responsive framework rules (img { max-width: 100% }) from squishing logos/images inside the 80px loupe
      var cloneImgs = activeClone.querySelectorAll ? Array.prototype.slice.call(activeClone.querySelectorAll('img')) : [];
      if (activeClone.tagName && activeClone.tagName.toLowerCase() === 'img') {
        cloneImgs.push(activeClone);
      }
      for (var ci = 0; ci < cloneImgs.length; ci++) {
        cloneImgs[ci].style.setProperty('max-width', 'none', 'important');
        cloneImgs[ci].style.setProperty('max-height', 'none', 'important');
      }

      // Ensure 360 count element clone has current live text
      if (currentTarget.classList && (currentTarget.classList.contains('about-one__funfact__count') || currentTarget.classList.contains('count-box'))) {
        var cCount = activeClone.querySelector ? activeClone.querySelector('.count-text') : null;
        var oCount = currentTarget.querySelector ? currentTarget.querySelector('.count-text') : null;
        if (cCount && oCount) {
          cCount.textContent = oCount.textContent;
        }
      }

      // Ensure SVG elements retain valid viewBox for zoom scaling
      if (activeClone.tagName && activeClone.tagName.toLowerCase() === 'svg') {
        if (!activeClone.getAttribute('viewBox') && rect.width && rect.height) {
          activeClone.setAttribute('viewBox', '0 0 ' + rect.width + ' ' + rect.height);
        }
      }

      // High Reach footer title: ensure text inside clone has solid brilliant white stroke and fill,
      // and match SVG font-size and positioning exactly
      var isFooterSvg = (currentTarget.closest && currentTarget.closest('.main-footer__bottom, .is-footer-title, .stroke-text-title')) ||
                        (currentTarget.classList && (currentTarget.classList.contains('main-footer__bottom__title') || currentTarget.classList.contains('stroke-text-title')));
      if (isFooterSvg) {
        var cloneSvgTexts = activeClone.querySelectorAll ? activeClone.querySelectorAll('text') : [];
        for (var sti = 0; sti < cloneSvgTexts.length; sti++) {
          var st = cloneSvgTexts[sti];
          st.style.setProperty('fill', '#ffffff', 'important');
          st.style.setProperty('stroke', '#ffffff', 'important');
          st.style.setProperty('stroke-width', '1.5px', 'important');
          st.style.setProperty('opacity', '1', 'important');
          st.style.setProperty('visibility', 'visible', 'important');
          st.style.setProperty('animation', 'none', 'important');
        }
      }

      loupeContent.appendChild(activeClone);
    }

    function onPointerMove(clientX, clientY) {
      targetX = clientX;
      targetY = clientY;

      if (!hasMoved) {
        currentX = targetX;
        currentY = targetY;
        hasMoved = true;
      }

      // If pointer is touching or hovering over navbar phone, WhatsApp icons, or home popup form, strictly prevent bubble effect from appearing
      if (isNavbarActionCoords(clientX, clientY) || isHomePopupCoords(clientX, clientY)) {
        if (isTargetActive) {
          isTargetActive = false;
          loupe.classList.remove('is-active');
          if (currentTarget) {
            clearMask(currentTarget);
          }
          setTarget(null);
        }
        return;
      }

      // Check if pointer is still inside or near current target (hysteresis for smooth interaction)
      var candidate = null;
      if (currentTarget) {
        var cRect = currentTarget.getBoundingClientRect();
        if (clientX >= cRect.left && clientX <= cRect.right && clientY >= cRect.top && clientY <= cRect.bottom) {
          candidate = currentTarget;
        } else if (getDistToRect(clientX, clientY, cRect) < 25) {
          var directHit = findInteractiveTarget(clientX, clientY);
          candidate = directHit || currentTarget;
        }
      }

      if (!candidate) {
        candidate = findInteractiveTarget(clientX, clientY);
      }

      if (candidate) {
        setTarget(candidate);
        if (!isTargetActive) {
          isTargetActive = true;
          loupe.classList.add('is-active');
        }
      } else {
        if (isTargetActive) {
          isTargetActive = false;
          loupe.classList.remove('is-active');
          if (currentTarget) {
            clearMask(currentTarget);
          }
          setTarget(null);
        }
      }
    }

    function onPointerLeave() {
      isTargetActive = false;
      loupe.classList.remove('is-active');
      if (currentTarget) {
        clearMask(currentTarget);
      }
      setTarget(null);
    }

    // Mouse / Desktop pointer events
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      onPointerMove(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      onPointerMove(e.clientX, e.clientY);
    }, { passive: true });

    document.addEventListener('mouseleave', onPointerLeave);
    window.addEventListener('scroll', function () {
      if (currentTarget && !isTargetActive) {
        clearMask(currentTarget);
        setTarget(null);
      }
    }, { passive: true });

    // Touch events for mobile, tablets, and touch screens:
    // Activates instantly on tap/touch with smooth hold duration on release
    var touchTimeout = null;

    function handleTouch(e) {
      if (touchTimeout) {
        clearTimeout(touchTimeout);
        touchTimeout = null;
      }
      if (e.touches && e.touches[0]) {
        var tX = e.touches[0].clientX;
        var tY = e.touches[0].clientY;
        if (isNavbarActionCoords(tX, tY) || isHomePopupCoords(tX, tY)) {
          onPointerLeave();
          return;
        }
        onPointerMove(tX, tY);
      }
    }

    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });
    window.addEventListener('touchend', function (e) {
      if (touchTimeout) clearTimeout(touchTimeout);
      if (e.changedTouches && e.changedTouches[0]) {
        if (isNavbarActionCoords(e.changedTouches[0].clientX, e.changedTouches[0].clientY) || isHomePopupCoords(e.changedTouches[0].clientX, e.changedTouches[0].clientY)) {
          onPointerLeave();
          return;
        }
      }
      touchTimeout = setTimeout(function () {
        onPointerLeave();
      }, 1200);
    }, { passive: true });
    window.addEventListener('touchcancel', onPointerLeave, { passive: true });

    var lastT = 0;
    function render(t) {
      if (hasMoved) {
        // High Reach smooth inertia (0.1 per 60fps frame), made frame-rate independent
        var dt = lastT ? Math.min(t - lastT, 50) : 16.667;
        var k = 1 - Math.pow(0.9, dt / 16.667);
        currentX += k * (targetX - currentX);
        currentY += k * (targetY - currentY);

        var radius = getRadius();
        loupe.style.left = (currentX - radius) + 'px';
        loupe.style.top = (currentY - radius) + 'px';

        // Dynamic glitch jitter in 4 brand colors (#ffd60a, #a6ec6a, #36c2b0, #0062F3):
        // Velocity causes the outer edge fringe to expand and jitter dynamically
        var vx = targetX - currentX;
        var vy = targetY - currentY;
        var speed = Math.hypot(vx, vy);
        var shift = 1.6 + Math.min(speed * 0.08, 2.5);

        var feYellow = document.getElementById('hrGlitchYellow');
        var feLime   = document.getElementById('hrGlitchLime');
        var feCyan   = document.getElementById('hrGlitchCyan');
        var feBlue   = document.getElementById('hrGlitchBlue');

        if (feYellow) {
          feYellow.setAttribute('dx', (-shift).toFixed(2));
          feYellow.setAttribute('dy', (shift * 0.58).toFixed(2));
        }
        if (feLime) {
          feLime.setAttribute('dx', (-shift * 0.5).toFixed(2));
          feLime.setAttribute('dy', (shift * 0.29).toFixed(2));
        }
        if (feCyan) {
          feCyan.setAttribute('dx', (shift * 0.5).toFixed(2));
          feCyan.setAttribute('dy', (-shift * 0.29).toFixed(2));
        }
        if (feBlue) {
          feBlue.setAttribute('dx', shift.toFixed(2));
          feBlue.setAttribute('dy', (-shift * 0.58).toFixed(2));
        }

        var feMap = document.getElementById('hrLensMap');
        if (feMap) {
          var size = (radius * 2).toFixed(0);
          if (feMap.getAttribute('width') !== size) {
            feMap.setAttribute('width', size);
            feMap.setAttribute('height', size);
          }
        }

        if (currentTarget && activeClone && isTargetActive) {
          var isBadge = currentTarget.classList && currentTarget.classList.contains('about-badge');
          var isCount = currentTarget.classList && (currentTarget.classList.contains('about-one__funfact__count') || currentTarget.classList.contains('count-box'));
          var activeZoom = isBadge ? 1.12 : (isCount ? 1.18 : ZOOM);

          // For the rotating circular text around the logo badge, synchronize the live rotation angle
          if (isBadge) {
            var origCurved = currentTarget.querySelector ? currentTarget.querySelector('.curved-circle') : null;
            var cloneCurved = activeClone.querySelector ? activeClone.querySelector('.curved-circle') : null;
            if (origCurved && cloneCurved) {
              var curTransform = window.getComputedStyle(origCurved).getPropertyValue('transform');
              if (curTransform && curTransform !== 'none') {
                cloneCurved.style.transform = curTransform;
              }
            }
          }

          // Live counter synchronization: keeps the count-up animation active and updating in real-time inside the bubble
          if (isCount) {
            var origCount = currentTarget.querySelector ? currentTarget.querySelector('.count-text') : null;
            var cloneCount = activeClone.querySelector ? activeClone.querySelector('.count-text') : null;
            if (origCount && cloneCount && cloneCount.textContent !== origCount.textContent) {
              cloneCount.textContent = origCount.textContent;
            }
          }

          var tRect = currentTarget.getBoundingClientRect();
          var relX = currentX - tRect.left;
          var relY = currentY - tRect.top;

          // Do not cut a transparent mask hole into photographic/card images (e.g. Our Services, Portfolio, About images),
          // because masking a solid photo exposes the black section background behind it as a black patch.
          var isTagImg = currentTarget.tagName && currentTarget.tagName.toLowerCase() === 'img';
          var isTransparentLogoImg = isTagImg && currentTarget.closest && currentTarget.closest('.main-header__logo, .logo-box, .brand-logo, .hr-client-card, .footer-widget__logo, .ai-icon');
          var isPhotoImg = (isTagImg && !isTransparentLogoImg) || (currentTarget.closest && currentTarget.closest('.portfolio-two__card__image, .portfolio-one__card__image, .about-one__image__one, .about-one__image__two'));

          var isProtectedFromMask = currentTarget.closest && currentTarget.closest('.cr-cta, .hr-cta-section, .cr-values, .cr-value-card, .cr-btn, .hr-btn, button, .btn, .main-header__actions, .hr-header-icon-btn, .main-header .hr-hero-icon-btn, .sticky-header .hr-hero-icon-btn');

          if (isPhotoImg || isProtectedFromMask) {
            clearMask(currentTarget);
          } else {
            // Inverse circular mask on base element (cuts out only the circular footprint under lens)
            // Account for any CSS transform scale on parent containers (e.g. .portfolio-two__carousel scale(0.67))
            var scaleX = (currentTarget.offsetWidth && tRect.width) ? (currentTarget.offsetWidth / tRect.width) : 1;
            var scaleY = (currentTarget.offsetHeight && tRect.height) ? (currentTarget.offsetHeight / tRect.height) : 1;
            var maskX = relX * scaleX;
            var maskY = relY * scaleY;
            var maskScale = (scaleX + scaleY) * 0.5;
            var innerR = Math.max(0, (radius - 2.5) * maskScale);
            var outerR = Math.max(innerR + 0.5, (radius - 1.5) * maskScale);
            var maskStr = 'radial-gradient(circle at ' + maskX.toFixed(1) + 'px ' + maskY.toFixed(1) + 'px, transparent ' + innerR.toFixed(1) + 'px, black ' + outerR.toFixed(1) + 'px)';
            currentTarget.style.maskImage = maskStr;
            currentTarget.style.webkitMaskImage = maskStr;
            if (currentTarget.parentElement && (currentTarget.parentElement.classList.contains('main-footer__bottom__title') || currentTarget.parentElement.classList.contains('stroke-text-title'))) {
              currentTarget.parentElement.style.maskImage = maskStr;
              currentTarget.parentElement.style.webkitMaskImage = maskStr;
            }
          }

          var cloneLeft = radius - relX * activeZoom;
          var cloneTop = radius - relY * activeZoom;

          activeClone.style.transform = 'translate(' + cloneLeft.toFixed(1) + 'px, ' + cloneTop.toFixed(1) + 'px) scale(' + activeZoom + ')';
        } else if (currentTarget && !isTargetActive) {
          clearMask(currentTarget);
        }
      }

      lastT = t;
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUniversalGlass);
  } else {
    initUniversalGlass();
  }
})();
