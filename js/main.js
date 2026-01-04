/* ============================================
   Naman Taneja - Portfolio Website JavaScript
   ============================================ */
'use strict';

// Initialize AOS (Animate on Scroll)
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize AOS - Hero section excluded via data-aos-disabled attribute
        AOS.init({
            duration: 600,
            easing: 'ease-out',
            once: true,
            offset: 100,
            disable: false
        });

        // Initialize all features
        initSmoothScroll();
        initCounterAnimation();
        initHeaderScroll();
        initFormValidation();
        initActiveNavLink();
        initSkillsPagination();
        initMobileMenu();
        initBlogPosts();
        initBackToTop();
        initCopyEmail();
        initTheme();
        initChatWidget();
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});

/* ============================================
   Smooth Scroll Navigation
   ============================================ */
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                // Close mobile menu if open
                const menuToggle = document.querySelector('.menu-toggle');
                const nav = document.querySelector('.nav');
                if (menuToggle && menuToggle.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                    nav.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   Counter Animation
   ============================================ */
function initCounterAnimation() {
    // Counter animation for stat-number, metric-value, and metric-number elements
    const counters = document.querySelectorAll('.stat-number, .metric-value[data-count], .metric-number[data-count]');
    const speed = 200; // Animation speed
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const increment = target / speed;
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            
            if (current < target) {
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    };
    
    // Intersection Observer for counter animation
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

/* ============================================
   Header Scroll Effect
   ============================================ */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    let ticking = false;
    
    const updateHeader = () => {
        const scrollY = window.scrollY;
        
        // Add shadow on scroll
        if (scrollY > 50) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
        }
        
        ticking = false;
    };
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
}

/* ============================================
   Active Navigation Link
   ============================================ */
function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-100px 0px -50% 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

/* ============================================
   Form Validation & AJAX Submission
   ============================================ */
function initFormValidation() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');
    const sendAnother = document.getElementById('sendAnother');
    
    if (!form) return;
    
    // Handle form submission with AJAX
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = form.querySelector('#name');
        const email = form.querySelector('#email');
        const message = form.querySelector('#message');
        
        // Reset previous error states
        [name, email, message].forEach(field => {
            field.style.borderColor = '#e0e0e0';
        });
        
        // Remove any existing error message
        const existingError = form.querySelector('.form-error');
        if (existingError) existingError.remove();
        
        let isValid = true;
        
        // Validate name
        if (!name.value.trim()) {
            name.style.borderColor = '#ff4444';
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            email.style.borderColor = '#ff4444';
            isValid = false;
        }
        
        // Validate message
        if (!message.value.trim()) {
            message.style.borderColor = '#ff4444';
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading state
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        const btnIcon = submitBtn.querySelector('.btn-icon');
        
        btnText.style.display = 'none';
        btnIcon.style.display = 'none';
        btnLoading.style.display = 'inline-flex';
        submitBtn.disabled = true;
        
        // Use sendBeacon for fire-and-forget submission
        // Data is sent immediately and continues even if user closes the page
        const formData = new FormData(form);
        const data = new URLSearchParams(formData).toString();
        
        // Try sendBeacon first (most reliable for fire-and-forget)
        let sent = false;
        if (navigator.sendBeacon) {
            const blob = new Blob([data], { type: 'application/x-www-form-urlencoded' });
            sent = navigator.sendBeacon(form.action, blob);
        }
        
        // Fallback to fetch with keepalive (also continues after page close)
        if (!sent) {
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' },
                keepalive: true // Ensures request completes even if page closes
            }).catch(() => {}); // Silently handle - we've already shown success
        }
        
        // Brief delay for perceived feedback, then show success
        setTimeout(() => {
            form.style.display = 'none';
            formSuccess.style.display = 'block';
            formSuccess.classList.add('animate');
            form.reset();
            
            // Trigger haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 50]); // Short vibration pattern
            }
            
            // Reset button state
            btnText.style.display = 'inline';
            btnIcon.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }, 400); // Just enough delay to feel like something happened
    });
    
    // Handle "Send Another Message" button
    if (sendAnother) {
        sendAnother.addEventListener('click', function() {
            formSuccess.style.display = 'none';
            formSuccess.classList.remove('animate');
            form.style.display = 'block';
        });
    }
    
    // Real-time validation feedback
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#ff6b35';
        });
        
        input.addEventListener('blur', function() {
            if (this.value.trim()) {
                this.style.borderColor = '#4CAF50';
            } else {
                this.style.borderColor = '#e0e0e0';
            }
        });
    });
}



