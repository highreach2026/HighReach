/**
 * ============================================================================
 * HIGH REACH — DUAL-DELIVERY CONTACT & CAREER FORM CONTROLLER
 * Engineered for static hosting (GitHub Pages / Vercel)
 * Channels:
 * 1. Safe Email Delivery (via FormSubmit to grow@highreach.media)
 * 2. Instant Direct WhatsApp Delivery (+91 9972 772 416)
 * ============================================================================
 */

(function () {
    "use strict";

    var ADMIN_WHATSAPP_NUMBER = "919972772416";
    var ADMIN_EMAIL = "grow@highreach.media";
    var FORMSUBMIT_URL = "https://formsubmit.co/ajax/" + ADMIN_EMAIL;

    // Initialize once DOM is ready
    function initAllForms() {
        initContactForm();
        initCareerForm();
        initHomeContactPopup();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAllForms);
    } else {
        initAllForms();
    }

    /**
     * Helper to open WhatsApp with safe URI encoding
     */
    function openWhatsAppChat(messageText) {
        var cleanNumber = ADMIN_WHATSAPP_NUMBER.replace(/\D/g, "");
        var encoded = encodeURIComponent(messageText);
        var url = "https://wa.me/" + cleanNumber + "?text=" + encoded;
        window.open(url, "_blank", "noopener,noreferrer");
    }

    /**
     * CONTACT FORM INITIALIZATION (contact.html & index.html popup)
     */
    function initContactForm() {
        var forms = document.querySelectorAll(".hr-contact-form");
        if (!forms || !forms.length) return;

        forms.forEach(function (form) {
            setupSingleContactForm(form);
        });
    }

    function setupSingleContactForm(form) {
        if (!form || form.getAttribute("data-hr-initialized") === "true") return;
        form.setAttribute("data-hr-initialized", "true");

        var submitBtn = form.querySelector('button[type="submit"]') || form.querySelector("#contactSubmitBtn");
        var waBtn = form.querySelector("#contactWhatsAppBtn") || (form.parentNode && form.parentNode.querySelector("#contactWhatsAppBtn"));
        var resultBox = (form.parentNode && form.parentNode.querySelector(".result")) || document.getElementById("contactResult");

        // 1. WhatsApp Button Click Handler
        if (waBtn) {
            waBtn.addEventListener("click", function () {
                var name = (form.querySelector('[name="name"]') || {}).value || "";
                var email = (form.querySelector('[name="email"]') || {}).value || "";
                var phone = (form.querySelector('[name="phone"]') || {}).value || "";
                var serviceSelect = form.querySelector('[name="service"]');
                var service = "";
                if (serviceSelect && serviceSelect.selectedIndex >= 0) {
                    service = serviceSelect.options[serviceSelect.selectedIndex].text;
                    if (service.toLowerCase().indexOf("select") !== -1) service = "";
                }
                var message = (form.querySelector('[name="message"]') || {}).value || "";

                var waText = "Hi High Reach Admin,\n\nI would like to inquire about your services:\n\n";
                if (name) waText += "• *Name:* " + name.trim() + "\n";
                if (email) waText += "• *Email:* " + email.trim() + "\n";
                if (phone) waText += "• *Phone:* " + phone.trim() + "\n";
                if (service) waText += "• *Service:* " + service.trim() + "\n";
                if (message) waText += "• *Project Brief:* " + message.trim() + "\n";
                if (!name && !email && !phone && !service && !message) {
                    waText += "I would like to discuss branding, digital marketing, and tech solutions with High Reach.";
                }

                openWhatsAppChat(waText);
            });
        }

        // 2. Email Form Submit Handler
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            var nameInput = form.querySelector('[name="name"]');
            var emailInput = form.querySelector('[name="email"]');
            var phoneInput = form.querySelector('[name="phone"]');
            var serviceSelect = form.querySelector('[name="service"]');
            var messageInput = form.querySelector('[name="message"]');

            var name = nameInput ? nameInput.value.trim() : "";
            var email = emailInput ? emailInput.value.trim() : "";
            var phone = phoneInput ? phoneInput.value.trim() : "";
            var service = serviceSelect && serviceSelect.selectedIndex >= 0 ? serviceSelect.options[serviceSelect.selectedIndex].value : "";
            var message = messageInput ? messageInput.value.trim() : "";

            if (!name || !email || !message) {
                if (resultBox) {
                    resultBox.innerHTML = '<div class="hr-form-alert hr-form-alert--error"><i class="fas fa-exclamation-circle"></i> Please fill in all required fields (Name, Email, and Comments).</div>';
                }
                return;
            }

            // Button loading state
            var originalBtnHtml = submitBtn ? submitBtn.innerHTML : "SEND REQUEST";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SENDING TO ' + ADMIN_EMAIL + '...';
            }
            if (resultBox) {
                resultBox.innerHTML = '<div class="hr-form-alert" style="background: rgba(0, 98, 243, 0.12); border: 1px solid rgba(0, 98, 243, 0.3); color: #fff;"><i class="fas fa-paper-plane"></i> Transmitting your message securely to ' + ADMIN_EMAIL + '...</div>';
            }

            var honeypot = form.querySelector('[name="_honey"]') || form.querySelector('[name="botcheck"]');
            if (honeypot && honeypot.value) {
                // Silently trap bot submissions
                return;
            }

            var subjectInput = form.querySelector('[name="_subject"]') || form.querySelector('[name="subject"]');
            var formSubject = subjectInput ? subjectInput.value : "New Project Inquiry — High Reach Website";

            var payload = {
                name: name,
                email: email,
                phone: phone,
                service: service || "General Inquiry",
                message: message,
                _subject: formSubject,
                _template: "table",
                _captcha: "false"
            };

            // Transmit directly to grow@highreach.media via FormSubmit AJAX API
            fetch(FORMSUBMIT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload)
            })
            .then(function (res) {
                return res.json().then(function (data) {
                    return { ok: res.ok, status: res.status, data: data };
                }).catch(function () {
                    return { ok: res.ok, status: res.status, data: null };
                });
            })
            .then(function (resObj) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }

                var isSuccess = resObj.ok && (
                    resObj.status === 200 ||
                    (resObj.data && (resObj.data.success === "true" || resObj.data.success === true))
                );

                if (isSuccess) {
                    form.reset();
                    if (window.jQuery && window.jQuery(form).find(".selectpicker").length) {
                        window.jQuery(form).find(".selectpicker").selectpicker("refresh");
                    }

                    if (resultBox) {
                        var waQuickMsg = "Hi High Reach Admin,\n\nI just sent a project request to " + ADMIN_EMAIL + " via your website:\n• *Name:* " + name + "\n• *Service:* " + (service || "General Inquiry") + "\nLooking forward to hearing from you!";
                        var waQuickUrl = "https://wa.me/" + ADMIN_WHATSAPP_NUMBER + "?text=" + encodeURIComponent(waQuickMsg);

                        resultBox.innerHTML = 
                            '<div class="hr-form-alert hr-form-alert--success">' +
                                '<div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;"><i class="fas fa-check-circle" style="color: #25D366; margin-right: 8px;"></i>Request Sent Successfully!</div>' +
                                '<div>Thank you, <strong>' + escapeHtml(name) + '</strong>. Your details have been delivered safely to <strong>' + ADMIN_EMAIL + '</strong>. Our team will reach out to you within 24 hours.</div>' +
                                '<div style="margin-top: 12px;">' +
                                    '<a href="' + waQuickUrl + '" target="_blank" rel="noopener noreferrer" class="hr-alert-wa-link" style="display: inline-flex; align-items: center; gap: 8px; color: #25D366; font-weight: 600; text-decoration: none;">' +
                                        '<i class="fab fa-whatsapp" style="font-size: 18px;"></i> Want an immediate discussion? Ping us directly on WhatsApp &rarr;' +
                                    '</a>' +
                                '</div>' +
                            '</div>';
                    }
                } else {
                    handleFallback(resultBox, name, email, phone, service, message);
                }
            })
            .catch(function () {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
                handleFallback(resultBox, name, email, phone, service, message);
            });
        });
    }

    /**
     * HOME PAGE 10-SECOND AUTO POPUP
     */
    function initHomeContactPopup() {
        var popup = document.getElementById("homeContactPopup");
        if (!popup) return;

        var POPUP_DELAY_MS = 10000; // 10 seconds
        var popupTimer = null;
        var hasOpened = false;

        function openPopup() {
            if (!popup || hasOpened) return;
            hasOpened = true;
            popup.classList.add("is-active");
            popup.setAttribute("aria-hidden", "false");
            document.body.classList.add("hr-popup-open");

            // Pause GSAP ScrollSmoother so page background doesn't scroll beneath the modal
            if (typeof ScrollSmoother !== "undefined" && typeof ScrollSmoother.get === "function") {
                var smoother = ScrollSmoother.get();
                if (smoother && typeof smoother.paused === "function") {
                    smoother.paused(true);
                }
            }

            // Refresh Bootstrap Select dropdown inside the popup
            if (window.jQuery && window.jQuery.fn && window.jQuery.fn.selectpicker) {
                var $popupSelect = window.jQuery(popup).find(".selectpicker");
                if ($popupSelect.length) {
                    $popupSelect.selectpicker("refresh");
                }
            }
        }

        function closePopup() {
            if (!popup) return;
            popup.classList.remove("is-active");
            popup.setAttribute("aria-hidden", "true");
            document.body.classList.remove("hr-popup-open");

            // Resume GSAP ScrollSmoother
            if (typeof ScrollSmoother !== "undefined" && typeof ScrollSmoother.get === "function") {
                var smoother = ScrollSmoother.get();
                if (smoother && typeof smoother.paused === "function") {
                    smoother.paused(false);
                }
            }
        }

        // Trigger after exactly 10 seconds
        popupTimer = setTimeout(openPopup, POPUP_DELAY_MS);

        // Bind close buttons and backdrop clicks
        var closeTriggers = popup.querySelectorAll("[data-close-popup]");
        closeTriggers.forEach(function (trigger) {
            trigger.addEventListener("click", function (e) {
                e.preventDefault();
                closePopup();
            });
        });

        // Close on Escape key
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" || e.keyCode === 27) {
                if (popup.classList.contains("is-active")) {
                    closePopup();
                }
            }
        });

        // Expose controls globally for programmatic control if needed
        window.openHighReachContactPopup = openPopup;
        window.closeHighReachContactPopup = closePopup;
    }

    /**
     * CAREER APPLICATION FORM INITIALIZATION (career.html)
     */
    function initCareerForm() {
        var form = document.getElementById("careerForm");
        if (!form) return;

        var submitBtn = form.querySelector('button[type="submit"]');
        var resultBox = form.parentNode.querySelector(".result");

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            var nameInput = form.querySelector('[name="name"]');
            var emailInput = form.querySelector('[name="email"]');
            var phoneInput = form.querySelector('[name="phone"]');
            var roleSelect = form.querySelector('[name="role"]');
            var portfolioInput = form.querySelector('[name="portfolio"]');
            var messageInput = form.querySelector('[name="message"]');

            var name = nameInput ? nameInput.value.trim() : "";
            var email = emailInput ? emailInput.value.trim() : "";
            var phone = phoneInput ? phoneInput.value.trim() : "";
            var role = roleSelect && roleSelect.selectedIndex >= 0 ? roleSelect.options[roleSelect.selectedIndex].value : "";
            var portfolio = portfolioInput ? portfolioInput.value.trim() : "";
            var message = messageInput ? messageInput.value.trim() : "";

            if (!name || !email || !portfolio) {
                if (resultBox) {
                    resultBox.innerHTML = '<div class="hr-form-alert hr-form-alert--error"><i class="fas fa-exclamation-circle"></i> Please provide your Name, Email, and Portfolio link.</div>';
                }
                return;
            }

            var originalBtnHtml = submitBtn ? submitBtn.innerHTML : "SUBMIT APPLICATION";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> TRANSMITTING APPLICATION...';
            }

            var payload = {
                name: name,
                email: email,
                phone: phone,
                role: role || "General Application",
                portfolio: portfolio,
                message: message,
                _subject: "Careers Application — " + name + " — " + (role || "General Application"),
                _template: "table",
                _captcha: "false"
            };

            fetch("https://formsubmit.co/ajax/hr@highreach.media", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload)
            })
            .then(function (res) {
                return res.json().then(function (data) {
                    return { ok: res.ok, status: res.status, data: data };
                }).catch(function () {
                    return { ok: res.ok, status: res.status, data: null };
                });
            })
            .then(function (resObj) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }

                var isSuccess = resObj.ok && (
                    resObj.status === 200 ||
                    (resObj.data && (resObj.data.success === "true" || resObj.data.success === true))
                );

                if (isSuccess) {
                    form.reset();
                    if ($(".selectpicker").length) {
                        $(".selectpicker").selectpicker("refresh");
                    }
                    if (resultBox) {
                        resultBox.innerHTML = 
                            '<div class="hr-form-alert hr-form-alert--success">' +
                                '<div style="font-weight: 700; font-size: 16px;"><i class="fas fa-check-circle" style="color: #25D366; margin-right: 8px;"></i>Application Received!</div>' +
                                '<div>Thank you, <strong>' + escapeHtml(name) + '</strong>. Your portfolio and details have reached <strong>hr@highreach.media</strong>. We review every application personally within 3–5 business days.</div>' +
                            '</div>';
                    }
                } else {
                    handleCareerFallback(resultBox, name, email, phone, role, portfolio, message);
                }
            })
            .catch(function () {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
                handleCareerFallback(resultBox, name, email, phone, role, portfolio, message);
            });
        });
    }

    /**
     * Fallback for Contact Form: Guarantees zero lost leads via WhatsApp
     */
    function handleFallback(resultBox, name, email, phone, service, message) {
        if (!resultBox) return;
        var waText = "Hi High Reach Admin,\n\nI am submitting a project inquiry via your website:\n\n" +
            "• *Name:* " + (name || "Not provided") + "\n" +
            "• *Email:* " + (email || "Not provided") + "\n" +
            "• *Phone:* " + (phone || "Not provided") + "\n" +
            "• *Service:* " + (service || "General Inquiry") + "\n" +
            "• *Comments:* " + (message || "Please contact me.");

        var waUrl = "https://wa.me/" + ADMIN_WHATSAPP_NUMBER + "?text=" + encodeURIComponent(waText);

        resultBox.innerHTML = 
            '<div class="hr-form-alert hr-form-alert--success" style="background: rgba(0, 98, 243, 0.12); border-color: rgba(0, 98, 243, 0.4);">' +
                '<div style="font-weight: 700; font-size: 15px;"><i class="fas fa-check-circle" style="color: #36C2B0; margin-right: 8px;"></i>Your inquiry is ready to send!</div>' +
                '<div>Click below to transmit directly to our team on WhatsApp for an immediate response:</div>' +
                '<div style="margin-top: 10px;">' +
                    '<a href="' + waUrl + '" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; background: #25D366; color: #fff; padding: 10px 20px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 13.5px; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.35);">' +
                        '<i class="fab fa-whatsapp" style="font-size: 18px;"></i> SEND INQUIRY TO ADMIN ON WHATSAPP &rarr;' +
                    '</a>' +
                '</div>' +
            '</div>';
    }

    /**
     * Fallback for Career Form
     */
    function handleCareerFallback(resultBox, name, email, phone, role, portfolio, message) {
        if (!resultBox) return;
        var waText = "Hi High Reach Recruitment Team,\n\nI am submitting an application via your careers page:\n\n" +
            "• *Name:* " + (name || "Not provided") + "\n" +
            "• *Role:* " + (role || "General Application") + "\n" +
            "• *Portfolio:* " + (portfolio || "Not provided") + "\n" +
            "• *Email:* " + (email || "Not provided") + "\n" +
            "• *Phone:* " + (phone || "Not provided") + "\n" +
            "• *Note:* " + (message || "Ready to connect!");

        var waUrl = "https://wa.me/" + ADMIN_WHATSAPP_NUMBER + "?text=" + encodeURIComponent(waText);

        resultBox.innerHTML = 
            '<div class="hr-form-alert hr-form-alert--success" style="background: rgba(0, 98, 243, 0.12); border-color: rgba(0, 98, 243, 0.4);">' +
                '<div style="font-weight: 700; font-size: 15px;"><i class="fas fa-check-circle" style="color: #36C2B0; margin-right: 8px;"></i>Your application is ready!</div>' +
                '<div>Click below to deliver your application directly to our recruitment lead on WhatsApp:</div>' +
                '<div style="margin-top: 10px;">' +
                    '<a href="' + waUrl + '" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; background: #25D366; color: #fff; padding: 10px 20px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 13.5px; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.35);">' +
                        '<i class="fab fa-whatsapp" style="font-size: 18px;"></i> SEND APPLICATION ON WHATSAPP &rarr;' +
                    '</a>' +
                '</div>' +
            '</div>';
    }

    function escapeHtml(string) {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return String(string).replace(/[&<>"']/g, function (s) {
            return entityMap[s];
        });
    }

})();
