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
        initSkillCardsHover();
        initTimelineHover();
        initBlogPosts();
        initBackToTop();
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
    const counters = document.querySelectorAll('.stat-number');
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
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const updateHeader = () => {
        const scrollY = window.scrollY;
        
        // Add shadow on scroll
        if (scrollY > 50) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
        }
        
        // Hide/show header on scroll direction
        if (scrollY > 200) {
            if (scrollY > lastScrollY) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = scrollY;
        ticking = false;
    };
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
    
    // Add transition for smooth hide/show
    header.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
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
   Skill Cards Hover Effect
   ============================================ */
function initSkillCardsHover() {
    const skillCards = document.querySelectorAll('.skill-card');
    
    skillCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

/* ============================================
   Timeline Item Hover Effect
   ============================================ */
function initTimelineHover() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const marker = this.querySelector('.marker-dot');
            if (marker) {
                marker.style.transform = 'scale(1.5)';
                marker.style.backgroundColor = '#ff6b35';
                marker.style.borderColor = '#ff6b35';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const marker = this.querySelector('.marker-dot');
            if (marker && !marker.classList.contains('active')) {
                marker.style.transform = 'scale(1)';
                marker.style.backgroundColor = '#ffffff';
                marker.style.borderColor = '#e0e0e0';
            } else if (marker) {
                marker.style.transform = 'scale(1)';
            }
        });
    });
}

/* ============================================
   Parallax Effect for Hero Section (DISABLED)
   Caused visual issues with hero image sliding
   ============================================ */
// Parallax disabled - was causing hero image to move unexpectedly on scroll

/* ============================================
   Typed Effect for Hero Title (Optional)
   ============================================ */
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
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
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;
    
    if (!menuToggle || !nav) return;
    
    // Toggle menu on hamburger click
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.classList.toggle('active');
        body.classList.toggle('menu-open');
    });
    
    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            body.classList.remove('menu-open');
        });
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
    
    // Sanitize HTML to prevent XSS attacks
    function sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
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
        try {
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
        } catch (error) {
            return '';
        }
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
        
        blogGrid.innerHTML = `
            <div class="blog-error">
                <i class='bx bx-error-circle'></i>
                <p>Unable to load articles. Please visit my <a href="https://medium.com/@namantaneja167" target="_blank" rel="noopener noreferrer">Medium profile</a> directly.</p>
            </div>
        `;
    }
    
    function displayPosts() {
        try {
            const blogGrid = document.getElementById('blogGrid');
            if (!blogGrid || allBlogPosts.length === 0) return;
            
            blogGrid.innerHTML = '';
            
            const postsToShow = getPostsToShow();
            const posts = allBlogPosts.slice(0, postsToShow);
            
            posts.forEach((post, index) => {
                const thumbnail = extractImageFromContent(post.content) || post.thumbnail || '';
                const rawExcerpt = stripHtml(post.description).substring(0, 120);
                const excerpt = sanitizeHTML(rawExcerpt) + '...';
                const title = sanitizeHTML(post.title);
                const publishDate = new Date(post.pubDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                const readTime = estimateReadTime(post.content);
                const safeLink = encodeURI(post.link);
                
                const card = document.createElement('article');
                card.className = 'blog-card';
                card.setAttribute('data-aos', 'fade-up');
                card.setAttribute('data-aos-delay', (index * 100).toString());
                
                // Build thumbnail HTML safely
                let thumbnailHTML = '';
                if (thumbnail) {
                    const img = document.createElement('img');
                    img.src = thumbnail;
                    img.alt = title;
                    img.loading = 'lazy';
                    thumbnailHTML = `<div class="blog-thumbnail">${img.outerHTML}</div>`;
                } else {
                    thumbnailHTML = '<div class="blog-thumbnail blog-thumbnail-placeholder"><i class="bx bx-file-blank"></i></div>';
                }
                
                card.innerHTML = `
                    <a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="blog-card-link">
                        ${thumbnailHTML}
                        <div class="blog-card-content">
                            <div class="blog-meta">
                                <span class="blog-date"><i class='bx bx-calendar'></i> ${publishDate}</span>
                                <span class="blog-read-time"><i class='bx bx-time-five'></i> ${readTime} min read</span>
                            </div>
                            <h3 class="blog-title">${title}</h3>
                            <p class="blog-excerpt">${excerpt}</p>
                            <span class="blog-read-more">Read Article <i class='bx bx-right-arrow-alt'></i></span>
                        </div>
                    </a>
                `;
                
                blogGrid.appendChild(card);
            });
            
            // Re-init AOS for new elements
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        } catch (error) {
            console.error('Error displaying blog posts:', error);
            showError();
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
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'ok' && data.items && data.items.length > 0) {
                    allBlogPosts = data.items.slice(0, 6);
                    displayPosts();
                    window.addEventListener('resize', handleResize);
                } else {
                    showError();
                }
            })
            .catch(error => {
                console.error('Error fetching blog posts:', error);
                showError();
            });
    }
    
    // Public API
    return {
        init: init
    };
})();

// Initialize blog module
function initBlogPosts() {
    BlogModule.init();
}

/* ============================================
   Console Easter Egg
   ============================================ */
console.log('%c👋 Hey there, curious developer!', 'font-size: 20px; font-weight: bold; color: #ff6b35;');
console.log('%cInterested in working together? Reach out at er.namantaneja@gmail.com', 'font-size: 14px; color: #666;');
console.log('%cOr connect on LinkedIn: linkedin.com/in/namantaneja167', 'font-size: 14px; color: #666;');

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
