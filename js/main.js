/* ============================================
   Naman Taneja - Portfolio Website JavaScript
   Module-Based Architecture (IIFE Pattern for file:// compatibility)
   ============================================ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
    try {
        AOS.init({ duration: 600, easing: 'ease-out', once: true, offset: 100 });

        // Initialize ChatService with knowledge base
        var chatService = new window.ChatService(window.PORTFOLIO_DATA.chatKnowledgeBase);

        // Initialize all features with safety checks
        initSmoothScroll();
        initCounterAnimation();
        initHeaderScroll();
        initFormValidation();
        initActiveNavLink();
        initProjects();
        initSkillsFilter();
        initMobileMenu();
        initBlogPosts();
        initBackToTop();
        initCopyEmail();
        initTheme();
        initChatWidget(chatService);
        initConstellation();
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
                var headerHeight = document.querySelector('.header').offsetHeight;
                window.scrollTo({ top: target.offsetTop - headerHeight, behavior: 'smooth' });
                // Auto-close mobile menu using StateManager
                closeMobileMenu();
            }
        });
    });
}

function closeMobileMenu() {
    var nav = document.querySelector('.nav');
    var toggle = document.querySelector('.menu-toggle');
    if (nav && toggle) {
        nav.classList.remove('active');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        window.StateManager.setMobileMenuOpen(false);
    }
}

function initCounterAnimation() {
    var counters = document.querySelectorAll('.metric-number[data-count]');
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
    var header = document.querySelector('.header');
    if (!header) return;
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) header.style.boxShadow = 'var(--shadow-md)';
        else header.style.boxShadow = 'none';
    });
}

function initActiveNavLink() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');
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

function initSkillsFilter() {
    'use strict';
    try {
        var grid = document.getElementById('skillsGrid');
        var filterContainer = document.getElementById('skillsFilter');

        if (!grid || !filterContainer || !window.PORTFOLIO_DATA || !window.PORTFOLIO_DATA.skills) return;

        var skills = window.PORTFOLIO_DATA.skills;

        // 1. Generate Categories
        var categorySet = new Set(skills.map(function (s) { return s.category; }).filter(Boolean));
        var categories = ['All'].concat(Array.from(categorySet));

        // 2. Render Filter Buttons
        filterContainer.innerHTML = categories.map(function (cat) {
            return '<button class="filter-btn ' + (cat === 'All' ? 'active' : '') + '" data-category="' + cat + '">' +
                cat +
                '</button>';
        }).join('');

        // 3. Render Initial Skills (All)
        renderSkills('All');

        // 4. Add Click Listeners
        filterContainer.querySelectorAll('.filter-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                // Update Active Button
                filterContainer.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');

                // Filter Grid
                var category = btn.getAttribute('data-category');
                renderSkills(category);
            });
        });

        function renderSkills(category) {
            // Fade out
            grid.style.opacity = '0';

            setTimeout(function () {
                var filtered = category === 'All'
                    ? skills
                    : skills.filter(function (s) { return s.category === category; });

                grid.innerHTML = filtered.map(function (s, index) {
                    return '<div class="skill-card active" style="animation-delay: ' + (index * 50) + 'ms">' +
                        '<div class="skill-icon"><i class=\'bx ' + s.icon + '\'></i></div>' +
                        '<div class="skill-name">' + s.name + '</div>' +
                        '<div class="skill-level">' + Array(5).fill(0).map(function (_, i) {
                            return '<span class="dot ' + (i < s.level ? 'filled' : '') + '"></span>';
                        }).join('') + '</div>' +
                        '</div>';
                }).join('');

                // Fade in
                grid.style.opacity = '1';
            }, 300);
        }

    } catch (e) { console.error('Skills error:', e); }
}

function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
        var isExpanded = window.StateManager.toggleMobileMenu();
        nav.classList.toggle('active', isExpanded);
        toggle.classList.toggle('active', isExpanded);
        toggle.setAttribute('aria-expanded', isExpanded);
    });
}

function initBlogPosts() {
    var grid = document.getElementById('blogGrid');
    if (!grid) return;
    var RSS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@namantaneja167';
    fetch(RSS_URL).then(function (res) { return res.json(); }).then(function (data) {
        if (data.status === 'ok' && data.items) {
            grid.innerHTML = data.items.slice(0, 6).map(function (item, index) {
                // Extract thumbnail from content
                var thumbnail = '';
                if (item.thumbnail) {
                    thumbnail = item.thumbnail;
                } else {
                    // Try to extract first image from content
                    var imgMatch = item.content ? item.content.match(/<img[^>]+src="([^">]+)"/) : null;
                    thumbnail = imgMatch ? imgMatch[1] : (item.enclosure ? item.enclosure.link : '') || '';
                }

                var excerpt = item.description.replace(/<[^>]*>/g, '').substring(0, 150);
                var date = new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                return '<div class="blog-card" data-aos="fade-up" data-aos-delay="' + (index * 100) + '">' +
                    '<div class="blog-thumbnail">' +
                    '<img src="' + thumbnail + '" alt="' + item.title + '" loading="lazy" onerror="this.style.display=\'none\'; this.parentElement.style.display=\'none\';">' +
                    '</div>' +
                    '<div class="blog-card-content">' +
                    '<div class="blog-meta">' +
                    '<span><i class=\'bx bx-calendar\'></i> ' + date + '</span>' +
                    '</div>' +
                    '<h3 class="blog-title">' + item.title + '</h3>' +
                    '<p class="blog-excerpt">' + excerpt + '...</p>' +
                    '<a href="' + item.link + '" target="_blank" rel="noopener noreferrer" class="blog-link">' +
                    'Read More <i class=\'bx bx-right-arrow-alt\'></i>' +
                    '</a>' +
                    '</div>' +
                    '</div>';
            }).join('');
        }
    }).catch(function (err) {
        console.error('Blog Fetch Error:', err);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Unable to load articles. Please visit <a href="https://medium.com/@namantaneja167" target="_blank" style="color: var(--primary-blue);">Medium</a> directly.</p>';
    });
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

    // 1. Toggle Chat
    toggle.addEventListener('click', function () {
        windowEl.classList.toggle('active');
        // Clear new message badge on open
        var badge = toggle.querySelector('.chat-badge');
        if (badge && windowEl.classList.contains('active')) badge.style.display = 'none';
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function () { windowEl.classList.remove('active'); });
    }

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
        var formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        div.innerHTML = '<div class="message-content">' + formatted + '</div>';
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;

        if (save) {
            window.StateManager.addChatMessage(text, sender);
        }
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
