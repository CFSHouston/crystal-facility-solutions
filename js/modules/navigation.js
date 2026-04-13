/* ============================================
   CRYSTAL FACILITY SOLUTIONS - NAVIGATION MODULE
   Transparent Dropdown - Click Outside to Close
   ============================================ */

(function() {
    'use strict';

    let nav = null;
    let navLinks = null;
    let sections = null;
    let mobileMenuBtn = null;
    let mobileNav = null;

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

    function setupSmoothScroll() {
        document.addEventListener('click', function(e) {
            const scrollTrigger = e.target.closest('[data-scroll]');
            if (!scrollTrigger) return;

            e.preventDefault();
            const targetId = scrollTrigger.dataset.scroll;
            const target = document.getElementById(targetId);

            if (target) {
                closeMobileMenu();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                updateActiveLink(targetId);
            }
        });
    }

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

    function updateNavOnScroll() {
        if (!nav) return;
        const shouldBeScrolled = window.scrollY > 50;
        nav.classList.toggle('scrolled', shouldBeScrolled);
    }

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
        
        const mobileLinks = mobileNav.querySelectorAll('a');
        mobileLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === '#' + sectionId;
            link.classList.toggle('active', isActive);
        });
    }

    function setupNavClickListeners() {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                navLinks.forEach(l => {
                    l.classList.remove('active');
                    l.removeAttribute('aria-current');
                });
                this.classList.add('active');
                this.setAttribute('aria-current', 'page');
            });
        });
    }

    function setupMobileMenu() {
        if (!mobileMenuBtn || !mobileNav) return;

        // Toggle on hamburger click
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        });

        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMobileMenuOpen()) {
                closeMobileMenu();
            }
        });

        // Close when clicking ANYWHERE on the document
        // Because the mobile-nav container has pointer-events: none,
        // clicks on empty space will bubble up to document
        document.addEventListener('click', function(e) {
            if (!isMobileMenuOpen()) return;
            
            // If clicking the hamburger, toggle handles it
            if (mobileMenuBtn.contains(e.target)) return;
            
            // If clicking directly on a link or button inside mobile-nav,
            // the smooth scroll handler will close it
            // Otherwise (clicking empty space), close it
            closeMobileMenu();
        });
    }

    function toggleMobileMenu() {
        const isOpen = isMobileMenuOpen();
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        mobileNav.removeAttribute('hidden');
        mobileNav.offsetHeight; // Force reflow
        mobileNav.classList.add('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMobileMenu() {
        mobileNav.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        
        setTimeout(() => {
            if (!mobileNav.classList.contains('active')) {
                mobileNav.setAttribute('hidden', '');
            }
        }, 300);
    }

    function isMobileMenuOpen() {
        return mobileNav && mobileNav.classList.contains('active');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();