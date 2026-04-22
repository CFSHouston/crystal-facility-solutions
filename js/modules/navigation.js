/* ============================================
   NAVIGATION MODULE - PRODUCTION READY
   Crystal Facility Solutions
   ============================================ */

(function() {
    'use strict';

    // ─── Configuration ──────────────────────────────────────────
    const CONFIG = {
        scrollOffset: 200,        // px offset for active section detection
        navScrollThreshold: 50,   // px scrolled before nav gets 'scrolled' class
        mobileTransitionDuration: 300, // ms, must match CSS transition
        scrollThrottleMs: 16      // ~60fps
    };

    // ─── Module State ───────────────────────────────────────────
    let state = {
        nav: null,
        navLinks: null,
        sections: null,
        mobileMenuBtn: null,
        mobileNav: null,
        mobileCloseTimeout: null,
        isInitialized: false
    };

    // Store bound handlers for cleanup
    const handlers = {};

    // ─── Initialization ─────────────────────────────────────────
    function init() {
        if (state.isInitialized) return;

        cacheElements();
        if (!state.nav) return;

        bindHandlers();
        attachListeners();

        state.isInitialized = true;
    }

    function cacheElements() {
        state.nav = document.getElementById('nav');
        state.navLinks = document.querySelectorAll('.nav-links a');
        state.sections = document.querySelectorAll('section[id]');
        state.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        state.mobileNav = document.getElementById('mobileNav');
    }

    // ─── Event Handler Binding (for cleanup) ────────────────────
    function bindHandlers() {
        handlers.onScroll = throttle(updateOnScroll, CONFIG.scrollThrottleMs);
        handlers.onDocumentClick = onDocumentClick;
        handlers.onEscapeKey = onEscapeKey;
        handlers.onSmoothScroll = onSmoothScroll;
        handlers.onNavLinkClick = onNavLinkClick;
        handlers.onMobileToggle = onMobileToggle;
    }

    function attachListeners() {
        window.addEventListener('scroll', handlers.onScroll, { passive: true });
        document.addEventListener('click', handlers.onDocumentClick);
        document.addEventListener('keydown', handlers.onEscapeKey);
        document.addEventListener('click', handlers.onSmoothScroll);

        state.navLinks.forEach(link => {
            link.addEventListener('click', handlers.onNavLinkClick);
        });

        if (state.mobileMenuBtn && state.mobileNav) {
            state.mobileMenuBtn.addEventListener('click', handlers.onMobileToggle);
        }
    }

    // ─── Scroll Handling ────────────────────────────────────────
    function updateOnScroll() {
        updateNavStyle();
        highlightActiveSection();
    }

    function updateNavStyle() {
        if (!state.nav) return;
        const shouldBeScrolled = window.scrollY > CONFIG.navScrollThreshold;
        state.nav.classList.toggle('scrolled', shouldBeScrolled);
    }

    function highlightActiveSection() {
        if (!state.navLinks || !state.sections) return;

        let currentId = '';
        const scrollPos = window.scrollY + CONFIG.scrollOffset;

        state.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentId = section.id;
            }
        });

        updateActiveLink(currentId);
    }

    // ─── Active Link Management ─────────────────────────────────
    function updateActiveLink(sectionId) {
        // Desktop links
        state.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === '#' + sectionId;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });

        // Mobile links
        if (state.mobileNav) {
            const mobileLinks = state.mobileNav.querySelectorAll('a');
            mobileLinks.forEach(link => {
                const href = link.getAttribute('href');
                link.classList.toggle('active', href === '#' + sectionId);
            });
        }
    }

    function onNavLinkClick(e) {
        // Visual feedback only — smooth scroll handled by delegated listener
        state.navLinks.forEach(l => {
            l.classList.remove('active');
            l.setAttribute('aria-current', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-current', 'page');
    }

    // ─── Smooth Scroll ──────────────────────────────────────────
    function onSmoothScroll(e) {
        const trigger = e.target.closest('[data-scroll]');
        if (!trigger) return;

        e.preventDefault();
        const targetId = trigger.dataset.scroll;
        const target = document.getElementById(targetId);

        if (target) {
            closeMobileMenu();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            updateActiveLink(targetId);
        }
    }

    // ─── Mobile Menu ────────────────────────────────────────────
    function onMobileToggle(e) {
        e.stopPropagation();
        toggleMobileMenu();
    }

    function toggleMobileMenu() {
        isMobileMenuOpen() ? closeMobileMenu() : openMobileMenu();
    }

    function openMobileMenu() {
        if (!state.mobileNav || !state.mobileMenuBtn) return;

        state.mobileNav.removeAttribute('hidden');
        state.mobileNav.offsetHeight; // Force reflow for transition
        state.mobileNav.classList.add('active');
        state.mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMobileMenu() {
        if (!state.mobileNav || !state.mobileMenuBtn) return;

        state.mobileNav.classList.remove('active');
        state.mobileMenuBtn.setAttribute('aria-expanded', 'false');

        // Clear any pending timeout
        if (state.mobileCloseTimeout) {
            clearTimeout(state.mobileCloseTimeout);
        }

        state.mobileCloseTimeout = setTimeout(() => {
            if (!state.mobileNav.classList.contains('active')) {
                state.mobileNav.setAttribute('hidden', '');
            }
        }, CONFIG.mobileTransitionDuration);
    }

    function isMobileMenuOpen() {
        return state.mobileNav && state.mobileNav.classList.contains('active');
    }

    function onDocumentClick(e) {
        if (!isMobileMenuOpen()) return;
        if (state.mobileMenuBtn && state.mobileMenuBtn.contains(e.target)) return;
        closeMobileMenu();
    }

    function onEscapeKey(e) {
        if (e.key === 'Escape' && isMobileMenuOpen()) {
            closeMobileMenu();
        }
    }

    // ─── Utility: Throttle ──────────────────────────────────────
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => { inThrottle = false; }, limit);
            }
        };
    }

    // ─── Cleanup / Destroy ──────────────────────────────────────
    // Available for manual cleanup if needed (e.g., dynamic page changes)
    function destroy() {
        if (!state.isInitialized) return;

        // Remove event listeners
        window.removeEventListener('scroll', handlers.onScroll);
        document.removeEventListener('click', handlers.onDocumentClick);
        document.removeEventListener('keydown', handlers.onEscapeKey);
        document.removeEventListener('click', handlers.onSmoothScroll);

        state.navLinks.forEach(link => {
            link.removeEventListener('click', handlers.onNavLinkClick);
        });

        if (state.mobileMenuBtn) {
            state.mobileMenuBtn.removeEventListener('click', handlers.onMobileToggle);
        }

        // Clear pending timeouts
        if (state.mobileCloseTimeout) {
            clearTimeout(state.mobileCloseTimeout);
            state.mobileCloseTimeout = null;
        }

        // Reset state
        state.isInitialized = false;
        state.nav = null;
        state.navLinks = null;
        state.sections = null;
        state.mobileMenuBtn = null;
        state.mobileNav = null;
    }

    // ─── Bootstrap ──────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }


})();