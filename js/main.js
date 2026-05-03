/* ============================================
   Naman Taneja - Portfolio Website JavaScript
   Module-Based Architecture (IIFE Pattern for file:// compatibility)
   ============================================ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
    try {
        // AOS CDN fallback - gracefully degrade if CDN failed
        if (typeof AOS !== 'undefined') {
            AOS.init({ duration: 600, easing: 'ease-out', once: true, offset: 100 });
        } else {
            console.warn('AOS library not loaded - animations disabled');
            // Remove data-aos attributes to prevent invisible elements
            document.querySelectorAll('[data-aos]').forEach(function (el) {
                el.removeAttribute('data-aos');
                el.removeAttribute('data-aos-delay');
            });
        }

        // Initialize ChatService with knowledge base
        var chatService = new window.ChatService(window.PORTFOLIO_DATA.chatKnowledgeBase);

        // Initialize all features with safety checks
        initSmoothScroll();
        initCounterAnimation();
        initHeaderScroll();
        initFormValidation();
        initActiveNavLink();
        initProjects();
        initSkillsHUD();
        initMobileMenu();
        initBlogPosts();
        initBackToTop();
        initCopyEmail();
        initTheme();
        initChatWidget(chatService);
        // initConstellation(); — canvas removed from hero
        initReadMore();

        console.log('Application initialized successfully.');
    } catch (error) {
        console.error('Initialization Error:', error);
    }
});

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            var target = document.querySelector(href);
            if (target) {
                var headerHeight = (document.querySelector('.navbar') || { offsetHeight: 70 }).offsetHeight;
                window.scrollTo({ top: target.offsetTop - headerHeight, behavior: 'smooth' });
                // Auto-close mobile menu using StateManager
                closeMobileMenu();
            }
        });
    });
}

function closeMobileMenu() {
    var nav = document.querySelector('.navbar-nav');
    var toggle = document.querySelector('.navbar-toggle');
    if (nav && toggle) {
        nav.classList.remove('active');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        window.StateManager.setMobileMenuOpen(false);
    }
}

function initCounterAnimation() {
    var counters = document.querySelectorAll('.metric-value[data-count]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var counter = entry.target;
                var target = +counter.getAttribute('data-count');
                var count = 0;
                var increment = target / 50;
                var update = function () {
                    count += increment;
                    if (count < target) {
                        counter.innerText = Math.ceil(count);
                        requestAnimationFrame(update);
                    } else counter.innerText = target;
                };
                update();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { observer.observe(c); });
}

function initHeaderScroll() {
    var header = document.querySelector('.navbar');
    if (!header) return;
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) header.style.boxShadow = 'var(--shadow-md)';
        else header.style.boxShadow = 'none';
    });
}

function initActiveNavLink() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.navbar-link');
    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', function () {
        var current = '';
        var scrollPos = window.scrollY || window.pageYOffset;

        sections.forEach(function (section) {
            var sectionTop = section.offsetTop;
            if (scrollPos >= sectionTop - 150) current = section.getAttribute('id');
        });

        navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) link.classList.add('active');
        });
    });
}

function initFormValidation() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        var btn = form.querySelector('button');
        var btnText = btn.querySelector('.btn-text');
        var btnLoading = btn.querySelector('.btn-loading');

        // Show loading state
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'flex';
        btn.disabled = true;

        try {
            // Use Formspree API
            var formData = new FormData(form);
            var response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // Success - show success message
                form.style.display = 'none';
                var success = document.getElementById('formSuccess');
                if (success) success.style.display = 'block';

                // Reset form for potential resubmission
                form.reset();
            } else {
                // Error - show message
                alert('Failed to send message. Please try again.');
                resetButton();
            }
        } catch (error) {
            console.error('Form submission error:', error);
            alert('Error sending message. Please try again.');
            resetButton();
        }

        function resetButton() {
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
            btn.disabled = false;
        }
    });

    // Reset form display when clicking "Send Another Message"
    var sendAnotherBtn = document.getElementById('sendAnother');
    if (sendAnotherBtn) {
        sendAnotherBtn.addEventListener('click', function () {
            form.style.display = 'block';
            var success = document.getElementById('formSuccess');
            if (success) success.style.display = 'none';
            var btn = form.querySelector('button');
            if (btn) {
                var btnText = btn.querySelector('.btn-text');
                var btnLoading = btn.querySelector('.btn-loading');
                if (btnText) btnText.style.display = 'inline';
                if (btnLoading) btnLoading.style.display = 'none';
                btn.disabled = false;
            }
        });
    }
}

function initProjects() {
    var grid = document.getElementById('projectsGrid');
    if (!grid || !window.PORTFOLIO_DATA || !window.PORTFOLIO_DATA.projects) return;

    grid.innerHTML = '';
    window.PORTFOLIO_DATA.projects.forEach(function (p) {
        var card = document.createElement('div');
        card.className = 'project-card';

        // Build the link HTML
        var linkHTML = '';
        if (p.linkClass === 'disabled') {
            linkHTML = '<div class="project-links"><span class="link-item disabled"><i class=\'bx ' + p.linkIcon + '\'></i> ' + p.linkText + '</span></div>';
        } else {
            linkHTML = '<div class="project-links"><a href="' + p.link + '" class="link-item" target="_blank" rel="noopener noreferrer"><i class=\'bx ' + p.linkIcon + '\'></i> ' + p.linkText + '</a></div>';
        }

        card.innerHTML =
            '<div class="project-visual ' + p.theme + '"><i class=\'bx ' + p.icon + ' project-icon\'></i></div>' +
            '<div class="project-content">' +
            '<h3 class="project-title">' + p.title + '</h3>' +
            '<p class="project-description">' + p.description + '</p>' +
            '<div class="project-tech">' + p.stack.map(function (s) { return '<span>' + s + '</span>'; }).join('') + '</div>' +
            linkHTML +
            '</div>';
        grid.appendChild(card);
    });
}

function initSkillsHUD() {
    var tabs = document.querySelectorAll('.hud-tab');
    var grids = document.querySelectorAll('.skill-grid');

    if (!tabs.length || !grids.length) return;

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            // Remove active from all tabs
            tabs.forEach(function (t) { t.classList.remove('active'); });
            // Add active to clicked
            this.classList.add('active');

            // Hide all grids and show target
            var targetId = this.getAttribute('data-target');
            grids.forEach(function (g) {
                g.classList.remove('active');
                if (g.id === targetId) {
                    g.classList.add('active');
                }
            });
        });
    });
}

function initMobileMenu() {
    var toggle = document.querySelector('.navbar-toggle');
    var nav = document.querySelector('.navbar-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
        var isExpanded = window.StateManager.toggleMobileMenu();
        updateMenuState(isExpanded);
    });

    // Keyboard trap fix: Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && window.StateManager.getMobileMenuOpen()) {
            window.StateManager.setMobileMenuOpen(false);
            updateMenuState(false);
            toggle.focus(); // Return focus to toggle button
        }
    });

    // Close on nav link click (already handled in smooth scroll, but reinforce)
    nav.querySelectorAll('.navbar-link, .navbar-btn').forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.StateManager.getMobileMenuOpen()) {
                window.StateManager.setMobileMenuOpen(false);
                updateMenuState(false);
            }
        });
    });

    function updateMenuState(isExpanded) {
        nav.classList.toggle('active', isExpanded);
        toggle.classList.toggle('active', isExpanded);
        toggle.setAttribute('aria-expanded', isExpanded);
        // Prevent body scroll when menu is open
        document.body.style.overflow = isExpanded ? 'hidden' : '';
    }
}

function initBlogPosts() {
    var grid = document.getElementById('cinematicBlogGrid');
    if (!grid) return;

    // Show skeleton loaders while fetching
    grid.innerHTML = [0, 1, 2].map(function () {
        return '<div class="feed-card skeleton">' +
            '<div class="card-meta">' +
            '<div class="skeleton-box" style="width:80px;height:12px;"></div>' +
            '<div class="skeleton-box" style="width:120px;height:12px;"></div>' +
            '</div>' +
            '<div class="skeleton-box" style="width:90%;height:22px;margin:12px 0 8px;"></div>' +
            '<div class="skeleton-box" style="width:100%;height:56px;"></div>' +
            '</div>';
    }).join('');

    var RSS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@namantaneja167';
    var TIMEOUT_MS = 10000;

    // Fetch with timeout
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeoutId = setTimeout(function () {
        if (controller) controller.abort();
    }, TIMEOUT_MS);

    var fetchOptions = controller ? { signal: controller.signal } : {};

    fetch(RSS_URL, fetchOptions)
        .then(function (res) { return res.json(); })
        .then(function (data) {
            clearTimeout(timeoutId);
            if (data.status === 'ok' && data.items) {
                grid.innerHTML = data.items.slice(0, 3).map(function (item, index) {
                    // Sanitize: use textContent approach for user-provided data
                    var titleEl = document.createElement('span');
                    titleEl.textContent = item.title || '';
                    var safeTitle = titleEl.innerHTML;

                    var rawExcerpt = (item.description || '').replace(/<[^>]*>/g, '').substring(0, 150);
                    var excerptEl = document.createElement('span');
                    excerptEl.textContent = rawExcerpt;
                    var safeExcerpt = excerptEl.innerHTML;

                    var safeLink = (item.link || 'https://medium.com/@namantaneja167').replace(/['"<>]/g, '');
                    var date = new Date(item.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

                    // Detect topic tag from categories
                    var rawTag = (item.categories && item.categories[0]) ? item.categories[0] : 'Data Engineering';
                    // Title-case: capitalize first letter of each word
                    var titleTag = rawTag.replace(/-/g, ' ').replace(/\w\S*/g, function(w) {
                        return w.charAt(0).toUpperCase() + w.substr(1).toLowerCase();
                    });
                    var tagEl = document.createElement('span');
                    tagEl.textContent = titleTag;
                    var safeTag = tagEl.innerHTML;

                    return '<div class="feed-card" data-aos="fade-up" data-aos-delay="' + (index * 100) + '">' +
                        '<div class="card-meta">' +
                        '<span class="feed-date">' + date + '</span>' +
                        '<span class="feed-tag">' + safeTag + '</span>' +
                        '</div>' +
                        '<h3 class="feed-title">' + safeTitle + '</h3>' +
                        '<p class="feed-excerpt">' + safeExcerpt + '...</p>' +
                        '<a href="' + safeLink + '" target="_blank" rel="noopener noreferrer" class="feed-link">' +
                        'Read <i class=\'bx bx-right-arrow-alt\' aria-hidden="true"></i>' +
                        '</a>' +
                        '</div>';
                }).join('');
            } else {
                showFallback();
            }
        })
        .catch(function (err) {
            clearTimeout(timeoutId);
            console.error('Blog Fetch Error:', err);
            showFallback();
        });

    function showFallback() {
        grid.innerHTML = '<p class="blog-fallback">Unable to load articles. <a href="https://medium.com/@namantaneja167" target="_blank" rel="noopener noreferrer">Read on Medium →</a></p>';
    }
}

