/* ============================================
   CRYSTAL FACILITY SOLUTIONS - NAVIGATION MODULE
   Modern Event Listeners, No Window Globals
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // DOM ELEMENTS
    // ============================================
    let nav = null;
    let navLinks = null;
    let sections = null;
    let mobileMenuBtn = null;
    let mobileNav = null;

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        nav = document.getElementById('nav');
        navLinks = document.querySelectorAll('.nav-links a');
        sections = document.querySelectorAll('section[id]');
        mobileMenuBtn = document.getElementById('mobileMenuBtn');
        mobileNav = document.getElementById('mobileNav');

        if (!nav) {
            console.warn('Navigation element not found');
            return;
        }

        setupScrollListener();
        setupNavClickListeners();
        setupMobileMenu();
        setupSmoothScroll();
    }

    // ============================================
    // SMOOTH SCROLL (Event Delegation)
    // ============================================
    function setupSmoothScroll() {
        // Handle all data-scroll clicks
        document.addEventListener('click', function(e) {
            const scrollTrigger = e.target.closest('[data-scroll]');
            if (!scrollTrigger) return;

            e.preventDefault();
            const targetId = scrollTrigger.dataset.scroll;
            const target = document.getElementById(targetId);

            if (target) {
                // Close mobile menu if open
                closeMobileMenu();

                // Smooth scroll
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update active state
                updateActiveLink(targetId);
            }
        });
    }

    // ============================================
    // SCROLL EVENT LISTENER
    // ============================================
    function setupScrollListener() {
        let ticking = false;

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    updateNavOnScroll();
                    highlightActiveSection();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ============================================
    // UPDATE NAV ON SCROLL
    // ============================================
    function updateNavOnScroll() {
        if (!nav) return;
        
        const shouldBeScrolled = window.scrollY > 50;
        nav.classList.toggle('scrolled', shouldBeScrolled);
    }

    // ============================================
    // HIGHLIGHT ACTIVE SECTION
    // ============================================
    function highlightActiveSection() {
        if (!navLinks || !sections) return;

        let current = '';
        const scrollPos = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === '#' + current;
            link.classList.toggle('active', isActive);
            
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    // ============================================
    // UPDATE ACTIVE LINK (Manual)
    // ============================================
    function updateActiveLink(sectionId) {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === '#' + sectionId;
            
            link.classList.toggle('active', isActive);
            
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    // ============================================
    // NAV CLICK LISTENERS (Desktop)
    // ============================================
    function setupNavClickListeners() {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Update active state immediately
                navLinks.forEach(l => {
                    l.classList.remove('active');
                    l.removeAttribute('aria-current');
                });
                
                this.classList.add('active');
                this.setAttribute('aria-current', 'page');
            });
        });
    }

    // ============================================
    // MOBILE MENU
    // ============================================
    function setupMobileMenu() {
        if (!mobileMenuBtn || !mobileNav) return;

        // Toggle on button click
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);

        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMobileMenuOpen()) {
                closeMobileMenu();
            }
        });

        // Close on backdrop click
        mobileNav.addEventListener('click', function(e) {
            if (e.target === mobileNav) {
                closeMobileMenu();
            }
        });

        // Prevent body scroll when menu is open
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'hidden') {
                    const isHidden = mobileNav.hasAttribute('hidden');
                    document.body.style.overflow = isHidden ? '' : 'hidden';
                }
            });
        });

        observer.observe(mobileNav, { attributes: true });
    }

    function toggleMobileMenu() {
        if (!mobileNav || !mobileMenuBtn) return;

        const isHidden = mobileNav.hasAttribute('hidden');
        
        if (isHidden) {
            openMobileMenu();
        } else {
            closeMobileMenu();
        }
    }

    function openMobileMenu() {
        if (!mobileNav || !mobileMenuBtn) return;

        mobileNav.removeAttribute('hidden');
        mobileNav.classList.add('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        
        // Focus first link
        const firstLink = mobileNav.querySelector('a');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }

    function closeMobileMenu() {
        if (!mobileNav || !mobileMenuBtn) return;

        mobileNav.setAttribute('hidden', '');
        mobileNav.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        
        // Return focus to button
        mobileMenuBtn.focus();
    }

    function isMobileMenuOpen() {
        return mobileNav && !mobileNav.hasAttribute('hidden');
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    document.addEventListener('DOMContentLoaded', init);

})();