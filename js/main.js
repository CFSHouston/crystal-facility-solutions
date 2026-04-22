/* ============================================
   MAIN MODULE - PRODUCTION READY
   Crystal Facility Solutions
   ============================================ */

(function() {
    'use strict';

    // ─── Module State ───────────────────────────────────────────
    const state = {
        isInitialized: false,
        observers: [],
        boundHandlers: {}
    };

    // ─── Utilities ──────────────────────────────────────────────
    const utils = {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => { inThrottle = false; }, limit);
                }
            };
        }
    };

    // ─── Initialization ─────────────────────────────────────────
    function init() {
        if (state.isInitialized) return;

        initScrollAnimations();
        initSmoothScrollPolyfill();
        initLazyLoading();
        initResourceHints();

        state.isInitialized = true;
    }

    // ─── Scroll Animations ──────────────────────────────────────
    function initScrollAnimations() {
        const revealElements = document.querySelectorAll(
            '.service-card, .stat, .info-item, .section-title, .about-text, .visual-box'
        );

        if (!('IntersectionObserver' in window)) {
            revealElements.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        state.observers.push(observer);

        // Add CSS for revealed state
        if (!document.getElementById('main-reveal-styles')) {
            const style = document.createElement('style');
            style.id = 'main-reveal-styles';
            style.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
            document.head.appendChild(style);
        }
    }

    // ─── Smooth Scroll Polyfill ─────────────────────────────────
    function initSmoothScrollPolyfill() {
        if ('scrollBehavior' in document.documentElement.style) return;

        const anchors = document.querySelectorAll('a[href^="#"]');
        const handlers = [];

        anchors.forEach(anchor => {
            const onClick = (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            };
            anchor.addEventListener('click', onClick);
            handlers.push({ anchor, onClick });
        });

        state.boundHandlers.smoothScroll = handlers;
    }

    // ─── Lazy Loading ───────────────────────────────────────────
    function initLazyLoading() {
        if (!('IntersectionObserver' in window)) return;

        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        if (!lazyImages.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    observer.unobserve(entry.target);
                }
            });
        });

        lazyImages.forEach(img => observer.observe(img));
        state.observers.push(observer);
    }

    // ─── Resource Hints ─────────────────────────────────────────
    function initResourceHints() {
        const forms = document.querySelectorAll('form[action*="salesforce"]');
        if (!forms.length) return;

        const handlers = [];
        forms.forEach(form => {
            const onFocus = () => {
                if (!document.querySelector('link[href="https://webto.salesforce.com"]')) {
                    const link = document.createElement('link');
                    link.rel = 'preconnect';
                    link.href = 'https://webto.salesforce.com';
                    document.head.appendChild(link);
                }
            };
            form.addEventListener('focusin', onFocus, { once: true });
            handlers.push({ form, onFocus });
        });

        state.boundHandlers.resourceHints = handlers;
    }

    // ─── Error Handling ─────────────────────────────────────────
    function handleError(msg, url, lineNo, columnNo, error) {
        // Silent error handling in production
        // Log to analytics service if available
        return false;
    }

    // ─── Cleanup / Destroy ──────────────────────────────────────
    function destroy() {
        if (!state.isInitialized) return;

        // Disconnect observers
        state.observers.forEach(observer => observer.disconnect());
        state.observers = [];

        // Remove smooth scroll listeners
        if (state.boundHandlers.smoothScroll) {
            state.boundHandlers.smoothScroll.forEach(h => {
                h.anchor.removeEventListener('click', h.onClick);
            });
        }

        // Remove resource hint listeners
        if (state.boundHandlers.resourceHints) {
            state.boundHandlers.resourceHints.forEach(h => {
                h.form.removeEventListener('focusin', h.onFocus);
            });
        }

        // Remove error handler
        window.removeEventListener('error', handleError);

        state.boundHandlers = {};
        state.isInitialized = false;
    }

    // ─── Bootstrap ──────────────────────────────────────────────
    window.addEventListener('error', handleError);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();