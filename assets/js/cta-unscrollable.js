/**
 * High Reach - "Let's build something unscrollable" CTA Section Script
 * Interactive Canvas Dot Grid, Magnetic Button Physics & Scroll Reveals
 */
(function () {
  'use strict';

  function initCtaSection() {
    var section = document.querySelector('.hr-cta-section');
    if (!section) return;

    /* ----------------------------------------------------
       1. Rolling Letters Generator for 3D Button
       ---------------------------------------------------- */
    var btn = section.querySelector('.Button3D_root');
    if (btn) {
      var rowNormal = btn.querySelector('#btnLabelRow, .Button3D_labelRow:not(.Button3D_labelRowGhost)');
      var rowGhost = btn.querySelector('#btnLabelRowGhost, .Button3D_labelRowGhost');
      var labelStack = btn.querySelector('.Button3D_labelStack');
      var text = (labelStack && labelStack.getAttribute('aria-label')) || 'Book a Free Strategy Call';

      if (rowNormal && (!rowNormal.children || rowNormal.children.length === 0)) {
        var chars = text.split('');
        var htmlNormal = '';
        var htmlGhost = '';
        for (var i = 0; i < chars.length; i++) {
          var ch = chars[i] === ' ' ? '&nbsp;' : chars[i];
          var delay = (i * 20) + 'ms';
          htmlNormal += '<span class="Button3D_letter" style="transition-delay:' + delay + '">' + ch + '</span>';
          htmlGhost += '<span class="Button3D_letter" style="transition-delay:' + delay + '">' + ch + '</span>';
        }
        rowNormal.innerHTML = htmlNormal;
        if (rowGhost) rowGhost.innerHTML = htmlGhost;
      }
    }

    /* ----------------------------------------------------
       2. Scroll Reveal Observer
       ---------------------------------------------------- */
    var revealItems = section.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      });

      revealItems.forEach(function (item) {
        revealObserver.observe(item);
      });
    } else {
      revealItems.forEach(function (item) {
        item.classList.add('is-revealed');
      });
    }

    /* ----------------------------------------------------
       3. Magnetic Attraction Physics for 3D Button & Links
       ---------------------------------------------------- */
    var magneticElements = section.querySelectorAll('[data-magnetic="true"]');
    var isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    if (!isTouchDevice) {
      magneticElements.forEach(function (magEl) {
        var targetEl = magEl.querySelector('.Button3D_root') || magEl;
        var labelEl = targetEl.querySelector ? targetEl.querySelector('.Button3D_content') : null;
        var strength = 14;
        var radius = 90;
        var labelLag = 0.7;

        var curX = 0, curY = 0;
        var tgtX = 0, tgtY = 0;
        var isHovered = false;
        var rafId = null;

        function updateSpring() {
          curX += (tgtX - curX) * 0.18;
          curY += (tgtY - curY) * 0.18;

          targetEl.style.transform = 'translate3d(' + curX.toFixed(2) + 'px, ' + curY.toFixed(2) + 'px, 0)';
          if (labelEl) {
            labelEl.style.transform = 'translate3d(' + (curX * labelLag).toFixed(2) + 'px, ' + (curY * labelLag).toFixed(2) + 'px, 0)';
          }

          if (Math.abs(tgtX - curX) > 0.05 || Math.abs(tgtY - curY) > 0.05 || isHovered) {
            rafId = requestAnimationFrame(updateSpring);
          } else {
            targetEl.style.transform = '';
            if (labelEl) labelEl.style.transform = '';
            rafId = null;
          }
        }

        function onMouseMove(e) {
          var rect = magEl.getBoundingClientRect();
          var centerX = rect.left + rect.width / 2;
          var centerY = rect.top + rect.height / 2;
          var dx = e.clientX - centerX;
          var dy = e.clientY - centerY;
          var dist = Math.hypot(dx, dy);
          var fieldRadius = radius + Math.max(rect.width, rect.height) / 2;

          if (dist > fieldRadius) {
            tgtX = 0;
            tgtY = 0;
          } else {
            var pull = 1 - (dist / fieldRadius);
            tgtX = (dx / fieldRadius) * strength * 2 * pull;
            tgtY = (dy / fieldRadius) * strength * 2 * pull;
          }

          isHovered = true;
          if (!rafId) rafId = requestAnimationFrame(updateSpring);
        }

        function onMouseLeave() {
          tgtX = 0;
          tgtY = 0;
          isHovered = false;
          if (!rafId) rafId = requestAnimationFrame(updateSpring);
        }

        window.addEventListener('pointermove', onMouseMove, { passive: true });
        magEl.addEventListener('pointerleave', onMouseLeave);
      });
    }

    /* ----------------------------------------------------
       4. Interactive Canvas Dot Grid (30x30 Organic Matrix)
       ---------------------------------------------------- */
    var canvas = section.querySelector('.hr-cta-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dots = [];
    var GRID_ROWS = 30;
    var GRID_COLS = 30;
    var isVisible = false;
    var animFrame = null;
    var startTime = performance.now();

    // High Reach Brand Logo Gradient Colors: Yellow (#ffd60a), Lime (#a6ec6a), Teal (#36c2b0), Blue (#0062f3)
    var COLOR_YELLOW = [255, 214, 10];   // #ffd60a
    var COLOR_LIME   = [166, 236, 106];  // #a6ec6a
    var COLOR_TEAL   = [54, 194, 176];   // #36c2b0
    var COLOR_BLUE   = [0, 98, 243];     // #0062f3

    function lerpColor(c1, c2, t) {
      return [
        Math.round(c1[0] + (c2[0] - c1[0]) * t),
        Math.round(c1[1] + (c2[1] - c1[1]) * t),
        Math.round(c1[2] + (c2[2] - c1[2]) * t)
      ];
    }

    function pseudoRandom(seed) {
      var s = 43758.5453 * Math.sin(127.1 * seed + 311.7);
      return s - Math.floor(s);
    }

    // Build the dot matrix with center hollow and organic jitter
    function buildDots() {
      dots = [];
      for (var a = 0; a < GRID_ROWS; a++) {
        for (var i = 0; i < GRID_COLS; i++) {
          var s = (a / (GRID_ROWS - 1)) * 2 - 1; // -1 to 1
          var o = (i / (GRID_COLS - 1)) * 2 - 1; // -1 to 1
          var dist = Math.sqrt(s * s + o * o * 2.1);
          var u = GRID_ROWS * a + i;

          // Hollow out the center for text contrast
          if (dist < 0.46) {
            var threshold = (dist / 0.46) * 0.5;
            if (pseudoRandom(u) > threshold) continue;
          }

          var jitterX = (pseudoRandom(u + 1.3) - 0.5) * 0.035;
          var jitterY = (pseudoRandom(u + 7.9) - 0.5) * 0.035;
          var dim = Math.min(Math.max(dist / 0.68, 0.12), 1);
          var ramp = Math.min(Math.max((0.5 * s + 0.5) * 0.65 + (0.5 * o + 0.5) * 0.35, 0), 1);

          // Calculate base color along the logo gradient ramp
          var rgb;
          if (ramp < 0.34) {
            rgb = lerpColor(COLOR_YELLOW, COLOR_LIME, ramp / 0.34);
          } else if (ramp < 0.68) {
            rgb = lerpColor(COLOR_LIME, COLOR_TEAL, (ramp - 0.34) / 0.34);
          } else {
            rgb = lerpColor(COLOR_TEAL, COLOR_BLUE, (ramp - 0.68) / 0.32);
          }

          var brightness = 0.35 + 0.85 * dim;
          var alpha = Math.min(Math.max(dim * 0.85, 0.2), 0.95);

          dots.push({
            normX: s + jitterX,
            normY: o + jitterY,
            dim: dim,
            ramp: ramp,
            r: rgb[0],
            g: rgb[1],
            b: rgb[2],
            alpha: alpha,
            baseRadius: 1.75
          });
        }
      }
    }

    buildDots();

    var mouseX = -9999, mouseY = -9999;
    var pointerX = -9999, pointerY = -9999;
    var hasPointer = false;

    function onPointerMove(e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      hasPointer = true;
    }

    function onPointerLeave() {
      hasPointer = false;
      mouseX = -9999;
      mouseY = -9999;
    }

    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave);

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var canvasW = 0, canvasH = 0;

    function resizeCanvas() {
      var rect = section.getBoundingClientRect();
      canvasW = rect.width;
      canvasH = rect.height;
      canvas.width = Math.round(canvasW * dpr);
      canvas.height = Math.round(canvasH * dpr);
      canvas.style.width = canvasW + 'px';
      canvas.style.height = canvasH + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    function render(timestamp) {
      if (!isVisible) return;

      var t = (timestamp - startTime) * 0.001;

      // Smooth pointer lerp
      if (hasPointer) {
        pointerX += (mouseX - pointerX) * 0.14;
        pointerY += (mouseY - pointerY) * 0.14;
      } else {
        pointerX += (-9999 - pointerX) * 0.08;
        pointerY += (-9999 - pointerY) * 0.08;
      }

      ctx.clearRect(0, 0, canvasW, canvasH);

      var halfW = canvasW * 0.47;
      var halfH = canvasH * 0.47;
      var centerX = canvasW * 0.5;
      var centerY = canvasH * 0.5;

      var influenceRadius = 0.28 * Math.max(canvasW, canvasH);
      var influence2 = 2 * influenceRadius * influenceRadius;

      for (var d = 0; d < dots.length; d++) {
        var dot = dots[d];
        var baseX = centerX + dot.normX * halfW;
        var baseY = centerY + dot.normY * halfH;

        // Repulsion from pointer
        var dx = baseX - pointerX;
        var dy = baseY - pointerY;
        var distSq = dx * dx + dy * dy;
        var repulsion = Math.exp(-distSq / influence2);

        // Organic ambient sine wave
        var wave = 2.4 * Math.sin(0.9 * t + (dot.normX + dot.normY) * 1.8);

        var finalX = baseX + dx * repulsion * 0.45;
        var finalY = baseY + dy * repulsion * 0.45 + wave;
        var radius = dot.baseRadius * (1 + 1.5 * repulsion);
        var currentAlpha = Math.min(dot.alpha * (1 + repulsion * 0.5), 1);

        ctx.beginPath();
        ctx.arc(finalX, finalY, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + dot.r + ',' + dot.g + ',' + dot.b + ',' + currentAlpha.toFixed(2) + ')';
        ctx.fill();
      }

      animFrame = requestAnimationFrame(render);
    }

    // Visibility Observer to pause loop when not on screen
    if ('IntersectionObserver' in window) {
      var visObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!isVisible) {
              isVisible = true;
              resizeCanvas();
              animFrame = requestAnimationFrame(render);
            }
          } else {
            isVisible = false;
            if (animFrame) {
              cancelAnimationFrame(animFrame);
              animFrame = null;
            }
          }
        });
      }, { rootMargin: '100px 0px' });

      visObserver.observe(section);
    } else {
      isVisible = true;
      animFrame = requestAnimationFrame(render);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCtaSection);
  } else {
    initCtaSection();
  }
})();

