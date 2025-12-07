/* ============================================
   Naman Taneja - Portfolio Website JavaScript
   ============================================ */

// Initialize AOS (Animate on Scroll)
document.addEventListener('DOMContentLoaded', function() {
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
   Form Validation & Submission
   ============================================ */
function initFormValidation() {
    const form = document.querySelector('.contact-form');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        const name = form.querySelector('#name');
        const email = form.querySelector('#email');
        const message = form.querySelector('#message');
        
        let isValid = true;
        
        // Reset previous error states
        [name, email, message].forEach(field => {
            field.style.borderColor = '#e0e0e0';
        });
        
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
        
        if (!isValid) {
            e.preventDefault();
        }
    });
    
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
    const skillCards = document.querySelectorAll('.skill-card');
    const prevBtn = document.getElementById('prevSkills');
    const nextBtn = document.getElementById('nextSkills');
    const paginationDots = document.querySelectorAll('.pagination-dot');
    
    if (!skillCards.length || !prevBtn || !nextBtn) return;
    
    let currentPage = 1;
    const totalPages = 2;
    
    // Show initial page
    showPage(currentPage);
    
    function showPage(page) {
        // Hide all cards
        skillCards.forEach(card => {
            card.classList.remove('active');
        });
        
        // Show cards for current page
        skillCards.forEach(card => {
            if (parseInt(card.dataset.page) === page) {
                card.classList.add('active');
            }
        });
        
        // Update pagination dots
        paginationDots.forEach(dot => {
            dot.classList.remove('active');
            if (parseInt(dot.dataset.page) === page) {
                dot.classList.add('active');
            }
        });
        
        // Update button states
        prevBtn.disabled = page === 1;
        nextBtn.disabled = page === totalPages;
        
        currentPage = page;
    }
    
    // Previous button click
    prevBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            showPage(currentPage - 1);
        }
    });
    
    // Next button click
    nextBtn.addEventListener('click', function() {
        if (currentPage < totalPages) {
            showPage(currentPage + 1);
        }
    });
    
    // Pagination dot click
    paginationDots.forEach(dot => {
        dot.addEventListener('click', function() {
            const page = parseInt(this.dataset.page);
            showPage(page);
        });
    });
}

/* ============================================
   Console Easter Egg
   ============================================ */
console.log('%c👋 Hey there, curious developer!', 'font-size: 20px; font-weight: bold; color: #ff6b35;');
console.log('%cInterested in working together? Reach out at er.namantaneja@gmail.com', 'font-size: 14px; color: #666;');
console.log('%cOr connect on LinkedIn: linkedin.com/in/namantaneja167', 'font-size: 14px; color: #666;');
