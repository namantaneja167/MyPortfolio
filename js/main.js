/* ============================================
   Naman Taneja - Portfolio Website JavaScript
   ============================================ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
    try {
        AOS.init({ duration: 600, easing: 'ease-out', once: true, offset: 100 });

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
        initChatWidget();
        initConstellation();
        initReadMore();

        console.log('Application initialized successfully.');
    } catch (error) {
        console.error('Initialization Error:', error);
    }
});

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                window.scrollTo({ top: target.offsetTop - headerHeight, behavior: 'smooth' });
                // Auto-close mobile menu
                document.querySelector('.nav').classList.remove('active');
                document.querySelector('.menu-toggle').classList.remove('active');
            }
        });
    });
}

function initCounterAnimation() {
    const counters = document.querySelectorAll('.metric-number[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-count');
                let count = 0;
                const increment = target / 50;
                const update = () => {
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
    counters.forEach(c => observer.observe(c));
}

function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.style.boxShadow = 'var(--shadow-md)';
        else header.style.boxShadow = 'none';
    });
}

function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPos = window.scrollY || window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollPos >= sectionTop - 150) current = section.getAttribute('id');
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) link.classList.add('active');
        });
    });
}

function initFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');
        const originalText = btnText?.innerText || btn.innerText;

        // Show loading state
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'flex';
        btn.disabled = true;

        try {
            // Use Formspree API
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // Success - show success message
                form.style.display = 'none';
                const success = document.getElementById('formSuccess');
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
    const sendAnotherBtn = document.getElementById('sendAnother');
    if (sendAnotherBtn) {
        sendAnotherBtn.addEventListener('click', () => {
            form.style.display = 'block';
            const success = document.getElementById('formSuccess');
            if (success) success.style.display = 'none';
            const btn = form.querySelector('button');
            if (btn) {
                const btnText = btn.querySelector('.btn-text');
                const btnLoading = btn.querySelector('.btn-loading');
                if (btnText) btnText.style.display = 'inline';
                if (btnLoading) btnLoading.style.display = 'none';
                btn.disabled = false;
            }
        });
    }
}

function initProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid || !window.PORTFOLIO_DATA || !window.PORTFOLIO_DATA.projects) return;

    grid.innerHTML = '';
    window.PORTFOLIO_DATA.projects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'project-card';

        // Build the link HTML
        let linkHTML = '';
        if (p.linkClass === 'disabled') {
            linkHTML = `<div class="project-links"><span class="link-item disabled"><i class='bx ${p.linkIcon}'></i> ${p.linkText}</span></div>`;
        } else {
            linkHTML = `<div class="project-links"><a href="${p.link}" class="link-item" target="_blank" rel="noopener noreferrer"><i class='bx ${p.linkIcon}'></i> ${p.linkText}</a></div>`;
        }

        card.innerHTML = `
            <div class="project-visual ${p.theme}"><i class='bx ${p.icon} project-icon'></i></div>
            <div class="project-content">
                <h3 class="project-title">${p.title}</h3>
                <p class="project-description">${p.description}</p>
                <div class="project-tech">${p.stack.map(s => `<span>${s}</span>`).join('')}</div>
                ${linkHTML}
            </div>
        `;
        grid.appendChild(card);
    });
}

function initSkillsFilter() {
    'use strict';
    try {
        const grid = document.getElementById('skillsGrid');
        const filterContainer = document.getElementById('skillsFilter');

        if (!grid || !filterContainer || !window.PORTFOLIO_DATA || !window.PORTFOLIO_DATA.skills) return;

        const skills = window.PORTFOLIO_DATA.skills;

        // 1. Generate Categories
        const categories = ['All', ...new Set(skills.map(s => s.category).filter(Boolean))];

        // 2. Render Filter Buttons
        filterContainer.innerHTML = categories.map(cat => `
            <button class="filter-btn ${cat === 'All' ? 'active' : ''}" data-category="${cat}">
                ${cat}
            </button>
        `).join('');

        // 3. Render Initial Skills (All)
        renderSkills('All');

        // 4. Add Click Listeners
        filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update Active Button
                filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter Grid
                const category = btn.getAttribute('data-category');
                renderSkills(category);
            });
        });

        function renderSkills(category) {
            // Fade out
            grid.style.opacity = '0';

            setTimeout(() => {
                const filtered = category === 'All'
                    ? skills
                    : skills.filter(s => s.category === category);

                grid.innerHTML = filtered.map((s, index) => `
                    <div class="skill-card active" style="animation-delay: ${index * 50}ms">
                        <div class="skill-icon"><i class='bx ${s.icon}'></i></div>
                        <div class="skill-name">${s.name}</div>
                        <div class="skill-level">${Array(5).fill(0).map((_, i) =>
                    `<span class="dot ${i < s.level ? 'filled' : ''}"></span>`
                ).join('')}</div>
                    </div>
                `).join('');

                // Fade in
                grid.style.opacity = '1';
            }, 300);
        }

    } catch (e) { console.error('Skills error:', e); }
}

function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        const isExpanded = nav.classList.toggle('active');
        toggle.classList.toggle('active');
        toggle.setAttribute('aria-expanded', isExpanded);
    });
}

function initBlogPosts() {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;
    const RSS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@namantaneja167';
    fetch(RSS_URL).then(res => res.json()).then(data => {
        if (data.status === 'ok' && data.items) {
            grid.innerHTML = data.items.slice(0, 6).map((item, index) => {
                // Extract thumbnail from content
                let thumbnail = '';
                if (item.thumbnail) {
                    thumbnail = item.thumbnail;
                } else {
                    // Try to extract first image from content
                    const imgMatch = item.content?.match(/<img[^>]+src="([^">]+)"/);
                    thumbnail = imgMatch ? imgMatch[1] : item.enclosure?.link || '';
                }

                const excerpt = item.description.replace(/<[^>]*>/g, '').substring(0, 150);
                const date = new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                return `
                    <div class="blog-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                        <div class="blog-thumbnail">
                            <img src="${thumbnail}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'; this.parentElement.style.display='none';">
                        </div>
                        <div class="blog-card-content">
                            <div class="blog-meta">
                                <span><i class='bx bx-calendar'></i> ${date}</span>
                            </div>
                            <h3 class="blog-title">${item.title}</h3>
                            <p class="blog-excerpt">${excerpt}...</p>
                            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="blog-link">
                                Read More <i class='bx bx-right-arrow-alt'></i>
                            </a>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }).catch(err => {
        console.error('Blog Fetch Error:', err);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Unable to load articles. Please visit <a href="https://medium.com/@namantaneja167" target="_blank" style="color: var(--primary-blue);">Medium</a> directly.</p>';
    });
}

function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) btn.classList.add('visible');
        else btn.classList.remove('visible');
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initCopyEmail() {
    document.querySelectorAll('.copy-email').forEach(btn => {
        btn.addEventListener('click', () => {
            const email = btn.getAttribute('data-email');
            navigator.clipboard.writeText(email);
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = 'bx bx-check';
                setTimeout(() => icon.className = 'bx bx-copy', 2000);
            }
        });
    });
}

function initTheme() {
    const btn = document.querySelector('.theme-toggle');
    const html = document.documentElement;
    const saved = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    html.setAttribute('data-theme', saved);
    updateToggleIcon(saved);

    if (btn) {
        btn.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const target = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', target);
            localStorage.setItem('theme', target);
            updateToggleIcon(target);
        });
    }

    function updateToggleIcon(theme) {
        const icon = btn ? btn.querySelector('i') : null;
        if (icon) icon.className = theme === 'dark' ? 'bx bx-moon' : 'bx bx-sun';
    }
}

function initChatWidget() {
    const toggle = document.getElementById('chatToggle');
    const closeBtn = document.getElementById('chatClose');
    const windowEl = document.getElementById('chatWindow');
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    const promptsContainer = document.getElementById('chatPrompts');

    if (!toggle || !windowEl || !form) return;

    // 1. Toggle Chat
    toggle.addEventListener('click', () => {
        windowEl.classList.toggle('active');
        // Clear new message badge on open
        const badge = toggle.querySelector('.chat-badge');
        if (badge && windowEl.classList.contains('active')) badge.style.display = 'none';
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => windowEl.classList.remove('active'));
    }

    // 2. Load History
    try {
        const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
        if (history.length > 0) {
            messages.innerHTML = '';
            history.forEach(msg => appendMsg(msg.text, msg.sender, false)); // false = don't save again
        }
    } catch (e) { console.warn('History load failed', e); }

    // 3. Render Quick Prompts
    if (window.PORTFOLIO_DATA && window.PORTFOLIO_DATA.chatKnowledgeBase && window.PORTFOLIO_DATA.chatKnowledgeBase.quickPrompts && promptsContainer) {
        promptsContainer.innerHTML = window.PORTFOLIO_DATA.chatKnowledgeBase.quickPrompts.map(p =>
            `<button type="button" class="prompt-chip">${p}</button>`
        ).join('');

        promptsContainer.querySelectorAll('.prompt-chip').forEach(chip => {
            chip.addEventListener('click', () => handleSend(chip.innerText));
        });
    }

    // 4. Handle Send
    function handleSend(text) {
        if (!text.trim()) return;

        appendMsg(text, 'user', true);
        if (input) input.value = '';

        // Show Typing Indicator
        const typingId = 'typing-' + Date.now();
        const typingHTML = `
            <div class="message bot" id="${typingId}">
                <div class="typing-indicator" style="display:flex;gap:4px;padding:12px;background:var(--bg-white);border-radius:12px;width:fit-content;border:1px solid var(--border-light)">
                    <div class="typing-dot" style="width:6px;height:6px;background:var(--text-muted);border-radius:50%;animation:typing 1.4s infinite ease-in-out both"></div>
                    <div class="typing-dot" style="width:6px;height:6px;background:var(--text-muted);border-radius:50%;animation:typing 1.4s infinite ease-in-out both;animation-delay:-0.16s"></div>
                    <div class="typing-dot" style="width:6px;height:6px;background:var(--text-muted);border-radius:50%;animation:typing 1.4s infinite ease-in-out both;animation-delay:-0.32s"></div>
                </div>
            </div>`;
        messages.insertAdjacentHTML('beforeend', typingHTML);
        messages.scrollTop = messages.scrollHeight;

        setTimeout(() => {
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();

            if (!window.PORTFOLIO_DATA || !window.PORTFOLIO_DATA.chatKnowledgeBase) return;

            const kb = window.PORTFOLIO_DATA.chatKnowledgeBase;
            const lowerText = text.toLowerCase();
            let found = Object.values(kb).find(v => v.keywords && v.keywords.some(k => lowerText.includes(k.toLowerCase())));

            const responseText = found ? found.response : kb.default.response;
            appendMsg(responseText, 'bot', true);
        }, 1000);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSend(input.value);
    });

    function appendMsg(text, sender, save = true) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        div.innerHTML = `<div class="message-content">${formatted}</div>`;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;

        if (save) {
            try {
                const currentHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
                currentHistory.push({ text, sender, time: new Date().toISOString() });
                localStorage.setItem('chatHistory', JSON.stringify(currentHistory));
            } catch (e) { console.warn('History save failed', e); }
        }
    }
}

function initConstellation() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    const resize = () => {
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class P {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(37,99,235,0.3)';
            ctx.fill();
        }
    }

    const count = window.innerWidth < 768 ? 30 : 70;
    for (let i = 0; i < count; i++) particles.push(new P());

    function anim() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(anim);
    }
    anim();
}

function initReadMore() {
    const btn = document.getElementById('readMoreBtn');
    const story = document.querySelector('.about-story');

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

    btn.addEventListener('click', () => {
        story.classList.toggle('expanded');
        const isExpanded = story.classList.contains('expanded');
        btn.innerHTML = isExpanded
            ? '<i class="bx bx-chevron-up"></i> Read Less'
            : '<i class="bx bx-chevron-down"></i> Read More';
    });
}
