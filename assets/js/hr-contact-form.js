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

    // Initialize once DOM is ready
    document.addEventListener("DOMContentLoaded", function () {
        initContactForm();
        initCareerForm();
    });

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
     * CONTACT FORM INITIALIZATION (contact.html)
     */
    function initContactForm() {
        var form = document.getElementById("contactForm");
        if (!form) return;

        var submitBtn = document.getElementById("contactSubmitBtn");
        var waBtn = document.getElementById("contactWhatsAppBtn");
        var resultBox = document.getElementById("contactResult");

        // 1. WhatsApp Button Click Handler
        if (waBtn) {
            waBtn.addEventListener("click", function () {
                var name = (form.querySelector('[name="name"]') || {}).value || "";
                var email = (form.querySelector('[name="email"]') || {}).value || "";
                var phone = (form.querySelector('[name="phone"]') || {}).value || "";
                var serviceSelect = form.querySelector('[name="service"]');
                var service = "";
                if (serviceSelect) {
                    service = serviceSelect.options[serviceSelect.selectedIndex] ? serviceSelect.options[serviceSelect.selectedIndex].text : "";
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
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SENDING...';
            }
            if (resultBox) {
                resultBox.innerHTML = '<div class="hr-form-alert" style="background: rgba(0, 98, 243, 0.12); border: 1px solid rgba(0, 98, 243, 0.3); color: #fff;"><i class="fas fa-paper-plane"></i> Safely transmitting your inquiry...</div>';
            }

            var formData = new FormData(form);
            var object = {};
            formData.forEach(function (val, key) {
                object[key] = val;
            });
            object["service_requested"] = service || "General Inquiry";
            object["submitted_at"] = new Date().toISOString();

            var json = JSON.stringify(object);

            fetch(form.action || "https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: json
            })
            .then(function (res) {
                return res.json().then(function (data) {
                    return { ok: res.ok, data: data };
                });
            })
            .then(function (resObj) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }

                if (resObj.ok && resObj.data && (resObj.data.success || resObj.data.status === 200)) {
                    form.reset();
                    if ($(".selectpicker").length) {
                        $(".selectpicker").selectpicker("refresh");
                    }

                    if (resultBox) {
                        var waQuickMsg = "Hi High Reach Admin,\n\nI just sent a project request via your website:\n• *Name:* " + name + "\n• *Service:* " + (service || "General Inquiry") + "\nLooking forward to hearing from you!";
                        var waEncoded = encodeURIComponent(waQuickMsg);
                        var waQuickUrl = "https://wa.me/" + ADMIN_WHATSAPP_NUMBER + "?text=" + waEncoded;

                        resultBox.innerHTML = 
                            '<div class="hr-form-alert hr-form-alert--success">' +
                                '<div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;"><i class="fas fa-check-circle" style="color: #25D366; margin-right: 8px;"></i>Request Sent Successfully!</div>' +
                                '<div>Thank you, <strong>' + escapeHtml(name) + '</strong>. Your details have been delivered safely to our leadership team. We will respond to <strong>' + escapeHtml(email) + '</strong> within 24 hours.</div>' +
                                '<div style="margin-top: 10px;">' +
                                    '<a href="' + waQuickUrl + '" target="_blank" rel="noopener noreferrer" class="hr-alert-wa-link" style="display: inline-flex; align-items: center; gap: 8px; color: #25D366; font-weight: 600; text-decoration: none;">' +
                                        '<i class="fab fa-whatsapp" style="font-size: 18px;"></i> Want an instant response? Ping us directly on WhatsApp &rarr;' +
                                    '</a>' +
                                '</div>' +
                            '</div>';
                    }
                } else {
                    // Fallback in case of API access key requirement
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
            var object = {};
            formData.forEach(function (val, key) {
                object[key] = val;
            });
            object["role_applied"] = role || "General Application";

            fetch(form.action || "https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(object)
            })
            .then(function (res) {
                return res.json().then(function (data) {
                    return { ok: res.ok, data: data };
                });
            })
            .then(function (resObj) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }

                if (resObj.ok && resObj.data && (resObj.data.success || resObj.data.status === 200)) {
                    form.reset();
                    if ($(".selectpicker").length) {
                        $(".selectpicker").selectpicker("refresh");
                    }
                    if (resultBox) {
                        resultBox.innerHTML = 
                            '<div class="hr-form-alert hr-form-alert--success">' +
                                '<div style="font-weight: 700; font-size: 16px;"><i class="fas fa-check-circle" style="color: #25D366; margin-right: 8px;"></i>Application Received!</div>' +
                                '<div>Thank you, <strong>' + escapeHtml(name) + '</strong>. Your portfolio and details have reached our hiring team. We review every application personally within 3–5 business days.</div>' +
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

