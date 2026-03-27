/* ============================================
   CRYSTAL FACILITY SOLUTIONS - MAIN JS
   Main Entry Point
   ============================================ */

/* ============================================
   GLOBAL SCROLL FUNCTION
   ============================================ */
window.scrollToSection = function(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
    return false;
};

/* ============================================
   SCROLL ANIMATIONS (REVEAL ON SCROLL)
   ============================================ */
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.service-card, .stat, .info-item');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        revealObserver.observe(el);
    });
}

/* ============================================
   INITIALIZE
   ============================================ */
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    console.log('✅ Crystal Facility Solutions - All systems initialized');
});