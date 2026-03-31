/* ============================================
   CRYSTAL FACILITY SOLUTIONS - MAIN JS
   Main Entry Point - No Window Globals
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // PRIVATE STATE
    // ============================================
    const state = {
        observers: [],
        isInitialized: false
    };

    // ============================================
    // UTILITY FUNCTIONS (Module Scope)
    // ============================================
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
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        formatPhoneNumber(phoneNumberString) {
            const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
            const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
            if (match) {
                return '(' + match[1] + ') ' + match[2] + '-' + match[3];
            }
            return phoneNumberString;
        }
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        if (state.isInitialized) return;
        
        initScrollAnimations();
        initSmoothScrollPolyfill();
        initPerformanceOptimizations();
        
        state.isInitialized = true;
        console.log('✅ Crystal Facility Solutions - All systems initialized');
    }

    // ============================================
    // SCROLL ANIMATIONS (REVEAL ON SCROLL)
    // ============================================
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

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
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
            
            revealObserver.observe(el);
        });

        state.observers.push(revealObserver);

        // Add CSS class for revealed state
        const style = document.createElement('style');
        style.textContent = `
            .revealed {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // SMOOTH SCROLL POLYFILL
    // ============================================
    function initSmoothScrollPolyfill() {
        if ('scrollBehavior' in document.documentElement.style) return;

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleSmoothScroll);
        });
    }

    function handleSmoothScroll(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // ============================================
    // PERFORMANCE OPTIMIZATIONS
    // ============================================
    function initPerformanceOptimizations() {
        initLazyLoading();
        initResourceHints();
    }

    function initLazyLoading() {
        if (!('IntersectionObserver' in window)) return;

        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
        state.observers.push(imageObserver);
    }

    function initResourceHints() {
        const forms = document.querySelectorAll('form[action*="salesforce"]');
        
        forms.forEach(form => {
            form.addEventListener('focusin', handlePreconnect, { once: true });
        });
    }

    function handlePreconnect() {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = 'https://webto.salesforce.com';
        document.head.appendChild(link);
    }

    // ============================================
    // ERROR HANDLING
    // ============================================
    function handleError(msg, url, lineNo, columnNo, error) {
        console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo);
        return false;
    }

    // ============================================
    // CLEANUP
    // ============================================
    function destroy() {
        // Disconnect all observers
        state.observers.forEach(observer => observer.disconnect());
        state.observers = [];

        // Remove event listeners
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.removeEventListener('click', handleSmoothScroll);
        });

        document.querySelectorAll('form[action*="salesforce"]').forEach(form => {
            form.removeEventListener('focusin', handlePreconnect);
        });

        window.removeEventListener('error', handleError);

        state.isInitialized = false;
    }

    // ============================================
    // EXPOSE MINIMAL API (No Window Globals)
    // ============================================
    const api = {
        init,
        destroy,
        utils: {
            debounce: utils.debounce,
            throttle: utils.throttle,
            formatPhoneNumber: utils.formatPhoneNumber
        }
    };

    // Register error handler
    window.addEventListener('error', handleError);

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose via CustomEvent
    document.dispatchEvent(new CustomEvent('main:api-ready', {
        detail: api,
        bubbles: true
    }));

})();