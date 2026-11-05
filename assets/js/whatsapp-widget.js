/**
 * High Reach Media - Interactive WhatsApp Admin Widget
 * Direct Customer-to-Admin Instant Messaging Integration
 * Admin Phone: +91 9972 772 416
 */

(function () {
    'use strict';

    var ADMIN_PHONE = '919972772416';
    var DEFAULT_MESSAGE = 'Hello High Reach Admin! I would like to talk directly about your services.';

    var QUICK_CHIPS = [
        {
            label: '🚀 New Project Inquiry',
            msg: 'Hi High Reach Admin, I would like to discuss a new project for my business.'
        },
        {
            label: '🎨 Branding & Identity',
            msg: 'Hi High Reach Admin, I am interested in your branding and creative design services.'
        },
        {
            label: '💻 Web & App Development',
            msg: 'Hi High Reach Admin, I want to talk about website or application development.'
        },
        {
            label: '📈 Digital Marketing & SEO',
            msg: 'Hi High Reach Admin, I want to explore digital marketing campaigns and SEO.'
        },
        {
            label: '📞 Schedule a Quick Call',
            msg: 'Hi High Reach Admin, can we schedule a quick call to discuss how High Reach can help us?'
        }
    ];

    function buildWhatsAppUrl(message) {
        var text = (message && message.trim().length > 0) ? message.trim() : DEFAULT_MESSAGE;
        return 'https://wa.me/' + ADMIN_PHONE + '?text=' + encodeURIComponent(text);
    }

    function launchWhatsApp(message) {
        var url = buildWhatsAppUrl(message);
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    function formatCurrentTime() {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return hours + ':' + minutes + ' ' + ampm;
    }

    function initWhatsAppWidget() {
        var container = document.getElementById('hr-whatsapp-widget');
        if (!container) {
            container = document.createElement('div');
            container.id = 'hr-whatsapp-widget';
            container.className = 'hr-whatsapp-widget';
            document.body.appendChild(container);
        }

        var chipsHtml = QUICK_CHIPS.map(function (chip, index) {
            return '<button type="button" class="hr-wa-chip" data-index="' + index + '">' +
                chip.label +
                '</button>';
        }).join('');

        var timeString = formatCurrentTime();

        container.innerHTML = [
            '<!-- Prompt Pill -->',
            '<div class="hr-wa-prompt" id="hrWaPrompt" role="region" aria-label="WhatsApp Admin Support Notification">',
            '    <div class="hr-wa-prompt__content" id="hrWaPromptClick">',
            '        <span class="hr-wa-prompt__wave">👋</span>',
            '        <div class="hr-wa-prompt__text-wrap">',
            '            <span class="hr-wa-prompt__title">Talk to Admin</span>',
            '            <span class="hr-wa-prompt__sub">Online • Direct WhatsApp</span>',
            '        </div>',
            '    </div>',
            '    <button type="button" class="hr-wa-prompt__close" id="hrWaPromptClose" aria-label="Dismiss message">&times;</button>',
            '</div>',

            '<!-- Floating Trigger Button -->',
            '<div class="hr-wa-btn-wrap">',
            '    <span class="hr-wa-pulse-ring hr-wa-pulse-1"></span>',
            '    <span class="hr-wa-pulse-ring hr-wa-pulse-2"></span>',
            '    <button type="button" class="hr-wa-trigger-btn" id="hrWaTriggerBtn" aria-expanded="false" aria-controls="hrWaPopup" aria-label="Chat directly with High Reach Admin on WhatsApp">',
            '        <span class="hr-wa-badge" id="hrWaBadge">1</span>',
            '        <span class="hr-wa-status-beacon" title="Admin is Online"></span>',
            '        <span class="hr-wa-icon-box">',
            '            <!-- AI Bot Orb with Blinking Eyes -->',
            '            <span class="hr-wa-icon hr-wa-icon--default hr-wa-icon--bot" aria-label="AI Assistant Bot">',
            '                <svg class="hr-bot-orb-svg" viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">',
            '                    <defs>',
            '                        <radialGradient id="hrBotSphereGrad" cx="38%" cy="30%" r="65%">',
            '                            <stop offset="0%" stop-color="#DDD6FE" />',
            '                            <stop offset="25%" stop-color="#8B5CF6" />',
            '                            <stop offset="60%" stop-color="#4F46E5" />',
            '                            <stop offset="90%" stop-color="#38BDF8" />',
            '                            <stop offset="100%" stop-color="#7DD3FC" />',
            '                        </radialGradient>',
            '                        <radialGradient id="hrBotHighlight" cx="35%" cy="25%" r="45%">',
            '                            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85" />',
            '                            <stop offset="40%" stop-color="#FFFFFF" stop-opacity="0.22" />',
            '                            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />',
            '                        </radialGradient>',
            '                        <radialGradient id="hrBotCyanGlow" cx="50%" cy="88%" r="42%">',
            '                            <stop offset="0%" stop-color="#67E8F9" stop-opacity="0.9" />',
            '                            <stop offset="45%" stop-color="#38BDF8" stop-opacity="0.4" />',
            '                            <stop offset="100%" stop-color="#38BDF8" stop-opacity="0" />',
            '                        </radialGradient>',
            '                        <radialGradient id="hrBotAmbientShadow" cx="50%" cy="50%" r="50%">',
            '                            <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.45" />',
            '                            <stop offset="100%" stop-color="#38BDF8" stop-opacity="0" />',
            '                        </radialGradient>',
            '                    </defs>',
            '                    <ellipse cx="50" cy="94" rx="28" ry="6" fill="url(#hrBotAmbientShadow)" />',
            '                    <circle cx="50" cy="48" r="42" fill="url(#hrBotSphereGrad)" />',
            '                    <circle cx="50" cy="48" r="42" fill="url(#hrBotHighlight)" />',
            '                    <circle cx="50" cy="48" r="42" fill="url(#hrBotCyanGlow)" />',
            '                    <g class="hr-bot-eyes">',
            '                        <rect class="hr-bot-eye hr-bot-eye--left" x="40" y="42" width="6.5" height="16" rx="3.25" fill="#FFFFFF" />',
            '                        <rect class="hr-bot-eye hr-bot-eye--right" x="52.5" y="42" width="6.5" height="16" rx="3.25" fill="#FFFFFF" />',
            '                    </g>',
            '                </svg>',
            '                <span class="hr-bot-wa-mini" title="Direct WhatsApp Line"><i class="fab fa-whatsapp"></i></span>',
            '            </span>',
            '            <svg class="hr-wa-icon hr-wa-icon--close" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
            '                <line x1="18" y1="6" x2="6" y2="18"></line>',
            '                <line x1="6" y1="6" x2="18" y2="18"></line>',
            '            </svg>',
            '        </span>',
            '    </button>',
            '</div>',

            '<!-- Interactive Admin Chat Box -->',
            '<div class="hr-wa-popup" id="hrWaPopup" role="dialog" aria-modal="false" aria-label="Direct WhatsApp Chat with Admin">',
            '    <!-- Header -->',
            '    <div class="hr-wa-header">',
            '        <div class="hr-wa-header__admin">',
            '            <div class="hr-wa-avatar">',
            '                <img src="assets/images/bot-icon.svg" alt="High Reach AI Bot" class="hr-wa-avatar-img">',
            '                <span class="hr-wa-avatar-beacon"></span>',
            '            </div>',
            '            <div class="hr-wa-header__info">',
            '                <div class="hr-wa-header__name-row">',
            '                    <span class="hr-wa-admin-title">High Reach Admin</span>',
            '                    <span class="hr-wa-verified" title="Verified Admin">',
            '                        <svg viewBox="0 0 24 24" width="14" height="14" fill="#0062F3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
            '                    </span>',
            '                </div>',
            '                <span class="hr-wa-status-text">',
            '                    <span class="hr-wa-dot"></span> Online • Direct Admin Line',
            '                </span>',
            '            </div>',
            '        </div>',
            '        <button type="button" class="hr-wa-close-btn" id="hrWaCloseBtn" aria-label="Close Chat">&times;</button>',
            '    </div>',

            '    <!-- Body / Chat Canvas -->',
            '    <div class="hr-wa-body">',
            '        <div class="hr-wa-date-divider"><span>Today</span></div>',
            '        ',
            '        <!-- Incoming Admin Message 1 -->',
            '        <div class="hr-wa-msg hr-wa-msg--incoming">',
            '            <div class="hr-wa-msg__bubble">',
            '                <p class="hr-wa-msg__text">Hello! Welcome to <strong>High Reach</strong> 👋</p>',
            '                <span class="hr-wa-msg__meta">' + timeString + '</span>',
            '            </div>',
            '        </div>',

            '        <!-- Incoming Admin Message 2 -->',
            '        <div class="hr-wa-msg hr-wa-msg--incoming">',
            '            <div class="hr-wa-msg__bubble">',
            '                <p class="hr-wa-msg__text">I\'m the Admin. How can we help you scale your brand, build your website, or run high-converting marketing campaigns today?</p>',
            '                <span class="hr-wa-msg__meta">' + timeString + ' <svg viewBox="0 0 16 15" width="14" height="13" fill="#34B7F1" style="vertical-align:middle;margin-left:2px;"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/></svg></span>',
            '            </div>',
            '        </div>',

            '        <!-- Quick Topics Section -->',
            '        <div class="hr-wa-chips-title">Pick a topic to start instantly:</div>',
            '        <div class="hr-wa-chips-wrap">',
            chipsHtml,
            '        </div>',
            '    </div>',

            '    <!-- Footer / Input Form -->',
            '    <div class="hr-wa-footer">',
            '        <form class="hr-wa-form" id="hrWaForm">',
            '            <div class="hr-wa-input-row">',
            '                <input type="text" class="hr-wa-input" id="hrWaInput" placeholder="Type a message to admin..." autocomplete="off">',
            '                <button type="submit" class="hr-wa-send-btn" id="hrWaSendBtn" aria-label="Send message on WhatsApp">',
            '                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">',
            '                        <line x1="22" y1="2" x2="11" y2="13"></line>',
            '                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>',
            '                    </svg>',
            '                </button>',
            '            </div>',
            '        </form>',
            '        <button type="button" class="hr-wa-direct-cta" id="hrWaDirectCta">',
            '            <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor" style="flex-shrink:0;">',
            '                <path d="M16 2.5C8.544 2.5 2.5 8.544 2.5 16c0 2.65.766 5.12 2.088 7.213L2.7 29.3l6.288-1.85A13.435 13.435 0 0016 29.5c7.456 0 13.5-6.044 13.5-13.5S23.456 2.5 16 2.5zm0 24.636c-2.316 0-4.48-.686-6.3-1.868l-.452-.292-4.17 1.226 1.25-3.996-.312-.464A11.107 11.107 0 014.864 16c0-6.14 5-11.136 11.136-11.136 6.14 0 11.136 4.996 11.136 11.136 0 6.14-4.996 11.136-11.136 11.136zm6.388-8.324c-.35-.175-2.07-.1022-2.392-1.139-.322-.117-.556-.175-.79.175-.234.35-.906 1.139-1.11 1.373-.205.234-.409.263-.76.088-.35-.175-1.478-.545-2.815-1.737-1.04-.928-1.743-2.075-1.948-2.425-.205-.35-.022-.54.153-.714.158-.157.35-.41.526-.614.175-.205.234-.35.35-.584.118-.234.059-.439-.029-.614-.088-.175-.79-1.9-.108-2.6-.312-.7-.63-.6-.864-.614l-.737-.015c-.254 0-.668.096-1.018.477-.35.38-1.34 1.31-1.34 3.193s1.37 3.702 1.56 3.965c.19.263 2.695 4.116 6.53 5.77 2.68 1.157 3.697 1.037 4.398.972.775-.073 2.07-.846 2.362-1.662.292-.817.292-1.518.204-1.664-.087-.146-.32-.234-.67-.409z"/>',
            '            </svg>',
            '            <span>Start Chat on WhatsApp (+91 9972 772 416)</span>',
            '        </button>',
            '        <div class="hr-wa-footer__sub">',
            '            🔒 Direct end-to-end encrypted chat with admin',
            '        </div>',
            '    </div>',
            '</div>'
        ].join('\n');

        bindEvents(container);
    }

    function bindEvents(container) {
        var triggerBtn = container.querySelector('#hrWaTriggerBtn');
        var popup = container.querySelector('#hrWaPopup');
        var closeBtn = container.querySelector('#hrWaCloseBtn');
        var prompt = container.querySelector('#hrWaPrompt');
        var promptClick = container.querySelector('#hrWaPromptClick');
        var promptClose = container.querySelector('#hrWaPromptClose');
        var badge = container.querySelector('#hrWaBadge');
        var form = container.querySelector('#hrWaForm');
        var input = container.querySelector('#hrWaInput');
        var directCta = container.querySelector('#hrWaDirectCta');
        var chips = container.querySelectorAll('.hr-wa-chip');

        function togglePopup(forceState) {
            var isOpen = popup.classList.contains('is-open');
            var nextState = typeof forceState === 'boolean' ? forceState : !isOpen;

            if (nextState) {
                popup.classList.add('is-open');
                triggerBtn.classList.add('is-active');
                triggerBtn.setAttribute('aria-expanded', 'true');
                if (badge) {
                    badge.style.display = 'none';
                }
                if (prompt) {
                    prompt.classList.remove('is-visible');
                }
                setTimeout(function () {
                    if (input) input.focus();
                }, 300);
            } else {
                popup.classList.remove('is-open');
                triggerBtn.classList.remove('is-active');
                triggerBtn.setAttribute('aria-expanded', 'false');
            }
        }

        // Trigger Click: on mobile, open direct WhatsApp chat; on desktop, toggle the interactive popup
        triggerBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (window.innerWidth <= 767) {
                launchWhatsApp();
            } else {
                togglePopup();
            }
        });

        // Close Button Click
        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                togglePopup(false);
            });
        }

        // Prompt Click
        if (promptClick) {
            promptClick.addEventListener('click', function (e) {
                e.stopPropagation();
                togglePopup(true);
            });
        }

        // Prompt Dismiss Click
        if (promptClose) {
            promptClose.addEventListener('click', function (e) {
                e.stopPropagation();
                prompt.classList.remove('is-visible');
                prompt.style.display = 'none';
            });
        }

        // Quick Reply Chips Click
        chips.forEach(function (chip) {
            chip.addEventListener('click', function (e) {
                e.preventDefault();
                var index = parseInt(this.getAttribute('data-index'), 10);
                var selected = QUICK_CHIPS[index];
                if (selected) {
                    launchWhatsApp(selected.msg);
                }
            });
        });

        // Form Submit
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var text = input ? input.value : '';
                launchWhatsApp(text);
                if (input) input.value = '';
            });
        }

        // Direct CTA
        if (directCta) {
            directCta.addEventListener('click', function (e) {
                e.preventDefault();
                var text = input && input.value ? input.value : DEFAULT_MESSAGE;
                launchWhatsApp(text);
            });
        }

        // Click Outside to Close
        document.addEventListener('click', function (e) {
            if (!container.contains(e.target) && popup.classList.contains('is-open')) {
                togglePopup(false);
            }
        });

        // ESC Key to Close
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && popup.classList.contains('is-open')) {
                togglePopup(false);
            }
        });

        // Auto-show prompt after 1.8 seconds if not previously dismissed
        setTimeout(function () {
            if (prompt && !popup.classList.contains('is-open')) {
                prompt.classList.add('is-visible');
            }
        }, 1800);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhatsAppWidget);
    } else {
        initWhatsAppWidget();
    }
})();
