/* ============================================
   CRYSTAL FACILITY SOLUTIONS - TESTIMONIALS MODULE
   Testimonial Slider Functionality
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // STATE
    // ============================================
    let currentTestimonial = 0;
    let autoSlideInterval = null;

    // ============================================
    // DOM ELEMENTS
    // ============================================
    let testimonials = null;
    let dots = null;
    let totalTestimonials = 0;

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        testimonials = document.querySelectorAll('.testimonial');
        dots = document.querySelectorAll('.dot');
        totalTestimonials = testimonials.length;

        if (totalTestimonials === 0) {
            console.warn('No testimonials found in DOM');
            return;
        }

        // Bind global function
        window.showTestimonial = showTestimonial;

        // Start auto-slide
        startAutoSlide();

        // Pause on hover
        setupHoverListeners();
    }

    // ============================================
    // SHOW TESTIMONIAL
    // ============================================
    function showTestimonial(index) {
        if (!testimonials || !dots) return;

        // Validate index
        if (index < 0) index = totalTestimonials - 1;
        if (index >= totalTestimonials) index = 0;

        // Remove active from all
        testimonials.forEach((t, i) => {
            t.classList.remove('active');
            if (dots[i]) dots[i].classList.remove('active');
        });

        // Add active to current
        if (testimonials[index]) {
            testimonials[index].classList.add('active');
        }
        
        if (dots[index]) {
            dots[index].classList.add('active');
        }

        currentTestimonial = index;
    }

    // ============================================
    // AUTO SLIDE
    // ============================================
    function startAutoSlide() {
        if (totalTestimonials <= 1) return;

        autoSlideInterval = setInterval(() => {
            currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
            showTestimonial(currentTestimonial);
        }, 5000);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    // ============================================
    // HOVER LISTENERS
    // ============================================
    function setupHoverListeners() {
        const slider = document.querySelector('.testimonial-slider');
        if (!slider) return;

        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    document.addEventListener('DOMContentLoaded', init);

})();