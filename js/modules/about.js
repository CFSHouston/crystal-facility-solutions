
/* ============================================
   WHY CHOOSE CRYSTAL
   ============================================ */

(function() {
    'use strict';

    // Animated Counter
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }
        
        updateCounter();
    }

    // Animate Progress Bars
    function animateProgressBars() {
        const statCards = document.querySelectorAll('.stat-card');
        
        statCards.forEach(card => {
            const target = parseInt(card.dataset.target);
            const progressBar = card.querySelector('.stat-progress');
            const counter = card.querySelector('.counter');
            
            // Calculate percentage (max 100 for 99%, normalize others)
            let percentage;
            if (target === 99) {
                percentage = 99;
            } else if (target === 14) {
                percentage = 70; // 14 years out of 20
            } else if (target === 500) {
                percentage = 85; // 500 clients
            } else if (target === 50) {
                percentage = 75; // 50 staff
            }
            
            // Animate progress bar
            setTimeout(() => {
                progressBar.style.width = percentage + '%';
            }, 300);
            
            // Animate counter
            if (counter) {
                setTimeout(() => {
                    animateCounter(counter, target);
                }, 500);
            }
        });
    }

    // Intersection Observer for scroll animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animated class
                    entry.target.classList.add('animated');
                    
                    // If it's the stats container, trigger counter animations
                    if (entry.target.classList.contains('stats-container')) {
                        animateProgressBars();
                    }
                    
                    // Unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements
        document.querySelectorAll('.story-card, .stats-container, .excellence-card, .timeline-item').forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    // Timeline Interaction
    function initTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active from all
                timelineItems.forEach(i => i.classList.remove('active'));
                // Add active to clicked
                item.classList.add('active');
                
                // Optional: Show tooltip or additional info
                const year = item.dataset.year;
                console.log('Selected year:', year);
            });
            
            // Keyboard accessibility
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });
    }

    // Excellence Card Cert Badges Tooltip
    function initCertTooltips() {
        const certBadges = document.querySelectorAll('.cert-badge');
        
        certBadges.forEach(badge => {
            badge.addEventListener('mouseenter', (e) => {
                const title = badge.getAttribute('title');
                if (title) {
                    // Create tooltip
                    const tooltip = document.createElement('div');
                    tooltip.className = 'cert-tooltip';
                    tooltip.textContent = title;
                    tooltip.style.cssText = `
                        position: absolute;
                        bottom: 100%;
                        left: 50%;
                        transform: translateX(-50%) translateY(-8px);
                        background: #212529;
                        color: white;
                        padding: 0.5rem 1rem;
                        border-radius: 8px;
                        font-size: 0.8rem;
                        white-space: nowrap;
                        z-index: 100;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                    `;
                    
                    badge.style.position = 'relative';
                    badge.appendChild(tooltip);
                    
                    // Show tooltip
                    requestAnimationFrame(() => {
                        tooltip.style.opacity = '1';
                    });
                    
                    // Store reference
                    badge._tooltip = tooltip;
                }
            });
            
            badge.addEventListener('mouseleave', () => {
                if (badge._tooltip) {
                    badge._tooltip.remove();
                    badge._tooltip = null;
                }
            });
        });
    }

    // Parallax Effect on Scroll
    function initParallax() {
        const section = document.querySelector('.why-crystal-section');
        if (!section) return;
        
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const rate = scrolled * 0.05;
                    
                    // Subtle parallax on background
                    section.style.backgroundPosition = `center ${rate}px`;
                    
                    ticking = false;
                });
                
                ticking = true;
            }
        }, { passive: true });
    }

    // Initialize
    function init() {
        initScrollAnimations();
        initTimeline();
        initCertTooltips();
        initParallax();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();