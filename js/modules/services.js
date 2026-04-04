
/* ============================================
   SERVICES - ENHANCED INTERACTIVE MODULE 
   ============================================ */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        tiltMaxAngle: 12,
        tiltPerspective: 1000,
        particleCount: 15,
        magneticStrength: 0.25,
        animationDuration: 600
    };

    // Utility Functions
    const utils = {
        throttle: (func, limit) => {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        lerp: (start, end, factor) => start + (end - start) * factor,

        random: (min, max) => Math.random() * (max - min) + min,

        isTouchDevice: () => window.matchMedia('(pointer: coarse)').matches
    };

    class ServicesModule {
        constructor() {
            this.isTouch = utils.isTouchDevice();
            this.cards = [];
            this.init();
        }

        init() {
            this.cacheElements();
            this.createParticles();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            
            if (!this.isTouch) {
                this.setup3DTilt();
                this.setupMagneticButtons();
            }
            
            this.animateEntry();
        }

        cacheElements() {
            this.section = document.querySelector('.services-section');
            this.cards = document.querySelectorAll('.service-card');
            this.grid = document.querySelector('.services-grid');
        }

        // Create Floating Particles
        createParticles() {
            if (!this.section) return;
            
            const particlesContainer = document.createElement('div');
            particlesContainer.className = 'services-particles';
            
            for (let i = 0; i < CONFIG.particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'service-particle';
                
                const size = utils.random(6, 12);
                particle.style.cssText = `
                    width: ${size}px;
                    height: ${size}px;
                    left: ${utils.random(0, 100)}%;
                    top: ${utils.random(0, 100)}%;
                    animation-delay: ${utils.random(0, 20)}s;
                    animation-duration: ${utils.random(15, 25)}s;
                `;
                
                particlesContainer.appendChild(particle);
            }
            
            this.section.insertBefore(particlesContainer, this.section.firstChild);
        }

        // 3D Tilt Effect
        setup3DTilt() {
            this.cards.forEach(card => {
                card.addEventListener('mousemove', utils.throttle((e) => {
                    this.handleTilt(e, card);
                }, 16));

                card.addEventListener('mouseleave', () => {
                    this.resetTilt(card);
                });
            });
        }

        handleTilt(e, card) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -CONFIG.tiltMaxAngle;
            const rotateY = ((x - centerX) / centerX) * CONFIG.tiltMaxAngle;
            
            // Add glow effect position
            const glowX = (x / rect.width) * 100;
            const glowY = (y / rect.height) * 100;
            
            card.style.transform = `
                perspective(${CONFIG.tiltPerspective}px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateY(-16px)
                scale(1.02)
            `;
            
            // Update gradient glow position
            card.style.setProperty('--glow-x', `${glowX}%`);
            card.style.setProperty('--glow-y', `${glowY}%`);
        }

        resetTilt(card) {
            card.style.transform = '';
        }

        // Magnetic Buttons
        setupMagneticButtons() {
            const buttons = document.querySelectorAll('.service-action, .click-hint');
            
            buttons.forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    btn.style.transform = `translate(${x * CONFIG.magneticStrength}px, ${y * CONFIG.magneticStrength}px)`;
                });

                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = '';
                });
            });
        }

        // Event Listeners
        setupEventListeners() {
            // Card click handlers
            this.cards.forEach(card => {
                card.addEventListener('click', (e) => {
                    // Handle modal trigger
                    const modalTrigger = card.querySelector('[data-modal]');
                    if (modalTrigger && !e.target.closest('.service-action')) {
                        // Let the modal.js handle this
                        return;
                    }
                    
                    // Toggle expanded state
                    if (e.target.closest('.service-action')) {
                        e.preventDefault();
                        this.toggleCardExpansion(card);
                    }
                });

                // Keyboard accessibility
                card.setAttribute('tabindex', '0');
                card.setAttribute('role', 'article');
                
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        card.click();
                    }
                });
            });

            // Parallax on scroll
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        this.handleParallax();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }

        toggleCardExpansion(card) {
            const isExpanded = card.classList.contains('expanded');
            
            // Close all other cards
            this.cards.forEach(c => c.classList.remove('expanded'));
            
            // Toggle current
            if (!isExpanded) {
                card.classList.add('expanded');
                
                // Smooth scroll to card on mobile
                if (window.innerWidth < 768) {
                    setTimeout(() => {
                        card.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center',
                            inline: 'nearest'
                        });
                    }, 100);
                }
            }
        }

        // Intersection Observer
        setupIntersectionObserver() {
            const observerOptions = {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        this.animateCard(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            this.cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(60px)';
                card.style.transitionDelay = `${index * 0.1}s`;
                observer.observe(card);
            });
        }

        animateCard(card) {
            requestAnimationFrame(() => {
                card.style.transition = `all ${CONFIG.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                card.style.opacity = '1';
                card.style.transform = '';
            });
        }

        // Entry Animation
        animateEntry() {
            this.cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(60px) rotateX(10deg)';
                
                setTimeout(() => {
                    card.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1)`;
                    card.style.opacity = '1';
                    card.style.transform = '';
                }, index * 150);
            });
        }

        // Parallax Effect
        handleParallax() {
            if (!this.section) return;
            
            const scrolled = window.pageYOffset;
            const sectionTop = this.section.offsetTop;
            const sectionHeight = this.section.offsetHeight;
            
            if (scrolled > sectionTop - window.innerHeight && scrolled < sectionTop + sectionHeight) {
                const rate = (scrolled - sectionTop) * 0.03;
                
                // Parallax for particles
                const particles = this.section.querySelectorAll('.service-particle');
                particles.forEach((particle, index) => {
                    const speed = (index % 3 + 1) * 0.02;
                    particle.style.transform = `translateY(${rate * speed}px)`;
                });
                
                // Subtle parallax for cards
                this.cards.forEach((card, index) => {
                    const cardRate = rate * (0.01 * (index % 2 === 0 ? 1 : -1));
                    if (!card.matches(':hover')) {
                        card.style.transform = `translateY(${cardRate}px)`;
                    }
                });
            }
        }
    }

    // Initialize when DOM is ready
    function init() {
        if (document.querySelector('.services-section')) {
            new ServicesModule();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose to global scope
    window.ServicesModule = ServicesModule;
})();
