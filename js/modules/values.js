
/* ============================================
   CORE VALUES - ENHANCED INTERACTIVE MODULE
   ============================================ */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        tiltMaxAngle: 15,
        tiltPerspective: 1000,
        particleCount: 12,
        magneticStrength: 0.3,
        animationDuration: 500
    };

    // Utility Functions
    const utils = {
        // Throttle function for performance
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

        // Linear interpolation
        lerp: (start, end, factor) => start + (end - start) * factor,

        // Random range
        random: (min, max) => Math.random() * (max - min) + min,

        // Check if touch device
        isTouchDevice: () => window.matchMedia('(pointer: coarse)').matches
    };

    class CoreValuesModule {
        constructor() {
            this.cards = [];
            this.activeCard = null;
            this.isTouch = utils.isTouchDevice();
            this.init();
        }

        init() {
            this.cacheElements();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            this.setupProgressIndicator();
            
            if (!this.isTouch) {
                this.setup3DTilt();
                this.setupMagneticButtons();
            }
            
            this.animateEntry();
        }

        cacheElements() {
            this.container = document.querySelector('.values-container');
            this.cards = document.querySelectorAll('.value-card');
            this.toggles = document.querySelectorAll('.value-toggle');
        }

        setupEventListeners() {
            // Card click handlers
            this.cards.forEach((card, index) => {
                card.addEventListener('click', (e) => this.handleCardClick(e, card, index));
                
                // Keyboard accessibility
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleCardClick(e, card, index);
                    }
                });

                // Make card focusable
                card.setAttribute('tabindex', '0');
                card.setAttribute('role', 'button');
                card.setAttribute('aria-expanded', 'false');
            });

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeAllCards();
                }
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.value-card')) {
                    this.closeAllCards();
                }
            });

            // Handle window resize
            window.addEventListener('resize', utils.throttle(() => {
                this.handleResize();
            }, 250));
        }

        handleCardClick(e, card, index) {
            // Don't toggle if clicking on a link inside expanded content
            if (e.target.tagName === 'A') return;
            
            const isActive = card.classList.contains('active');
            
            // Close all other cards first
            this.closeAllCards();
            
            // Toggle current card
            if (!isActive) {
                this.openCard(card, index);
                
                // Trigger particle burst
                if (!this.isTouch) {
                    this.createParticleBurst(card);
                }
            }
        }

        openCard(card, index) {
            card.classList.add('active');
            card.setAttribute('aria-expanded', 'true');
            this.activeCard = card;
            
            // Update progress indicator
            this.updateProgressIndicator(index);
            
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

            // Announce to screen readers
            this.announceToScreenReader(`Expanded ${card.querySelector('h3').textContent}`);
        }

        closeAllCards() {
            this.cards.forEach(c => {
                c.classList.remove('active');
                c.setAttribute('aria-expanded', 'false');
            });
            this.activeCard = null;
            this.updateProgressIndicator(-1);
        }

        // 3D Tilt Effect
        setup3DTilt() {
            this.cards.forEach(card => {
                card.addEventListener('mousemove', utils.throttle((e) => {
                    if (card.classList.contains('active')) return;
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
            
            card.style.transform = `
                perspective(${CONFIG.tiltPerspective}px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateY(-12px)
                scale(1.02)
            `;
        }

        resetTilt(card) {
            card.style.transform = '';
        }

        // Magnetic Button Effect
        setupMagneticButtons() {
            this.toggles.forEach(toggle => {
                toggle.addEventListener('mousemove', (e) => {
                    const rect = toggle.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    toggle.style.transform = `translate(${x * CONFIG.magneticStrength}px, ${y * CONFIG.magneticStrength}px)`;
                });

                toggle.addEventListener('mouseleave', () => {
                    toggle.style.transform = '';
                });
            });
        }

        // Particle Burst Effect
        createParticleBurst(card) {
            const rect = card.getBoundingClientRect();
            const particles = [];
            
            for (let i = 0; i < CONFIG.particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.cssText = `
                    position: fixed;
                    width: ${utils.random(6, 12)}px;
                    height: ${utils.random(6, 12)}px;
                    background: ${i % 2 === 0 ? 'var(--cfs-green, #7cb342)' : 'var(--cfs-light-green, #9ccc65)'};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999;
                    left: ${rect.left + rect.width / 2}px;
                    top: ${rect.top + rect.height / 2}px;
                `;
                
                document.body.appendChild(particle);
                particles.push({
                    element: particle,
                    vx: utils.random(-8, 8),
                    vy: utils.random(-8, 8),
                    life: 1
                });
            }

            // Animate particles
            const animateParticles = () => {
                let activeParticles = 0;
                
                particles.forEach(p => {
                    if (p.life > 0) {
                        const currentLeft = parseFloat(p.element.style.left);
                        const currentTop = parseFloat(p.element.style.top);
                        
                        p.element.style.left = `${currentLeft + p.vx}px`;
                        p.element.style.top = `${currentTop + p.vy}px`;
                        p.element.style.opacity = p.life;
                        p.element.style.transform = `scale(${p.life})`;
                        
                        p.vx *= 0.98;
                        p.vy *= 0.98;
                        p.life -= 0.02;
                        activeParticles++;
                    } else {
                        p.element.remove();
                    }
                });

                if (activeParticles > 0) {
                    requestAnimationFrame(animateParticles);
                }
            };

            requestAnimationFrame(animateParticles);
        }

        // Progress Indicator
        setupProgressIndicator() {
            // Create progress dots if they don't exist
            if (!document.querySelector('.values-progress')) {
                const progress = document.createElement('div');
                progress.className = 'values-progress';
                
                this.cards.forEach((_, index) => {
                    const dot = document.createElement('button');
                    dot.className = 'progress-dot';
                    dot.setAttribute('aria-label', `Go to value ${index + 1}`);
                    dot.addEventListener('click', () => {
                        this.cards[index].scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                        this.cards[index].focus();
                    });
                    progress.appendChild(dot);
                });
                
                this.container.after(progress);
            }
        }

        updateProgressIndicator(activeIndex) {
            const dots = document.querySelectorAll('.progress-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeIndex);
            });
        }

        // Intersection Observer for Scroll Animations
        setupIntersectionObserver() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        entry.target.style.animationPlayState = 'running';
                        
                        // Staggered animation for child elements
                        const children = entry.target.querySelectorAll('.value-icon, .value-content');
                        children.forEach((child, i) => {
                            child.style.animationDelay = `${i * 0.1}s`;
                            child.classList.add('animate-in');
                        });
                    }
                });
            }, observerOptions);

            this.cards.forEach(card => {
                card.style.animationPlayState = 'paused';
                observer.observe(card);
            });
        }

        // Entry Animation
        animateEntry() {
            this.cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(50px)';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '1';
                    card.style.transform = '';
                }, index * 100);
            });
        }

        // Handle Resize
        handleResize() {
            // Reset any transforms on resize
            this.cards.forEach(card => {
                card.style.transform = '';
            });
            
            // Close expanded cards on mobile breakpoint
            if (window.innerWidth < 768 && this.activeCard) {
                this.closeAllCards();
            }
        }

        // Accessibility Announcements
        announceToScreenReader(message) {
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.style.cssText = `
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            `;
            announcement.textContent = message;
            
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        }
    }

    // Initialize when DOM is ready
    function init() {
        if (document.querySelector('.values-container')) {
            new CoreValuesModule();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose to global scope for debugging
    window.CoreValuesModule = CoreValuesModule;
})();