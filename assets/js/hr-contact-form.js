/**
 * ============================================================================
 * HIGH REACH — DUAL-DELIVERY CONTACT & CAREER FORM CONTROLLER
 * Engineered for static hosting (GitHub Pages / Vercel)
 * Channels:
 * 1. Safe Email Delivery (via Web3Forms API to grow@highreach.media)
 * 2. Instant Direct WhatsApp Delivery (+91 9972 772 416)
 * ============================================================================
 */

(function () {
    "use strict";

    var ADMIN_WHATSAPP_NUMBER = "919972772416";
    var ADMIN_EMAIL = "grow@highreach.media";
    var WEB3FORMS_ACCESS_KEY = "92cc97f0-f227-4fae-9bca-868c98345fff";

    // EmailJS Configuration for Visitor OTP Email Verification
    // Sign up free at https://www.emailjs.com/ to connect live visitor verification emails
    var EMAILJS_PUBLIC_KEY = "";   // e.g. "AbCdEf123456789"
    var EMAILJS_SERVICE_ID = "";   // e.g. "service_highreach"
    var EMAILJS_TEMPLATE_ID = "";  // e.g. "template_otp_verify"

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
        var formFieldsGroup = form.querySelector(".form-one__group");

        // Per-form OTP verification state
        var otpState = {
            code: "",
            targetEmail: "",
            targetName: "",
            expiresAt: 0,
            isVerified: false,
            resendCooldown: 0,
            cooldownInterval: null,
            expiryInterval: null
        };

        // Inject OTP verification card if not already in DOM
        var otpHolder = form.querySelector(".hr-otp-wrap");
        if (!otpHolder) {
            otpHolder = document.createElement("div");
            otpHolder.className = "hr-otp-wrap";
            otpHolder.style.display = "none";
            otpHolder.innerHTML = 
                '<div class="hr-otp-icon"><i class="fas fa-shield-alt"></i></div>' +
                '<h3 class="hr-otp-title">Email Verification Required</h3>' +
                '<p class="hr-otp-desc">To verify your inquiry and prevent duplicate spam, we sent a 6-digit verification code to <strong class="hr-otp-target-email"></strong>.</p>' +
                '<div class="hr-otp-alert hr-otp-alert--info"></div>' +
                '<div class="hr-otp-alert hr-otp-alert--error"></div>' +
                '<div class="hr-otp-boxes">' +
                    '<input type="text" maxlength="1" class="hr-otp-box" inputmode="numeric" autocomplete="one-time-code" aria-label="Digit 1">' +
                    '<input type="text" maxlength="1" class="hr-otp-box" inputmode="numeric" aria-label="Digit 2">' +
                    '<input type="text" maxlength="1" class="hr-otp-box" inputmode="numeric" aria-label="Digit 3">' +
                    '<input type="text" maxlength="1" class="hr-otp-box" inputmode="numeric" aria-label="Digit 4">' +
                    '<input type="text" maxlength="1" class="hr-otp-box" inputmode="numeric" aria-label="Digit 5">' +
                    '<input type="text" maxlength="1" class="hr-otp-box" inputmode="numeric" aria-label="Digit 6">' +
                '</div>' +
                '<div class="hr-otp-timer">Code expires in <span class="hr-otp-countdown">05:00</span></div>' +
                '<div class="hr-otp-actions">' +
                    '<button type="button" class="amoxi-btn-two hr-otp-verify-btn">' +
                        'CONFIRM &amp; SEND REQUEST <span class="amoxi-btn-two__icon"><i class="fas fa-arrow-right"></i></span>' +
                    '</button>' +
                    '<div class="hr-otp-sub-actions">' +
                        '<button type="button" class="hr-otp-sub-link hr-otp-resend-btn" disabled>Resend Code (<span class="hr-otp-cooldown">30</span>s)</button>' +
                        '<button type="button" class="hr-otp-sub-link hr-otp-edit-btn">Edit Details</button>' +
                    '</div>' +
                '</div>';
            form.appendChild(otpHolder);
        }

        var otpBoxes = otpHolder.querySelectorAll(".hr-otp-box");
        var otpTargetEmailEl = otpHolder.querySelector(".hr-otp-target-email");
        var otpCountdownEl = otpHolder.querySelector(".hr-otp-countdown");
        var otpCooldownEl = otpHolder.querySelector(".hr-otp-cooldown");
        var otpResendBtn = otpHolder.querySelector(".hr-otp-resend-btn");
        var otpEditBtn = otpHolder.querySelector(".hr-otp-edit-btn");
        var otpVerifyBtn = otpHolder.querySelector(".hr-otp-verify-btn");
        var otpAlertError = otpHolder.querySelector(".hr-otp-alert--error");
        var otpAlertInfo = otpHolder.querySelector(".hr-otp-alert--info");

        function clearOtpTimers() {
            if (otpState.cooldownInterval) {
                clearInterval(otpState.cooldownInterval);
                otpState.cooldownInterval = null;
            }
            if (otpState.expiryInterval) {
                clearInterval(otpState.expiryInterval);
                otpState.expiryInterval = null;
            }
        }

        function formatTime(seconds) {
            var m = Math.floor(seconds / 60);
            var s = seconds % 60;
            return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
        }

        function startOtpTimers() {
            clearOtpTimers();

            // 1. Expiry Countdown (5 minutes)
            otpState.expiryInterval = setInterval(function () {
                var remaining = Math.max(0, Math.floor((otpState.expiresAt - Date.now()) / 1000));
                if (otpCountdownEl) {
                    otpCountdownEl.textContent = formatTime(remaining);
                }
                if (remaining <= 0) {
                    clearInterval(otpState.expiryInterval);
                    otpState.expiryInterval = null;
                    if (otpAlertError) {
                        otpAlertError.textContent = "Your verification code has expired. Please click 'Resend Code'.";
                        otpAlertError.style.display = "block";
                    }
                }
            }, 1000);

            // 2. Resend Cooldown (30 seconds)
            otpState.resendCooldown = 30;
            if (otpResendBtn) {
                otpResendBtn.disabled = true;
            }
            if (otpCooldownEl) {
                otpCooldownEl.textContent = "30";
            }

            otpState.cooldownInterval = setInterval(function () {
                otpState.resendCooldown--;
                if (otpCooldownEl) {
                    otpCooldownEl.textContent = otpState.resendCooldown;
                }
                if (otpState.resendCooldown <= 0) {
                    clearInterval(otpState.cooldownInterval);
                    otpState.cooldownInterval = null;
                    if (otpResendBtn) {
                        otpResendBtn.disabled = false;
                        otpResendBtn.textContent = "Resend Code";
                    }
                }
            }, 1000);
        }

        function sendOtp(targetEmail, targetName) {
            var newCode = Math.floor(100000 + Math.random() * 900000).toString();
            otpState.code = newCode;
            otpState.targetEmail = targetEmail;
            otpState.targetName = targetName;
            otpState.expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

            if (otpTargetEmailEl) {
                otpTargetEmailEl.textContent = targetEmail;
            }

            // Check if EmailJS is configured with live credentials
            var hasEmailJs = Boolean(
                window.emailjs &&
                EMAILJS_PUBLIC_KEY &&
                EMAILJS_SERVICE_ID &&
                EMAILJS_TEMPLATE_ID
            );

            if (hasEmailJs) {
                try {
                    window.emailjs.init(EMAILJS_PUBLIC_KEY);
                    window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                        to_name: targetName,
                        to_email: targetEmail,
                        otp_code: newCode,
                        company_name: "High Reach"
                    }).then(function () {
                        if (otpAlertInfo) {
                            otpAlertInfo.innerHTML = '<i class="fas fa-check-circle"></i> A 6-digit verification code has been sent to <strong>' + escapeHtml(targetEmail) + '</strong>. Please check your inbox and spam folder.';
                            otpAlertInfo.style.display = "block";
                        }
                    }).catch(function (err) {
                        console.error("EmailJS dispatch failed:", err);
                        if (otpAlertError) {
                            otpAlertError.textContent = "Failed to dispatch email. Please verify your email address or try again.";
                            otpAlertError.style.display = "block";
                        }
                    });
                } catch (err) {
                    console.error("EmailJS dispatch error:", err);
                }
            } else {
                if (otpAlertError) {
                    otpAlertError.innerHTML = '<i class="fas fa-shield-alt"></i> Live OTP delivery requires your free EmailJS credentials (Public Key, Service ID, Template ID) to dispatch real emails to visitor inboxes.';
                    otpAlertError.style.display = "block";
                }
            }

            startOtpTimers();
        }

        // Configure 6-box OTP inputs (auto-advance, backspace, paste)
        otpBoxes.forEach(function (box, idx) {
            box.addEventListener("input", function (e) {
                var val = e.target.value.replace(/\D/g, "");
                e.target.value = val ? val.charAt(0) : "";
                if (e.target.value) {
                    box.classList.add("is-filled");
                    if (idx < otpBoxes.length - 1) {
                        otpBoxes[idx + 1].focus();
                    } else {
                        // All 6 filled, trigger verification
                        verifyOtpAndSubmit();
                    }
                } else {
                    box.classList.remove("is-filled");
                }
            });

            box.addEventListener("keydown", function (e) {
                if (e.key === "Backspace" && !box.value && idx > 0) {
                    otpBoxes[idx - 1].focus();
                    otpBoxes[idx - 1].value = "";
                    otpBoxes[idx - 1].classList.remove("is-filled");
                }
            });

            box.addEventListener("paste", function (e) {
                e.preventDefault();
                var pasteData = (e.clipboardData || window.clipboardData).getData("text") || "";
                var digits = pasteData.replace(/\D/g, "").slice(0, 6);
                if (digits.length) {
                    for (var i = 0; i < otpBoxes.length; i++) {
                        if (digits[i]) {
                            otpBoxes[i].value = digits[i];
                            otpBoxes[i].classList.add("is-filled");
                        }
                    }
                    var nextFocus = Math.min(digits.length, otpBoxes.length - 1);
                    otpBoxes[nextFocus].focus();
                    if (digits.length === 6) {
                        verifyOtpAndSubmit();
                    }
                }
            });
        });

        // Edit details: cancel OTP, restore form
        if (otpEditBtn) {
            otpEditBtn.addEventListener("click", function () {
                clearOtpTimers();
                otpHolder.style.display = "none";
                if (formFieldsGroup) {
                    formFieldsGroup.style.display = "";
                }
                if (resultBox) {
                    resultBox.innerHTML = "";
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
            });
        }

        // Resend code handler
        if (otpResendBtn) {
            otpResendBtn.addEventListener("click", function () {
                if (otpResendBtn.disabled) return;
                otpBoxes.forEach(function (b) {
                    b.value = "";
                    b.classList.remove("is-filled");
                });
                if (otpAlertError) {
                    otpAlertError.style.display = "none";
                }
                sendOtp(otpState.targetEmail, otpState.targetName);
                if (otpBoxes[0]) {
                    otpBoxes[0].focus();
                }
            });
        }

        // Verify button handler
        if (otpVerifyBtn) {
            otpVerifyBtn.addEventListener("click", function () {
                verifyOtpAndSubmit();
            });
        }

        function verifyOtpAndSubmit() {
            var entered = "";
            otpBoxes.forEach(function (b) {
                entered += b.value.trim();
            });

            if (otpAlertError) {
                otpAlertError.style.display = "none";
            }

            if (entered.length < 6) {
                if (otpAlertError) {
                    otpAlertError.textContent = "Please enter the complete 6-digit code.";
                    otpAlertError.style.display = "block";
                }
                return;
            }

            if (Date.now() > otpState.expiresAt) {
                if (otpAlertError) {
                    otpAlertError.textContent = "This verification code has expired. Please click 'Resend Code'.";
                    otpAlertError.style.display = "block";
                }
                return;
            }

            if (entered !== otpState.code) {
                if (otpAlertError) {
                    otpAlertError.textContent = "Incorrect code. Please double-check your code or request a new one.";
                    otpAlertError.style.display = "block";
                }
                otpBoxes.forEach(function (b) {
                    b.classList.remove("is-filled");
                });
                return;
            }

            // Successfully Verified!
            clearOtpTimers();
            otpState.isVerified = true;

            // Transition UI to transmitting
            otpHolder.style.display = "none";
            if (formFieldsGroup) {
                formFieldsGroup.style.display = "";
            }

            // Transmit verified inquiry to Web3Forms grow@highreach.media
            deliverVerifiedForm();
        }

        function deliverVerifiedForm() {
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

            var originalBtnHtml = submitBtn ? submitBtn.innerHTML : "SEND REQUEST";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> TRANSMITTING VERIFIED INQUIRY...';
            }
            if (resultBox) {
                resultBox.innerHTML = '<div class="hr-form-alert" style="background: rgba(0, 98, 243, 0.12); border: 1px solid rgba(0, 98, 243, 0.3); color: #fff;"><i class="fas fa-shield-alt"></i> Email verified! Delivering inquiry safely to ' + ADMIN_EMAIL + '...</div>';
            }

            var formData = new FormData(form);
            var activeKey = formData.get("access_key") || WEB3FORMS_ACCESS_KEY;
            formData.set("service_requested", service || "General Inquiry");
            formData.set("submitted_at", new Date().toLocaleString());
            formData.set("email_verified", "YES (Verified via OTP to " + email + ")");
            formData.set("access_key", activeKey);

            fetch(form.action || "https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            })
            .then(function (res) {
                return res.json().then(function (data) {
                    return { ok: res.ok, status: res.status, data: data };
                });
            })
            .then(function (resObj) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }

                if (resObj.ok && resObj.data && (resObj.data.success || resObj.status === 200)) {
                    form.reset();
                    otpState.isVerified = false;

                    if (window.jQuery && window.jQuery(form).find(".selectpicker").length) {
                        window.jQuery(form).find(".selectpicker").selectpicker("refresh");
                    }

                    if (resultBox) {
                        var waQuickMsg = "Hi High Reach Admin,\n\nI just verified and sent a project request to " + ADMIN_EMAIL + " via your website:\n• *Name:* " + name + "\n• *Service:* " + (service || "General Inquiry") + "\nLooking forward to hearing from you!";
                        var waQuickUrl = "https://wa.me/" + ADMIN_WHATSAPP_NUMBER + "?text=" + encodeURIComponent(waQuickMsg);

                        resultBox.innerHTML = 
                            '<div class="hr-form-alert hr-form-alert--success">' +
                                '<div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;"><i class="fas fa-check-circle" style="color: #25D366; margin-right: 8px;"></i>Inquiry Verified &amp; Sent Successfully!</div>' +
                                '<div>Thank you, <strong>' + escapeHtml(name) + '</strong>. Your email has been authenticated and details delivered safely to <strong>' + ADMIN_EMAIL + '</strong>. Our team will reach out within 24 hours.</div>' +
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
        }

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

        // 2. Email Form Submit Handler — Intercepts and Triggers OTP Verification
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

            // Email format check
            var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                if (resultBox) {
                    resultBox.innerHTML = '<div class="hr-form-alert hr-form-alert--error"><i class="fas fa-exclamation-circle"></i> Please enter a valid email address to receive your verification code.</div>';
                }
                return;
            }

            // Transition to OTP verification step
            if (resultBox) {
                resultBox.innerHTML = "";
            }
            if (formFieldsGroup) {
                formFieldsGroup.style.display = "none";
            }
            otpHolder.style.display = "block";

            // Clear inputs and reset alerts
            otpBoxes.forEach(function (b) {
                b.value = "";
                b.classList.remove("is-filled");
            });
            if (otpAlertError) {
                otpAlertError.style.display = "none";
            }

            // Generate and dispatch OTP
            sendOtp(email, name);

            // Focus first digit
            setTimeout(function () {
                if (otpBoxes[0]) {
                    otpBoxes[0].focus();
                }
            }, 100);
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

            var formData = new FormData(form);
            var activeCareerKey = formData.get("access_key") || WEB3FORMS_ACCESS_KEY;
            formData.set("role_applied", role || "General Application");
            formData.set("submitted_at", new Date().toLocaleString());

            // If Web3Forms access key is not set, launch mail client directly & display instant WhatsApp transfer
            if (!activeCareerKey) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
                var careerSubject = encodeURIComponent("Careers Application — " + name + " — " + (role || "General Application"));
                var careerBody = encodeURIComponent("Hi High Reach Team,\n\nName: " + name + "\nRole Applied: " + role + "\nPortfolio: " + portfolio + "\nEmail: " + email + "\nPhone: " + phone + "\n\nNote:\n" + message);
                window.location.href = "mailto:hr@highreach.media?subject=" + careerSubject + "&body=" + careerBody;
                handleCareerFallback(resultBox, name, email, phone, role, portfolio, message);
                return;
            }

            formData.set("access_key", activeCareerKey);

            fetch(form.action || "https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            })
                .then(function (res) {
                    return res.json().then(function (data) {
                        return { ok: res.ok, status: res.status, data: data };
                    });
                })
                .then(function (resObj) {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnHtml;
                    }

                    if (resObj.ok && resObj.data && (resObj.data.success || resObj.status === 200)) {
                        form.reset();
                        if ($(".selectpicker").length) {
                            $(".selectpicker").selectpicker("refresh");
                        }
                        if (resultBox) {
                            resultBox.innerHTML =
                                '<div class="hr-form-alert hr-form-alert--success">' +
                                '<div style="font-weight: 700; font-size: 16px;"><i class="fas fa-check-circle" style="color: #25D366; margin-right: 8px;"></i>Application Received!</div>' +
                                '<div>Thank you, <strong>' + escapeHtml(name) + '</strong>. Your portfolio and details have reached <strong>' + ADMIN_EMAIL + '</strong>. We review every application personally within 3–5 business days.</div>' +
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
