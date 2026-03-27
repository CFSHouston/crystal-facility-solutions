/* ============================================
   CRYSTAL FACILITY SOLUTIONS - NAVIGATION MODULE
   Navigation, Scroll, and Active State Management
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // DOM ELEMENTS
    // ============================================
    let nav = null;
    let navLinks = null;
    let sections = null;

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        nav = document.getElementById('nav');
        navLinks = document.querySelectorAll('.nav-links a');
        sections = document.querySelectorAll('section[id]');

        if (!nav) {
            console.warn('Navigation element not found in DOM');
            return;
        }

        // Bind global scroll function
        window.scrollToSection = scrollToSection;

        // Set up event listeners
        setupScrollListener();
        setupNavClickListeners();
    }

    // ============================================
    // SCROLL TO SECTION
    // ============================================
    function scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        return false;
    }

    // ============================================
    // SCROLL EVENT LISTENER
    // ============================================
    function setupScrollListener() {
        window.addEventListener('scroll', function() {
            updateNavOnScroll();
            highlightActiveSection();
        });
    }

    // ============================================
    // UPDATE NAV ON SCROLL
    // ============================================
    function updateNavOnScroll() {
        if (!nav) return;
        
        // Add/remove scrolled class for styling
        nav.classList.toggle('scrolled', window.scrollY > 50);
    }

    // ============================================
    // HIGHLIGHT ACTIVE SECTION
    // ============================================
    function highlightActiveSection() {
        if (!navLinks || !sections) return;

        let current = '';
        const scrollPos = window.scrollY + 200; // Offset for better detection

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === '#' + current);
        });
    }

    // ============================================
    // NAV CLICK LISTENERS
    // ============================================
    function setupNavClickListeners() {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Remove active from all links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Add active to clicked link
                this.classList.add('active');
                
                // Smooth scroll is handled by onclick attribute
            });
        });
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    document.addEventListener('DOMContentLoaded', init);

})();