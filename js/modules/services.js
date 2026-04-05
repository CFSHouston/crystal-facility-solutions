/* ============================================
   SERVICES MODULE
   ============================================ */

(function() {
    'use strict';

    const CONFIG = {
        tiltMaxAngle: 8,
        tiltPerspective: 1000,
        particleCount: 30,
        animationDuration: 600,
        staggerDelay: 100,
        flipCooldown: 350  // ms between flips
    };

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

        debounce: (func, wait) => {
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

        isTouchDevice: () => window.matchMedia('(pointer: coarse)').matches,

        prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    // Particle System
    class ParticleSystem {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.animationId = null;
            this.isActive = true;
            this.init();
        }

        init() {
            this.resize();
            this.createParticles();
            this.animate();
            window.addEventListener('resize', utils.debounce(() => this.resize(), 250));
            document.addEventListener('visibilitychange', () => {
                this.isActive = document.visibilityState === 'visible';
                if (this.isActive) this.animate();
            });
        }

        resize() {
            const parent = this.canvas.parentElement;
            this.canvas.width = parent.offsetWidth;
            this.canvas.height = parent.offsetHeight;
        }

        createParticles() {
            this.particles = [];
            for (let i = 0; i < CONFIG.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: Math.random() * 4 + 2,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    opacity: Math.random() * 0.4 + 0.1,
                    color: Math.random() > 0.5 ? '124, 179, 66' : '156, 204, 101'
                });
            }
        }

        animate() {
            if (!this.isActive) {
                cancelAnimationFrame(this.animationId);
                return;
            }

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                if (particle.x < 0) particle.x = this.canvas.width;
                if (particle.x > this.canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = this.canvas.height;
                if (particle.y > this.canvas.height) particle.y = 0;

                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity})`;
                this.ctx.fill();

                this.particles.forEach(other => {
                    const dx = particle.x - other.x;
                    const dy = particle.y - other.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(particle.x, particle.y);
                        this.ctx.lineTo(other.x, other.y);
                        this.ctx.strokeStyle = `rgba(124, 179, 66, ${0.1 * (1 - distance / 100)})`;
                        this.ctx.stroke();
                    }
                });
            });

            this.animationId = requestAnimationFrame(() => this.animate());
        }

        destroy() {
            this.isActive = false;
            cancelAnimationFrame(this.animationId);
        }
    }

    // Main Services Module
    class ServicesTheater {
        constructor() {
            this.isTouch = utils.isTouchDevice();
            this.prefersReducedMotion = utils.prefersReducedMotion();
            this.cards = [];
            this.currentFilter = 'all';
            this.drawer = null;
            this.currentStep = 1;
            this.totalSteps = 3;
            this.selectedService = null;
            this.flipCooldown = false;  // Prevent multiple flips
            this.lastFlipTime = 0;

            this.init();
        }

        init() {
            this.cacheElements();
            this.setupParticles();
            this.setupEventListeners();
            this.setupIntersectionObserver();

            if (!this.isTouch && !this.prefersReducedMotion) {
                this.setup3DTilt();
            }

            this.animateEntry();
        }

        cacheElements() {
            this.section = document.querySelector('.services-theater');
            this.cards = document.querySelectorAll('.service-card-3d');
            this.filters = document.querySelectorAll('.filter-btn');
            this.stage = document.querySelector('.stage-perspective');
            this.drawer = document.getElementById('quickQuoteDrawer');
            this.drawerServiceName = document.getElementById('drawerServiceName');
            this.serviceSelect = document.getElementById('quoteServiceType');
            this.propertySizeGroup = document.getElementById('propertySizeGroup');
            this.transportationFields = document.getElementById('transportationFields');
            this.bundleFields = document.getElementById('bundleFields');
            this.bundlePropertySize = document.getElementById('bundlePropertySize');
        }

        setupParticles() {
            const canvas = document.getElementById('servicesParticleCanvas');
            if (canvas && !this.prefersReducedMotion) {
                this.particleSystem = new ParticleSystem(canvas);
            }
        }

        setup3DTilt() {
            this.cards.forEach(card => {
                const inner = card.querySelector('.card-3d-inner');

                card.addEventListener('mousemove', utils.throttle((e) => {
                    if (card.classList.contains('flipped')) return;
                    this.handleTilt(e, card, inner);
                }, 16));

                card.addEventListener('mouseleave', () => {
                    if (card.classList.contains('flipped')) return;
                    this.resetTilt(card, inner);
                });
            });
        }

        handleTilt(e, card, inner) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -CONFIG.tiltMaxAngle;
            const rotateY = ((x - centerX) / centerX) * CONFIG.tiltMaxAngle;

            // Only apply tilt if not flipped
            if (!card.classList.contains('flipped')) {
                inner.style.transform = `
                    perspective(${CONFIG.tiltPerspective}px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    translateZ(20px)
                `;
            }
        }

        resetTilt(card, inner) {
            if (!card.classList.contains('flipped')) {
                inner.style.transform = '';
            }
        }

        setupEventListeners() {
            // Card click - flip to show details (FIXED: immediate response with cooldown)
            this.cards.forEach(card => {
                card.addEventListener('click', (e) => {
                    // Don't flip if clicking buttons on the back
                    if (e.target.closest('.btn-quick-quote') || 
                        e.target.closest('.btn-learn-more') || 
                        e.target.closest('.btn-close-back')) {
                        return;
                    }

                    // Check cooldown to prevent rapid clicking issues
                    const now = Date.now();
                    if (this.flipCooldown || (now - this.lastFlipTime < CONFIG.flipCooldown)) {
                        return;
                    }

                    this.handleCardClick(e, card);
                    this.lastFlipTime = now;
                });

                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleCardClick(e, card);
                    }
                });
            });

            // Filter buttons
            this.filters.forEach(btn => {
                btn.addEventListener('click', () => this.handleFilter(btn));
            });

            // Quick quote buttons on cards - FIXED with capture phase
            document.querySelectorAll('.btn-quick-quote').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    const service = btn.dataset.service;
                    if (service) {
                        this.openDrawer(service);
                    }
                }, true); // Use capture phase
            });

            // Close back buttons
            document.querySelectorAll('.btn-close-back').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const card = btn.closest('.service-card-3d');
                    this.flipCard(card, false);
                });
            });

            // BUNDLE BUTTON - FIXED: Ensure proper event binding
            const bundleBtn = document.getElementById('btnOpenBundle');
            if (bundleBtn) {
                // Remove any existing listeners by cloning
                const newBundleBtn = bundleBtn.cloneNode(true);
                bundleBtn.parentNode.replaceChild(newBundleBtn, bundleBtn);

                newBundleBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Bundle button clicked'); // Debug
                    this.openDrawer('bundle');
                });
            }

            // Drawer controls
            if (this.drawer) {
                const closeBtn = this.drawer.querySelector('.btn-close-drawer');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => this.closeDrawer());
                }

                const backdrop = this.drawer.querySelector('.drawer-backdrop');
                if (backdrop) {
                    backdrop.addEventListener('click', () => this.closeDrawer());
                }

                const nextBtn = this.drawer.querySelector('.btn-next-step');
                if (nextBtn) {
                    nextBtn.addEventListener('click', () => this.nextStep());
                }

                const prevBtn = this.drawer.querySelector('.btn-prev-step');
                if (prevBtn) {
                    prevBtn.addEventListener('click', () => this.prevStep());
                }

                // Size selectors
                this.drawer.querySelectorAll('.size-option').forEach(option => {
                    option.addEventListener('click', () => {
                        this.selectSize(option);
                    });
                });

                // Service type change - DYNAMIC FIELDS
                if (this.serviceSelect) {
                    this.serviceSelect.addEventListener('change', () => {
                        this.updateDynamicFields();
                    });
                }

                // Bundle checkboxes - show/hide property size
                const bundleCheckboxes = this.drawer.querySelectorAll('input[name="bundle_services"]');
                bundleCheckboxes.forEach(cb => {
                    cb.addEventListener('change', () => {
                        this.updateBundlePropertySize();
                    });
                });

                // Form submission
                const form = this.drawer.querySelector('#quickQuoteForm');
                if (form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        this.submitQuote();
                    });
                }
            }

            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (this.drawer?.classList.contains('active')) {
                        this.closeDrawer();
                    }
                    this.cards.forEach(c => this.flipCard(c, false));
                }
            });

            // Learn more buttons
            document.querySelectorAll('.btn-learn-more').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
        }

        // DYNAMIC FIELD UPDATES
        updateDynamicFields() {
            const service = this.serviceSelect.value;

            // Hide all dynamic sections first
            if (this.propertySizeGroup) this.propertySizeGroup.style.display = 'none';
            if (this.transportationFields) this.transportationFields.style.display = 'none';
            if (this.bundleFields) this.bundleFields.style.display = 'none';

            // Update required attributes
            this.updateRequiredFields(false);

            if (service === 'transportation') {
                // Show transportation fields
                if (this.transportationFields) this.transportationFields.style.display = 'block';
                this.updateRequiredFields(true, 'transportation');
            } else if (service === 'bundle') {
                // Show bundle fields
                if (this.bundleFields) this.bundleFields.style.display = 'block';
                this.updateBundlePropertySize();
            } else if (['cleaning', 'landscaping', 'maintenance'].includes(service)) {
                // Show property size for other services
                if (this.propertySizeGroup) this.propertySizeGroup.style.display = 'block';
            }

            // Update title
            this.updateDrawerTitle(service);
        }

        updateBundlePropertySize() {
            const bundleCheckboxes = this.drawer.querySelectorAll('input[name="bundle_services"]:checked');
            const hasTransportation = Array.from(bundleCheckboxes).some(cb => cb.value === 'transportation');

            if (this.bundlePropertySize) {
                if (hasTransportation) {
                    this.bundlePropertySize.style.display = 'none';
                } else {
                    this.bundlePropertySize.style.display = 'block';
                }
            }
        }

        updateRequiredFields(required, type) {
            if (type === 'transportation') {
                const fields = ['numBuses', 'numPassengers', 'pickupDate', 'pickupTime', 'dropoffTime', 'tripType', 'pickupLocation', 'destinationAddress'];
                fields.forEach(id => {
                    const field = document.getElementById(id);
                    if (field) {
                        field.required = required;
                    }
                });
            }
        }

        handleCardClick(e, card) {
            const isFlipped = card.classList.contains('flipped');

            // Close other cards first
            this.cards.forEach(c => {
                if (c !== card) this.flipCard(c, false);
            });

            // Flip current card
            this.flipCard(card, !isFlipped);
        }

        flipCard(card, shouldFlip) {
            const inner = card.querySelector('.card-3d-inner');

            // Set cooldown
            this.flipCooldown = true;

            if (shouldFlip) {
                card.classList.add('flipped');
                card.setAttribute('aria-expanded', 'true');
                // Use CSS class for transform, not inline style
                if (inner) inner.style.transform = 'rotateY(180deg)';
            } else {
                card.classList.remove('flipped');
                card.setAttribute('aria-expanded', 'false');
                if (inner) inner.style.transform = '';
            }

            // Release cooldown after animation
            setTimeout(() => {
                this.flipCooldown = false;
            }, CONFIG.flipCooldown);
        }

        handleFilter(btn) {
            const filter = btn.dataset.filter;

            this.filters.forEach(f => {
                f.classList.remove('active');
                f.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            this.currentFilter = filter;

            this.cards.forEach((card, index) => {
                const category = card.dataset.category;
                const shouldShow = filter === 'all' || category === filter;

                if (shouldShow) {
                    card.classList.remove('hidden');
                    card.style.animationDelay = `${index * 0.1}s`;
                    card.style.animation = 'fadeInUp 0.6s ease forwards';
                } else {
                    card.classList.add('hidden');
                }

                this.flipCard(card, false);
            });
        }

        openDrawer(serviceType) {
            if (!this.drawer) {
                console.error('Drawer not found');
                return;
            }

            this.resetForm();
            this.selectedService = serviceType;

            if (this.serviceSelect) {
                this.serviceSelect.value = serviceType || '';
                this.updateDynamicFields();
            }

            this.drawer.classList.add('active');
            this.drawer.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            // Focus first input after animation
            setTimeout(() => {
                const firstInput = this.drawer.querySelector('input:not([type="hidden"]), select, textarea');
                if (firstInput) firstInput.focus();
            }, 300);
        }

        closeDrawer() {
            if (!this.drawer) return;

            this.drawer.classList.remove('active');
            this.drawer.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        updateDrawerTitle(serviceType) {
            const names = {
                'cleaning': 'Cleaning Services Quote',
                'transportation': 'Transportation Quote',
                'landscaping': 'Landscaping Quote',
                'maintenance': 'Maintenance Quote',
                'bundle': 'Custom Bundle Quote'
            };
            if (this.drawerServiceName) {
                this.drawerServiceName.textContent = names[serviceType] || 'Select a service';
            }
        }

        nextStep() {
            if (this.currentStep < this.totalSteps) {
                if (this.validateStep(this.currentStep)) {
                    this.goToStep(this.currentStep + 1);
                }
            }
        }

        prevStep() {
            if (this.currentStep > 1) {
                this.goToStep(this.currentStep - 1);
            }
        }

        goToStep(step) {
            const currentStepEl = this.drawer.querySelector(`.form-step[data-step="${this.currentStep}"]`);
            const nextStepEl = this.drawer.querySelector(`.form-step[data-step="${step}"]`);

            if (currentStepEl) currentStepEl.classList.remove('active');
            if (nextStepEl) nextStepEl.classList.add('active');

            this.currentStep = step;
            this.updateStepUI();
        }

        updateStepUI() {
            const prevBtn = this.drawer.querySelector('.btn-prev-step');
            const nextBtn = this.drawer.querySelector('.btn-next-step');
            const submitBtn = this.drawer.querySelector('.btn-submit-quote');

            if (prevBtn) prevBtn.disabled = this.currentStep === 1;

            if (this.currentStep === this.totalSteps) {
                if (nextBtn) nextBtn.style.display = 'none';
                if (submitBtn) submitBtn.style.display = 'inline-flex';
            } else {
                if (nextBtn) nextBtn.style.display = 'inline-flex';
                if (submitBtn) submitBtn.style.display = 'none';
            }

            this.drawer.querySelectorAll('.step-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index < this.currentStep);
            });
        }

        validateStep(step) {
            const currentStepEl = this.drawer.querySelector(`.form-step[data-step="${step}"]`);
            if (!currentStepEl) return true;

            const requiredFields = currentStepEl.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                // Check if field or its parent is hidden
                const isHidden = field.offsetParent === null;
                if (!isHidden && !field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ef4444';
                    setTimeout(() => {
                        field.style.borderColor = '';
                    }, 2000);
                }
            });

            // Special validation for bundle checkboxes
            if (step === 1 && this.serviceSelect && this.serviceSelect.value === 'bundle') {
                const checkedServices = this.drawer.querySelectorAll('input[name="bundle_services"]:checked');
                if (checkedServices.length === 0) {
                    isValid = false;
                    alert('Please select at least one service for your bundle.');
                }
            }

            return isValid;
        }

        selectSize(option) {
            const parent = option.closest('.size-selector');
            if (!parent) return;

            parent.querySelectorAll('.size-option').forEach(opt => {
                opt.classList.remove('selected');
            });

            option.classList.add('selected');

            const hiddenInput = parent.nextElementSibling;
            if (hiddenInput && hiddenInput.type === 'hidden') {
                hiddenInput.value = option.dataset.size;
            }
        }

        resetForm() {
            this.currentStep = 1;
            const form = this.drawer.querySelector('#quickQuoteForm');
            if (form) form.reset();

            this.drawer.querySelectorAll('.form-step').forEach(step => {
                step.classList.remove('active');
            });
            const firstStep = this.drawer.querySelector('.form-step[data-step="1"]');
            if (firstStep) firstStep.classList.add('active');

            this.drawer.querySelectorAll('.size-option').forEach(opt => {
                opt.classList.remove('selected');
            });

            // Hide all dynamic fields
            if (this.propertySizeGroup) this.propertySizeGroup.style.display = 'none';
            if (this.transportationFields) this.transportationFields.style.display = 'none';
            if (this.bundleFields) this.bundleFields.style.display = 'none';

            this.updateStepUI();
        }

        submitQuote() {
            if (!this.validateStep(this.currentStep)) return;

            const submitBtn = this.drawer.querySelector('.btn-submit-quote');
            const originalText = submitBtn ? submitBtn.innerHTML : '';

            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
            }

            // Collect form data
            const form = this.drawer.querySelector('#quickQuoteForm');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Handle bundle checkboxes
            if (data.service_type === 'bundle') {
                const checkedServices = this.drawer.querySelectorAll('input[name="bundle_services"]:checked');
                data.bundle_services = Array.from(checkedServices).map(cb => cb.value);
            }

            console.log('Quote Request Data:', data);

            // Simulate submission
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Quote Requested!';
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                }

                setTimeout(() => {
                    this.closeDrawer();
                    setTimeout(() => {
                        if (submitBtn) {
                            submitBtn.innerHTML = originalText;
                            submitBtn.style.background = '';
                            submitBtn.disabled = false;
                        }
                    }, 300);
                }, 1500);
            }, 1500);
        }

        setupIntersectionObserver() {
            const observerOptions = {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            this.cards.forEach(card => {
                observer.observe(card);
            });
        }

        animateEntry() {
            this.cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(60px)';

                setTimeout(() => {
                    card.style.transition = `all 0.8s cubic-bezier(0.4, 0, 0.2, 1)`;
                    card.style.opacity = '1';
                    card.style.transform = '';
                }, index * CONFIG.staggerDelay);
            });
        }

        destroy() {
            if (this.particleSystem) {
                this.particleSystem.destroy();
            }
        }
    }

    // Initialize
    let servicesInstance = null;

    function init() {
        if (document.querySelector('.services-theater')) {
            servicesInstance = new ServicesTheater();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('beforeunload', () => {
        if (servicesInstance) {
            servicesInstance.destroy();
        }
    });

    window.ServicesTheater = ServicesTheater;
})();