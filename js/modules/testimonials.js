/* ============================================
   CRYSTAL FACILITY SOLUTIONS - TESTIMONIALS MODULE
   Modern Event Listeners, No Window Globals
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // STATE
    // ============================================
    let currentTestimonial = 0;
    let autoSlideInterval = null;
    let isPaused = false;
    let touchStartX = 0;
    let touchEndX = 0;

    // ============================================
    // DOM ELEMENTS
    // ============================================
    let testimonials = null;
    let dots = null;
    let slider = null;
    let totalTestimonials = 0;

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        testimonials = document.querySelectorAll('.testimonial');
        dots = document.querySelectorAll('.dot');
        slider = document.querySelector('.testimonial-slider');
        totalTestimonials = testimonials.length;

        if (totalTestimonials === 0) {
            console.warn('No testimonials found in DOM');
            return;
        }

        setupDotNavigation();
        setupHoverListeners();
        setupTouchSupport();
        setupKeyboardNav();
        setupVisibilityCheck();
        
        startAutoSlide();
    }

    // ============================================
    // DOT NAVIGATION (Event Delegation)
    // ============================================
    function setupDotNavigation() {
        const dotsContainer = document.querySelector('.dots');
        if (!dotsContainer) return;

        dotsContainer.addEventListener('click', function(e) {
            const dot = e.target.closest('.dot');
            if (!dot) return;

            const index = parseInt(dot.dataset.testimonial);
            if (!isNaN(index)) {
                showTestimonial(index);
            }
        });
    }

    // ============================================
    // SHOW TESTIMONIAL
    // ============================================
    function showTestimonial(index) {
        if (!testimonials || !dots) return;

        // Validate index (wrap around)
        if (index < 0) index = totalTestimonials - 1;
        if (index >= totalTestimonials) index = 0;

        // Remove active from all
        testimonials.forEach((t, i) => {
            t.classList.remove('active');
            t.hidden = true;
            if (dots[i]) {
                dots[i].classList.remove('active');
                dots[i].setAttribute('aria-selected', 'false');
                dots[i].setAttribute('tabindex', '-1');
            }
        });

        // Add active to current
        const current = testimonials[index];
        if (current) {
            current.classList.add('active');
            current.hidden = false;
            current.setAttribute('aria-live', 'polite');
        }
        
        if (dots[index]) {
            dots[index].classList.add('active');
            dots[index].setAttribute('aria-selected', 'true');
            dots[index].setAttribute('tabindex', '0');
        }

        currentTestimonial = index;
    }

    // ============================================
    // AUTO SLIDE
    // ============================================
    function startAutoSlide() {
        if (totalTestimonials <= 1) return;

        stopAutoSlide();

        autoSlideInterval = setInterval(() => {
            if (!isPaused) {
                currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
                showTestimonial(currentTestimonial);
            }
        }, 5000);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    function pauseAutoSlide() {
        isPaused = true;
    }

    function resumeAutoSlide() {
        isPaused = false;
    }

    // ============================================
    // HOVER/FOCUS LISTENERS
    // ============================================
    function setupHoverListeners() {
        if (!slider) return;

        slider.addEventListener('mouseenter', pauseAutoSlide);
        slider.addEventListener('mouseleave', resumeAutoSlide);
        
        slider.addEventListener('focusin', pauseAutoSlide);
        slider.addEventListener('focusout', (e) => {
            if (!slider.contains(e.relatedTarget)) {
                resumeAutoSlide();
            }
        });
    }

    // ============================================
    // TOUCH/SWIPE SUPPORT
    // ============================================
    function setupTouchSupport() {
        if (!slider) return;

        slider.addEventListener('touchstart', handleTouchStart, { passive: true });
        slider.addEventListener('touchend', handleTouchEnd, { passive: true });

        slider.addEventListener('touchstart', pauseAutoSlide, { passive: true });
        slider.addEventListener('touchend', resumeAutoSlide, { passive: true });
    }

    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
    }

    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next
                showTestimonial(currentTestimonial + 1);
            } else {
                // Swipe right - previous
                showTestimonial(currentTestimonial - 1);
            }
        }
    }

    // ============================================
    // KEYBOARD NAVIGATION
    // ============================================
    function setupKeyboardNav() {
        if (!slider) return;

        slider.setAttribute('tabindex', '0');
        slider.setAttribute('role', 'region');
        slider.setAttribute('aria-label', 'Testimonials');

        slider.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    showTestimonial(currentTestimonial - 1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    showTestimonial(currentTestimonial + 1);
                    break;
                case 'Home':
                    e.preventDefault();
                    showTestimonial(0);
                    break;
                case 'End':
                    e.preventDefault();
                    showTestimonial(totalTestimonials - 1);
                    break;
            }
        });
    }

    // ============================================
    // VISIBILITY API
    // ============================================
    function setupVisibilityCheck() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                pauseAutoSlide();
            } else {
                resumeAutoSlide();
            }
        });
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    document.addEventListener('DOMContentLoaded', init);

})();