/* ============================================
   Loading Animation
   ============================================ */
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Trigger initial animations
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');
    
    if (heroContent) {
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateX(0)';
    }
    
    if (heroImage) {
        heroImage.style.opacity = '1';
        heroImage.style.transform = 'translateX(0)';
    }
});

/* ============================================
   Mobile Menu Toggle
   ============================================ */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    const body = document.body;
    
    if (!menuToggle || !nav) return;
    
    // Toggle menu on hamburger click
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.classList.toggle('active');
        body.classList.toggle('menu-open');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains('active')) {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            body.classList.remove('menu-open');
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            body.classList.remove('menu-open');
        }
    });
}

/* ============================================
   Skills Pagination
   ============================================ */
function initSkillsPagination() {
    'use strict';
    
    try {
        const skillCards = document.querySelectorAll('.skill-card');
        const prevBtn = document.getElementById('prevSkills');
        const nextBtn = document.getElementById('nextSkills');
        const paginationDotsContainer = document.getElementById('paginationDots');
        
        if (!skillCards.length || !prevBtn || !nextBtn || !paginationDotsContainer) return;
        
        let currentPage = 1;
        let itemsPerPage = getItemsPerPage();
        let totalPages = Math.ceil(skillCards.length / itemsPerPage);
        
        // Get items per page based on screen width
        function getItemsPerPage() {
            return window.innerWidth <= 768 ? 6 : 9;
        }
        
        // Generate pagination dots
        function generatePaginationDots() {
            paginationDotsContainer.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const dot = document.createElement('span');
                dot.className = 'pagination-dot' + (i === currentPage ? ' active' : '');
                dot.dataset.page = i;
                dot.addEventListener('click', function() {
                    showPage(parseInt(this.dataset.page, 10));
                });
                paginationDotsContainer.appendChild(dot);
            }
        }
        
        // Show page
        function showPage(page) {
            // Hide all cards
            skillCards.forEach(card => {
                card.classList.remove('active');
            });
            
            // Calculate start and end index for current page
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, skillCards.length);
            
            // Show cards for current page
            for (let i = startIndex; i < endIndex; i++) {
                skillCards[i].classList.add('active');
            }
            
            // Update pagination dots
            const dots = paginationDotsContainer.querySelectorAll('.pagination-dot');
            dots.forEach(dot => {
                dot.classList.remove('active');
                if (parseInt(dot.dataset.page, 10) === page) {
                    dot.classList.add('active');
                }
            });
            
            // Update button states
            prevBtn.disabled = page === 1;
            nextBtn.disabled = page === totalPages;
            
            currentPage = page;
        }
        
        // Handle resize
        function handleResize() {
            const newItemsPerPage = getItemsPerPage();
            if (newItemsPerPage !== itemsPerPage) {
                itemsPerPage = newItemsPerPage;
                totalPages = Math.ceil(skillCards.length / itemsPerPage);
                currentPage = 1; // Reset to first page on resize
                generatePaginationDots();
                showPage(currentPage);
            }
        }
        
        // Initialize
        generatePaginationDots();
        showPage(currentPage);
        
        // Event listeners
        prevBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                showPage(currentPage - 1);
            }
        });
        
        nextBtn.addEventListener('click', function() {
            if (currentPage < totalPages) {
                showPage(currentPage + 1);
            }
        });
        
        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 150);
        });
        
        // Touch swipe support for mobile devices
        const skillsWrapper = document.querySelector('.skills-grid-wrapper');
        if (skillsWrapper) {
            let touchStartX = 0;
            let touchStartY = 0;
            let touchEndX = 0;
            let isHorizontalSwipe = false;
            const swipeThreshold = 50;
            
            skillsWrapper.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
                isHorizontalSwipe = false;
            }, { passive: true });
            
            skillsWrapper.addEventListener('touchmove', function(e) {
                const currentX = e.changedTouches[0].screenX;
                const currentY = e.changedTouches[0].screenY;
                const diffX = Math.abs(currentX - touchStartX);
                const diffY = Math.abs(currentY - touchStartY);
                
                // If horizontal movement is greater, it's a swipe - prevent scroll
                if (diffX > diffY && diffX > 10) {
                    isHorizontalSwipe = true;
                    e.preventDefault();
                }
            }, { passive: false });
            
            skillsWrapper.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                
                if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0 && currentPage < totalPages) {
                        // Swipe left = next page
                        showPage(currentPage + 1);
                    } else if (diff < 0 && currentPage > 1) {
                        // Swipe right = previous page
                        showPage(currentPage - 1);
                    }
                }
            }, { passive: true });
        }
    } catch (error) {
        console.error('Error initializing skills pagination:', error);
    }
}

