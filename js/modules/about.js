/* ============================================
   ABOUT - ENHANCED INTERACTIVE MODULE
   ============================================ */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        tiltMaxAngle: 10,
        tiltPerspective: 1000,
        particleCount: 20,
        counterDuration: 2000,
        magneticStrength: 0.3
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

        easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),

        random: (min, max) => Math.random() * (max - min) + min,

        isTouchDevice: () => window.matchMedia('(pointer: coarse)').matches
    };

    class AboutSectionModule {
        constructor() {
            this.isTouch = utils.isTouchDevice();
            this.animatedElements = new Set();
            this.init();
        }

        init() {
            this.cacheElements();
            this.createParticles();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            
            if (!this.isTouch) {
                this.setup3DTilt();
                this.setupMagneticElements();
            }
            
            this.initTimeline();
            this.initCertTooltips();
        }

        cacheElements() {
            this.section = document.querySelector('.why-crystal-section');
            this.storyCard = document.querySelector('.story-card');
            this.statCards = document.querySelectorAll('.stat-card');
            this.excellenceCard = document.querySelector('.excellence-card');
            this.timelineItems = document.querySelectorAll('.timeline-item');
            this.timelineProgress = document.querySelector('.timeline-progress');
            this.certBadges = document.querySelectorAll('.cert-badge');
        }

        // Create Floating Particles
        createParticles() {
            if (!this.section) return;
            
            const particlesContainer = document.createElement('div');
            particlesContainer.className = 'about-particles';
            
            for (let i = 0; i < CONFIG.particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'about-particle';
                
                const size = utils.random(4, 8);
                particle.style.cssText = `
                    width: ${size}px;
                    height: ${size}px;
                    left: ${utils.random(0, 100)}%;
                    top: ${utils.random(0, 100)}%;
                    animation-delay: ${utils.random(0, 15)}s;
                    animation-duration: ${utils.random(10, 20)}s;
                    opacity: ${utils.random(0.2, 0.5)};
                `;
                
                particlesContainer.appendChild(particle);
            }
            
            this.section.insertBefore(particlesContainer, this.section.firstChild);
        }

        // 3D Tilt Effect
        setup3DTilt() {
            const cards = [this.storyCard, this.excellenceCard, ...this.statCards];
            
            cards.forEach(card => {
                if (!card) return;
                
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
            
            card.style.transform = `
                perspective(${CONFIG.tiltPerspective}px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateY(-8px)
                scale(1.02)
            `;
        }

        resetTilt(card) {
            card.style.transform = '';
        }

        // Magnetic Elements
        setupMagneticElements() {
            const magneticElements = document.querySelectorAll('.cert-badge, .feature-item');
            
            magneticElements.forEach(el => {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    el.style.transform = `translate(${x * CONFIG.magneticStrength}px, ${y * CONFIG.magneticStrength}px)`;
                });

                el.addEventListener('mouseleave', () => {
                    el.style.transform = '';
                });
            });
        }

        // Intersection Observer for Scroll Animations
        setupIntersectionObserver() {
            const observerOptions = {
                threshold: 0.2,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                        this.animatedElements.add(entry.target);
                        
                        if (entry.target.classList.contains('stats-container')) {
                            this.animateCounters();
                        } else if (entry.target.classList.contains('timeline')) {
                            this.animateTimeline();
                        } else {
                            entry.target.classList.add('animated');
                            this.animateElement(entry.target);
                        }
                        
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Observe elements
            const elementsToObserve = [
                '.story-card',
                '.stats-container',
                '.excellence-card',
                '.timeline'
            ];

            elementsToObserve.forEach(selector => {
                const el = document.querySelector(selector);
                if (el) {
                    el.classList.add('animate-on-scroll');
                    observer.observe(el);
                }
            });
        }

        // Animate Individual Element
        animateElement(element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            
            requestAnimationFrame(() => {
                element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.opacity = '1';
                element.style.transform = '';
            });
        }

        // Animated Counters with Easing
        animateCounters() {
            this.statCards.forEach((card, index) => {
                const target = parseInt(card.dataset.target);
                const counter = card.querySelector('.counter');
                const progressBar = card.querySelector('.stat-progress');
                
                if (!counter) return;
                
                // Calculate percentage for progress bar
                let percentage;
                switch(target) {
                    case 99: percentage = 99; break;
                    case 14: percentage = 70; break;
                    case 500: percentage = 85; break;
                    case 50: percentage = 75; break;
                    default: percentage = 80;
                }
                
                // Animate progress bar
                setTimeout(() => {
                    if (progressBar) {
                        progressBar.style.width = percentage + '%';
                    }
                }, index * 200);
                
                // Animate counter with easing
                setTimeout(() => {
                    this.animateCounterValue(counter, target);
                }, index * 200 + 300);
            });
        }

        animateCounterValue(element, target) {
            const duration = CONFIG.counterDuration;
            const startTime = performance.now();
            const startValue = 0;
            
            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = utils.easeOutQuart(progress);
                const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);
                
                element.textContent = currentValue;
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                    this.pulseElement(element);
                }
            };
            
            requestAnimationFrame(updateCounter);
        }

        pulseElement(element) {
            element.style.transform = 'scale(1.2)';
            element.style.transition = 'transform 0.3s ease';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 300);
        }

        // Timeline Animation
        animateTimeline() {
            if (this.timelineProgress) {
                setTimeout(() => {
                    this.timelineProgress.style.width = '80%';
                }, 500);
            }
            
            this.timelineItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    
                    requestAnimationFrame(() => {
                        item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        item.style.opacity = '1';
                        item.style.transform = '';
                    });
                }, index * 200);
            });
        }

        // Timeline Interaction
        initTimeline() {
            this.timelineItems.forEach((item, index) => {
                // Add click handler
                item.addEventListener('click', () => {
                    this.timelineItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    
                    // Update progress
                    if (this.timelineProgress) {
                        const progress = ((index + 1) / this.timelineItems.length) * 100;
                        this.timelineProgress.style.width = progress + '%';
                    }
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
                
                // Add year to dot
                const dot = item.querySelector('.timeline-dot');
                const year = item.dataset.year;
                if (dot && year) {
                    dot.setAttribute('data-year', year);
                }
            });
            
            // Set last item as active by default
            if (this.timelineItems.length > 0) {
                this.timelineItems[this.timelineItems.length - 1].classList.add('active');
            }
        }

        // Certification Tooltips
        initCertTooltips() {
            this.certBadges.forEach(badge => {
                badge.addEventListener('mouseenter', (e) => {
                    const title = badge.getAttribute('title') || badge.getAttribute('aria-label');
                    if (title) {
                        this.showTooltip(badge, title);
                    }
                });
                
                badge.addEventListener('mouseleave', () => {
                    this.hideTooltip(badge);
                });
                
                badge.addEventListener('focus', (e) => {
                    const title = badge.getAttribute('title') || badge.getAttribute('aria-label');
                    if (title) {
                        this.showTooltip(badge, title);
                    }
                });
                
                badge.addEventListener('blur', () => {
                    this.hideTooltip(badge);
                });
            });
        }

        showTooltip(element, text) {
            let tooltip = element.querySelector('.cert-tooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'cert-tooltip';
                tooltip.textContent = text;
                tooltip.style.cssText = `
                    position: absolute;
                    bottom: calc(100% + 10px);
                    left: 50%;
                    transform: translateX(-50%) scale(0.8);
                    background: #212529;
                    color: white;
                    padding: 0.75rem 1rem;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    white-space: nowrap;
                    z-index: 100;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                `;
                
                // Add arrow
                const arrow = document.createElement('div');
                arrow.style.cssText = `
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 6px solid transparent;
                    border-top-color: #212529;
                `;
                tooltip.appendChild(arrow);
                
                element.style.position = 'relative';
                element.appendChild(tooltip);
                
                // Animate in
                requestAnimationFrame(() => {
                    tooltip.style.opacity = '1';
                    tooltip.style.transform = 'translateX(-50%) scale(1)';
                });
            }
        }

        hideTooltip(element) {
            const tooltip = element.querySelector('.cert-tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateX(-50%) scale(0.8)';
                setTimeout(() => tooltip.remove(), 300);
            }
        }

        // Event Listeners
        setupEventListeners() {
            // Parallax effect on scroll
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
            
            // Resize handler
            window.addEventListener('resize', utils.throttle(() => {
                this.handleResize();
            }, 250));
        }

        handleParallax() {
            if (!this.section) return;
            
            const scrolled = window.pageYOffset;
            const sectionTop = this.section.offsetTop;
            const sectionHeight = this.section.offsetHeight;
            
            if (scrolled > sectionTop - window.innerHeight && scrolled < sectionTop + sectionHeight) {
                const rate = (scrolled - sectionTop) * 0.05;
                this.section.style.backgroundPosition = `center ${rate}px`;
                
                // Parallax for particles
                const particles = this.section.querySelectorAll('.about-particle');
                particles.forEach((particle, index) => {
                    const speed = (index % 3 + 1) * 0.02;
                    particle.style.transform = `translateY(${rate * speed}px)`;
                });
            }
        }

        handleResize() {
            // Reset transforms on resize
            const cards = [this.storyCard, this.excellenceCard, ...this.statCards];
            cards.forEach(card => {
                if (card) card.style.transform = '';
            });
        }
    }

    // Initialize when DOM is ready
    function init() {
        if (document.querySelector('.why-crystal-section')) {
            new AboutSectionModule();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose to global scope
    window.AboutSectionModule = AboutSectionModule;
})();
