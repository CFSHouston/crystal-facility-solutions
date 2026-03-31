/* ============================================
   CORE VALUES - INTERACTIVE MODULE
   ============================================ */

(function() {
    'use strict';

    function init() {
        const valueCards = document.querySelectorAll('.value-card');
        
        valueCards.forEach(card => {
            const toggle = card.querySelector('.value-toggle');
            
            // Click on card to expand
            card.addEventListener('click', (e) => {
                // Don't toggle if clicking on a link inside expanded content
                if (e.target.tagName === 'A') return;
                
                const isActive = card.classList.contains('active');
                
                // Close all other cards
                valueCards.forEach(c => {
                    c.classList.remove('active');
                    c.querySelector('.value-toggle').setAttribute('aria-expanded', 'false');
                });
                
                // Toggle current card
                if (!isActive) {
                    card.classList.add('active');
                    toggle.setAttribute('aria-expanded', 'true');
                    
                    // Smooth scroll to card on mobile
                    if (window.innerWidth < 768) {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            });
            
            // Keyboard accessibility
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
            
            // Make card focusable
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                valueCards.forEach(c => {
                    c.classList.remove('active');
                    c.querySelector('.value-toggle').setAttribute('aria-expanded', 'false');
                });
            }
        });
        
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, { threshold: 0.1 });
        
        valueCards.forEach(card => observer.observe(card));
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();