/* ============================================
   Blog Posts - Medium RSS Feed
   ============================================ */
const BlogModule = (function() {
    'use strict';
    
    let allBlogPosts = [];
    let resizeTimeout = null;
    
    // Helper to create an element with classes and text content
    function createElement(tag, classNames = [], textContent = '') {
        const el = document.createElement(tag);
        if (classNames.length) el.classList.add(...classNames);
        if (textContent) el.textContent = textContent;
        return el;
    }

    function getPostsToShow() {
        return window.innerWidth <= 768 ? 3 : 6;
    }
    
    function extractImageFromContent(content) {
        try {
            const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
            return imgMatch ? imgMatch[1] : null;
        } catch (error) {
            return null;
        }
    }
    
    function stripHtml(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    }
    
    function estimateReadTime(content) {
        const text = stripHtml(content);
        const wordsPerMinute = 200;
        const wordCount = text.split(/\s+/).length;
        return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    }
    
    function showError() {
        const blogGrid = document.getElementById('blogGrid');
        if (!blogGrid) return;
        
        blogGrid.innerHTML = ''; // Clear skeleton loaders
        const errorContainer = createElement('div', ['blog-error']);
        errorContainer.innerHTML = `
            <i class='bx bx-error-circle'></i>
            <p>Unable to load articles. Please visit my <a href="https://medium.com/@namantaneja167" target="_blank" rel="noopener noreferrer">Medium profile</a> directly.</p>
        `;
        blogGrid.appendChild(errorContainer);
    }
    
    function displayPosts() {
        const blogGrid = document.getElementById('blogGrid');
        if (!blogGrid || allBlogPosts.length === 0) return;
            
        blogGrid.innerHTML = ''; // Clear existing content (skeletons or previous posts)
        
        const postsToShow = getPostsToShow();
        const posts = allBlogPosts.slice(0, postsToShow);
        
        posts.forEach((post, index) => {
            const card = createElement('article', ['blog-card']);
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', (index * 100).toString());

            const link = createElement('a', ['blog-card-link']);
            link.href = post.link;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            // --- Thumbnail ---
            const thumbnailSrc = extractImageFromContent(post.content) || post.thumbnail || '';
            const thumbnailContainer = createElement('div', ['blog-thumbnail']);
            if (thumbnailSrc) {
                const img = createElement('img');
                img.src = thumbnailSrc;
                img.alt = post.title;
                img.loading = 'lazy';
                thumbnailContainer.appendChild(img);
            } else {
                thumbnailContainer.classList.add('blog-thumbnail-placeholder');
                thumbnailContainer.innerHTML = `<i class="bx bx-file-blank"></i>`;
            }
            link.appendChild(thumbnailContainer);

            // --- Content ---
            const cardContent = createElement('div', ['blog-card-content']);
            
            // Meta
            const meta = createElement('div', ['blog-meta']);
            const publishDate = new Date(post.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            const readTime = estimateReadTime(post.content);
            meta.innerHTML = `
                <span class="blog-date"><i class='bx bx-calendar'></i> ${publishDate}</span>
                <span class="blog-read-time"><i class='bx bx-time-five'></i> ${readTime} min read</span>
            `;
            cardContent.appendChild(meta);

            // Title
            const titleEl = createElement('h3', ['blog-title'], post.title);
            cardContent.appendChild(titleEl);

            // Excerpt
            const excerptText = stripHtml(post.description).substring(0, 120) + '...';
            const excerptEl = createElement('p', ['blog-excerpt'], excerptText);
            cardContent.appendChild(excerptEl);

            // Read More
            const readMore = createElement('span', ['blog-read-more']);
            readMore.innerHTML = `Read Article <i class='bx bx-right-arrow-alt'></i>`;
            cardContent.appendChild(readMore);

            link.appendChild(cardContent);
            card.appendChild(link);
            blogGrid.appendChild(card);
        });
        
        // Re-initialize AOS for the newly added elements
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }
    
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(displayPosts, 150);
    }
    
    function init() {
        const blogGrid = document.getElementById('blogGrid');
        if (!blogGrid) return;
        
        const MEDIUM_RSS_URL = 'https://medium.com/feed/@namantaneja167';
        const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';
        
        fetch(`${RSS2JSON_API}?rss_url=${encodeURIComponent(MEDIUM_RSS_URL)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'ok' && data.items && data.items.length > 0) {
                    allBlogPosts = data.items; // Keep more than 6 for responsive resizing
                    displayPosts();
                    window.addEventListener('resize', handleResize);
                } else {
                    console.error('API Error:', data.message || 'No items found');
                    showError();
                }
            })
            .catch(error => {
                console.error('Fetch Error:', error);
                showError();
            });
    }
    
    return {
        init: init
    };
})();

// Initialize blog module
function initBlogPosts() {
    BlogModule.init();
}

/* ============================================
   Back to Top Button
   ============================================ */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    const scrollThreshold = 400; // Show button after scrolling 400px
    
    // Show/hide button based on scroll position
    function toggleBackToTop() {
        if (window.scrollY > scrollThreshold) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
    
    // Throttled scroll handler for performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                toggleBackToTop();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Scroll to top on click
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    });
    
    // Initial check
    toggleBackToTop();
}

/* ============================================
   Copy Email to Clipboard
   ============================================ */
function initCopyEmail() {
    const copyButton = document.querySelector('.copy-email');
    
    if (!copyButton) return;
    
    copyButton.addEventListener('click', async function() {
        const email = this.getAttribute('data-email');
        const icon = this.querySelector('i');
        
        try {
            await navigator.clipboard.writeText(email);
            
            // Visual feedback
            this.classList.add('copied');
            icon.classList.remove('bx-copy');
            icon.classList.add('bx-check');
            
            // Haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            // Reset after 2 seconds
            setTimeout(() => {
                this.classList.remove('copied');
                icon.classList.remove('bx-check');
                icon.classList.add('bx-copy');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy email:', err);
            
            // Fallback for older browsers
            const tempInput = document.createElement('input');
            tempInput.value = email;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            // Still show success feedback
            this.classList.add('copied');
            icon.classList.remove('bx-copy');
            icon.classList.add('bx-check');
            
            setTimeout(() => {
                this.classList.remove('copied');
                icon.classList.remove('bx-check');
                icon.classList.add('bx-copy');
            }, 2000);
        }
    });
}

/* ============================================
   Theme Module (Dark/Light Mode)
   ============================================ */
function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const icon = themeToggle ? themeToggle.querySelector('i') : null;
    const html = document.documentElement;
    
    // Icons
    const MOON_ICON = 'bx-moon';
    const SUN_ICON = 'bx-sun';
    
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        html.setAttribute('data-theme', 'dark');
        if (icon) {
            icon.classList.remove(SUN_ICON);
            icon.classList.add(MOON_ICON);
        }
    }
    
    if (!themeToggle) return;
    
    // Handle toggle click
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update icon
        if (icon) {
            if (newTheme === 'dark') {
                icon.classList.remove(SUN_ICON);
                icon.classList.add(MOON_ICON);
            } else {
                icon.classList.remove(MOON_ICON);
                icon.classList.add(SUN_ICON);
            }
        }
        
        // Optional: Animate icon
        icon.style.transform = 'scale(0.5) rotate(90deg)';
        setTimeout(() => {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }, 200);
    });
}

/* ============================================
   AI Chat Widget Logic (Simulated Agent)
   ============================================ */
function initChatWidget() {
    const chatToggle = document.getElementById('chatToggle');
    const chatClose = document.getElementById('chatClose');
    const chatWindow = document.getElementById('chatWindow');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const chatBadge = chatToggle ? chatToggle.querySelector('.chat-badge') : null;

    if (!chatToggle || !chatWindow || !chatForm) return;

    // --- Knowledge Base ---
    const KNOWLEDGE_BASE = {
        greetings: {
            keywords: ['hi', 'hello', 'hey', 'greetings', 'who are you', 'what is this'],
            response: "Hello! I'm Naman's AI assistant. I can tell you about his expertise in **Data Engineering**, **Gen AI**, or his work at **Uniper** and **ZS Associates**. What would you like to know?"
        },
        skills: {
            keywords: [
                'skills', 'tech', 'stack', 'languages', 'tools', 'know', 
                'snowflake', 'python', 'sql', 'azure', 'dbt', 'adf', 'data factory', 
                'databricks', 'spark', 'pandas', 'dataiku', 'tableau', 'excel', 'git', 'jira', 'ci/cd'
            ],
            response: "Naman is a heavy-hitter in the modern data stack. His core skills include **Snowflake**, **Python**, **SQL**, **Azure**, and **dbt**. He's also specialized in **Databricks**, **Azure Data Factory**, and **Dataiku DSS**."
        },
        ai: {
            keywords: ['ai', 'gen ai', 'llm', 'rag', 'agent', 'langchain', 'crewai', 'ollama', 'gpt', 'bot'],
            response: "Naman is deeply involved in **Generative AI**. He builds **RAG (Retrieval-Augmented Generation)** systems and **AI Agents** using frameworks like **LangChain**, **CrewAI**, and **Ollama**. He even built me! 😉"
        },
        experience: {
            keywords: ['experience', 'work', 'job', 'uniper', 'zs', 'history', 'background', 'career', 'resume'],
            response: "He has 3+ years of experience. Currently, he's at **Uniper Energy** architecting trading data systems. Previously, he spent 2 years at **ZS Associates** managing healthcare data at a massive scale (1B+ records)."
        },
        projects: {
            keywords: ['projects', 'build', 'portfolio', 'architecture', 'case study', 'app'],
            response: "Some of his key works include an **Energy Market Data Hub**, a **Pharma KPI Automation** pipeline, and an **Enterprise RAG Knowledge Agent**. You can see the full details in the **Projects** section of this site!"
        },
        contact: {
            keywords: ['contact', 'email', 'hire', 'call', 'reach', 'linkedin', 'phone', 'message', 'meeting', 'schedule', 'book', 'sync'],
            response: "You can reach Naman directly at **er.namantaneja@gmail.com** or connect with him on **LinkedIn**. If you'd like to dive straight in, you can **[schedule a sync with him here](https://calendly.com/er-namantaneja/30min)**!"
        },
        default: {
            response: "I'm not quite sure about that yet. I'm trained to answer questions about Naman's **tech stack** (like Snowflake or Python), **projects**, and **work history**. Try asking 'What does he know about Gen AI?'"
        }
    };

    // --- UI Logic ---
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.add('active');
        if (chatBadge) chatBadge.style.display = 'none';
    });

    chatClose.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatInput.value = '';
        
        // Simulate thinking
        showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            const response = getResponse(message);
            addMessage(response, 'bot');
        }, 1000 + Math.random() * 1000); // Random delay 1-2s
    });

    // --- Helper Functions ---
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = text; // Using innerHTML to allow bolding from KB
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    function getResponse(input) {
        const lowerInput = input.toLowerCase();
        
        for (const key in KNOWLEDGE_BASE) {
            if (KNOWLEDGE_BASE[key].keywords) {
                const match = KNOWLEDGE_BASE[key].keywords.some(keyword => lowerInput.includes(keyword));
                if (match) return KNOWLEDGE_BASE[key].response;
            }
        }
        
        return KNOWLEDGE_BASE.default.response;
    }
}