function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', function () {
        if (window.scrollY > 400) btn.classList.add('visible');
        else btn.classList.remove('visible');
    });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

function initCopyEmail() {
    document.querySelectorAll('.copy-email').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var email = btn.getAttribute('data-email');
            navigator.clipboard.writeText(email);
            var icon = btn.querySelector('i');
            if (icon) {
                icon.className = 'bx bx-check';
                setTimeout(function () { icon.className = 'bx bx-copy'; }, 2000);
            }
        });
    });
}

function initTheme() {
    var btn = document.querySelector('.theme-toggle');
    var html = document.documentElement;

    // Get initial theme from StateManager
    var savedTheme = window.StateManager.getTheme();
    html.setAttribute('data-theme', savedTheme);
    updateToggleState(savedTheme);

    if (btn) {
        btn.addEventListener('click', function () {
            var newTheme = window.StateManager.toggleTheme();
            html.setAttribute('data-theme', newTheme);
            updateToggleState(newTheme);
        });
    }

    function updateToggleState(theme) {
        if (!btn) return;
        var icon = btn.querySelector('i');
        var isDark = theme === 'dark';

        // Update icon
        if (icon) icon.className = isDark ? 'bx bx-moon' : 'bx bx-sun';

        // Update aria-pressed (dark mode = pressed)
        btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');

        // Update aria-label for current state
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
}

function initChatWidget(chatService) {
    var toggle = document.getElementById('chatToggle');
    var closeBtn = document.getElementById('chatClose');
    var windowEl = document.getElementById('chatWindow');
    var form = document.getElementById('chatForm');
    var input = document.getElementById('chatInput');
    var messages = document.getElementById('chatMessages');
    var promptsContainer = document.getElementById('chatPrompts');

    if (!toggle || !windowEl || !form) return;

    // 1. Toggle Chat with Focus Management
    toggle.addEventListener('click', function () {
        var isOpening = !windowEl.classList.contains('active');
        windowEl.classList.toggle('active');

        // Clear new message badge on open
        var badge = toggle.querySelector('.chat-badge');
        if (badge && isOpening) badge.style.display = 'none';

        // Focus management for accessibility
        if (isOpening && input) {
            setTimeout(function () { input.focus(); }, 100);
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            windowEl.classList.remove('active');
            toggle.focus(); // Return focus to toggle
        });
    }

    // Escape key to close chat
    windowEl.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            windowEl.classList.remove('active');
            toggle.focus();
        }
    });

    // 2. Load History from StateManager
    var history = window.StateManager.getChatHistory();
    if (history.length > 0) {
        messages.innerHTML = '';
        history.forEach(function (msg) { appendMsg(msg.text, msg.sender, false); });
    }

    // 3. Render Quick Prompts
    var quickPrompts = chatService.getQuickPrompts();
    if (quickPrompts.length > 0 && promptsContainer) {
        promptsContainer.innerHTML = quickPrompts.map(function (p) {
            return '<button type="button" class="prompt-chip">' + p + '</button>';
        }).join('');

        promptsContainer.querySelectorAll('.prompt-chip').forEach(function (chip) {
            chip.addEventListener('click', function () { handleSend(chip.innerText); });
        });
    }

    // 4. Handle Send - Now async with ChatService
    function handleSend(text) {
        if (!text.trim()) return;

        appendMsg(text, 'user', true);
        if (input) input.value = '';

        // Show Typing Indicator using CSS class
        var typingId = 'typing-' + Date.now();
        var typingHTML = '<div class="message bot" id="' + typingId + '">' +
            '<div class="typing-indicator">' +
            '<div class="typing-dot"></div>' +
            '<div class="typing-dot"></div>' +
            '<div class="typing-dot"></div>' +
            '</div>' +
            '</div>';
        messages.insertAdjacentHTML('beforeend', typingHTML);
        messages.scrollTop = messages.scrollHeight;

        // Get async response with natural typing delay
        chatService.getResponse(text).then(function (responseText) {
            // Remove typing indicator
            var typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();

            // Append bot response
            appendMsg(responseText, 'bot', true);
        });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleSend(input.value);
    });

    function appendMsg(text, sender, save) {
        if (save === undefined) save = true;
        var div = document.createElement('div');
        div.className = 'message ' + sender;

        // XSS Protection: Escape HTML entities first, then apply safe formatting
        var escaped = escapeHtml(text);
        var formatted = escaped
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        div.innerHTML = '<div class="message-content">' + formatted + '</div>';
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;

        if (save) {
            window.StateManager.addChatMessage(text, sender);
        }
    }

    // HTML Entity Escaping - prevents XSS attacks
    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function (char) {
            return map[char];
        });
    }
}

function initConstellation() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w, h, particles = [];

    var resize = function () {
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    function P() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
    }
    P.prototype.update = function () {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
    };
    P.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(37,99,235,0.3)';
        ctx.fill();
    };

    var count = window.innerWidth < 768 ? 30 : 70;
    for (var i = 0; i < count; i++) particles.push(new P());

    function anim() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(function (p) { p.update(); p.draw(); });
        requestAnimationFrame(anim);
    }
    anim();
}

function initReadMore() {
    var btn = document.getElementById('readMoreBtn');
    var story = document.querySelector('.about-story');

    if (!btn || !story) return;

    // Show button only on mobile
    function checkMobile() {
        if (window.innerWidth <= 768) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
            story.classList.remove('expanded');
            btn.innerHTML = '<i class="bx bx-chevron-down"></i> Read More';
        }
    }

    checkMobile();
    window.addEventListener('resize', checkMobile);

    btn.addEventListener('click', function () {
        story.classList.toggle('expanded');
        var isExpanded = story.classList.contains('expanded');
        btn.innerHTML = isExpanded
            ? '<i class="bx bx-chevron-up"></i> Read Less'
            : '<i class="bx bx-chevron-down"></i> Read More';
    });
}
