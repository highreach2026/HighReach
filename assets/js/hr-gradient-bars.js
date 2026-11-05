/**
 * High Reach — Window Top Scroll Progress Bar
 * Fixed 3px logo gradient bar tracking page scroll depth.
 * Text selection is handled natively section-by-section via CSS for maximum performance and clarity.
 */
(function () {
    'use strict';

    var progressBar = document.getElementById("hrTopScrollProgressBar");
    if (!progressBar) {
        progressBar = document.createElement("div");
        progressBar.id = "hrTopScrollProgressBar";
        progressBar.style.cssText = 
            "position:fixed;top:0;left:0;height:3px;width:0%;" +
            "background:linear-gradient(90deg,#FFD60A 0%,#A6EC6A 33.3%,#36C2B0 66.6%,#0062F3 100%);" +
            "z-index:9999999;pointer-events:none;transition:width 0.1s ease-out;" +
            "box-shadow:0 1px 8px rgba(54,194,176,0.4);";
        document.body.appendChild(progressBar);
    }

    function updateProgressBar() {
        var doc = document.documentElement;
        var top = window.scrollY || doc.scrollTop || 0;
        var height = (doc.scrollHeight || document.body.scrollHeight) - window.innerHeight;
        var progress = height > 0 ? (top / height) * 100 : 0;
        if (progress > 100) progress = 100;
        if (progress < 0) progress = 0;
        progressBar.style.width = progress.toFixed(2) + "%";
    }

    window.addEventListener("scroll", updateProgressBar, { passive: true });
    window.addEventListener("resize", updateProgressBar);
    updateProgressBar();

    /* Universal Smooth Back-to-Top & In-Page Section Anchor Handler (Works seamlessly with GSAP ScrollSmoother & Native Scroll) */
    document.addEventListener("click", function (e) {
        var topLink = e.target.closest(".hr-back-to-top-link, .scroll-to-top, .scroll-to-target");
        if (topLink) {
            e.preventDefault();
            var sw = document.getElementById("smooth-wrapper");
            if (sw) sw.scrollTop = 0;

            if (typeof ScrollSmoother !== "undefined" && typeof ScrollSmoother.get === "function") {
                var smoother = ScrollSmoother.get();
                if (smoother) {
                    smoother.scrollTo(0, true);
                    try {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    } catch (err) {}
                    return;
                }
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            return;
        }

        var hashLink = e.target.closest('a[href^="#"]');
        if (hashLink) {
            var hash = hashLink.getAttribute("href");
            if (hash && hash.length > 1 && hash !== "#smooth-wrapper") {
                var targetEl = null;
                try {
                    targetEl = document.querySelector(hash);
                } catch (err) {}
                if (targetEl) {
                    e.preventDefault();
                    var sw2 = document.getElementById("smooth-wrapper");
                    if (sw2) sw2.scrollTop = 0;

                    if (typeof ScrollSmoother !== "undefined" && typeof ScrollSmoother.get === "function") {
                        var smoother2 = ScrollSmoother.get();
                        if (smoother2) {
                            smoother2.scrollTo(targetEl, true, "top 90px");
                            return;
                        }
                    }

                    var topPos = targetEl.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - 90;
                    window.scrollTo({
                        top: Math.max(0, topPos),
                        behavior: "smooth"
                    });
                }
            }
        }
    });

    /* Handle initial URL hash smoothly with ScrollSmoother without corrupting #smooth-wrapper.scrollTop */
    window.addEventListener("load", function () {
        var sw = document.getElementById("smooth-wrapper");
        if (sw) sw.scrollTop = 0;
        if (window.location.hash && window.location.hash.length > 1) {
            var targetEl = null;
            try {
                targetEl = document.querySelector(window.location.hash);
            } catch (err) {}
            if (targetEl && typeof ScrollSmoother !== "undefined" && typeof ScrollSmoother.get === "function") {
                var smoother = ScrollSmoother.get();
                if (smoother) {
                    setTimeout(function () {
                        if (sw) sw.scrollTop = 0;
                        smoother.scrollTo(targetEl, true, "top 90px");
                    }, 150);
                }
            }
        }
    });

    /* Mobile Touch Feedback: Instantly activates the gradient effect on touch */
    document.addEventListener("touchstart", function (e) {
        var btn = e.target.closest(".scroll-to-top");
        if (btn) btn.classList.add("hr-touched");
    }, { passive: true });

    document.addEventListener("touchend", function (e) {
        var btn = e.target.closest(".scroll-to-top");
        if (btn) {
            setTimeout(function () {
                btn.classList.remove("hr-touched");
            }, 600);
        }
    }, { passive: true });

    document.addEventListener("touchcancel", function (e) {
        var btn = e.target.closest(".scroll-to-top");
        if (btn) btn.classList.remove("hr-touched");
    }, { passive: true });
})();
