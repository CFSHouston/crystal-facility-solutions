/* ============================================
   SERVICES MODULE - COMPLETE FILE
   ============================================ */

(function() {
    'use strict';

    const CONFIG = {
        tiltMaxAngle: 8,
        tiltPerspective: 1000,
        particleCount: 30,
        animationDuration: 600,
        staggerDelay: 100,
        flipCooldown: 350,
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phoneRegex: /^[\d\s\-\+\(\)]{10,}$/,
        nameRegex: /^[a-zA-Z\s\-']{2,50}$/
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

    // Validation Helper
    class FormValidator {
        static validateEmail(email) {
            return CONFIG.emailRegex.test(email);
        }

        static validatePhone(phone) {
            const digits = phone.replace(/\D/g, '');
            return digits.length >= 10 && digits.length <= 11;
        }

        static validateName(name) {
            return CONFIG.nameRegex.test(name) && name.trim().length >= 2;
        }

        static formatPhone(digits) {
            if (typeof digits !== 'string') {
                digits = String(digits).replace(/\D/g, '');
            }
            
            if (digits.length === 0) return '';
            if (digits.length <= 3) return digits;
            if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
            if (digits.length <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
            
            if (digits.length === 11 && digits[0] === '1') {
                return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
            }
            
            if (digits.length > 11) {
                digits = digits.slice(0, 10);
                return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
            }
            
            return digits;
        }

        static showError(fieldId, message) {
            const errorEl = document.getElementById(fieldId + 'Error');
            const field = document.getElementById(fieldId);
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.style.display = 'block';
            }
            if (field) {
                field.classList.add('error');
                field.classList.remove('valid');
                field.setAttribute('aria-invalid', 'true');
            }
        }

        static clearError(fieldId) {
            const errorEl = document.getElementById(fieldId + 'Error');
            const field = document.getElementById(fieldId);
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.style.display = 'none';
            }
            if (field) {
                field.classList.remove('error');
                field.classList.add('valid');
                field.setAttribute('aria-invalid', 'false');
            }
        }

        static clearAllErrors() {
            document.querySelectorAll('.field-error').forEach(el => {
                el.textContent = '';
                el.style.display = 'none';
            });
            document.querySelectorAll('input, select, textarea').forEach(field => {
                field.classList.remove('error');
                field.removeAttribute('aria-invalid');
            });
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
            this.flipCooldown = false;
            this.lastFlipTime = 0;

            this.init();
        }

        init() {
            this.cacheElements();
            this.setupParticles();
            this.setupEventListeners();
            this.setupValidationListeners();
            this.setupTransportationValidation();
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
            this.serviceTypeInput = document.getElementById('quoteServiceType');
            this.propertySizeGroup = document.getElementById('propertySizeGroup');
            this.transportationFields = document.getElementById('transportationFields');
            this.bundleFields = document.getElementById('bundleFields');
            this.bundlePropertySize = document.getElementById('bundlePropertySize');
            this.step1Title = document.getElementById('step1Title');
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
            this.cards.forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.btn-quick-quote') || 
                        e.target.closest('.btn-learn-more') || 
                        e.target.closest('.btn-close-back')) {
                        return;
                    }

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

            this.filters.forEach(btn => {
                btn.addEventListener('click', () => this.handleFilter(btn));
            });

            document.querySelectorAll('.btn-quick-quote').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    const service = btn.dataset.service;
                    if (service) {
                        this.openDrawer(service);
                    }
                }, true);
            });

            document.querySelectorAll('.btn-close-back').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const card = btn.closest('.service-card-3d');
                    this.flipCard(card, false);
                });
            });

            const bundleBtn = document.getElementById('btnOpenBundle');
            if (bundleBtn) {
                bundleBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openDrawer('bundle');
                });
            }

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

                this.drawer.querySelectorAll('.size-option').forEach(option => {
                    option.addEventListener('click', () => this.selectSize(option));
                    option.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.selectSize(option);
                        }
                    });
                });

                const bundleCheckboxes = this.drawer.querySelectorAll('input[name="bundle_services"]');
                bundleCheckboxes.forEach(cb => {
                    cb.addEventListener('change', () => {
                        this.updateBundlePropertySize();
                    });
                });

                const form = this.drawer.querySelector('#quickQuoteForm');
                if (form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        this.submitQuote();
                    });
                }
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (this.drawer?.classList.contains('active')) {
                        this.closeDrawer();
                    }
                    this.cards.forEach(c => this.flipCard(c, false));
                }
            });

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

        setupValidationListeners() {
            const emailField = document.getElementById('quoteEmail');
            if (emailField) {
                emailField.addEventListener('blur', () => {
                    const value = emailField.value.trim();
                    if (value && !FormValidator.validateEmail(value)) {
                        FormValidator.showError('email', 'Please enter a valid email address');
                    } else if (value) {
                        FormValidator.clearError('email');
                    }
                });
                emailField.addEventListener('input', () => FormValidator.clearError('email'));
            }

            const phoneField = document.getElementById('quotePhone');
            if (phoneField) {
                phoneField.addEventListener('input', (e) => {
                    let digits = e.target.value.replace(/\D/g, '');
                    if (digits.length > 11) {
                        digits = digits.slice(0, 11);
                    }
                    e.target.value = FormValidator.formatPhone(digits);
                    FormValidator.clearError('phone');
                });

                phoneField.addEventListener('blur', () => {
                    const value = phoneField.value.trim();
                    const digits = value.replace(/\D/g, '');
                    if (value) {
                        if (digits.length < 10) {
                            FormValidator.showError('phone', 'Please enter a complete phone number (10 digits)');
                        } else {
                            FormValidator.clearError('phone');
                        }
                    }
                });
            }

            const firstNameField = document.getElementById('quoteFirstName');
            if (firstNameField) {
                firstNameField.addEventListener('blur', () => {
                    const value = firstNameField.value.trim();
                    if (value && !FormValidator.validateName(value)) {
                        FormValidator.showError('firstName', 'Please enter a valid name (letters only, min 2 characters)');
                    } else if (value) {
                        FormValidator.clearError('firstName');
                    }
                });
                firstNameField.addEventListener('input', () => FormValidator.clearError('firstName'));
            }

            const lastNameField = document.getElementById('quoteLastName');
            if (lastNameField) {
                lastNameField.addEventListener('blur', () => {
                    const value = lastNameField.value.trim();
                    if (value && !FormValidator.validateName(value)) {
                        FormValidator.showError('lastName', 'Please enter a valid name (letters only, min 2 characters)');
                    } else if (value) {
                        FormValidator.clearError('lastName');
                    }
                });
                lastNameField.addEventListener('input', () => FormValidator.clearError('lastName'));
            }
        }

        setupTransportationValidation() {
            const busType = document.getElementById('busType');
            const numBuses = document.getElementById('numBuses');
            const numPassengers = document.getElementById('numPassengers');
            const pickupDate = document.getElementById('pickupDate');
            const pickupTime = document.getElementById('pickupTime');
            const dropoffTime = document.getElementById('dropoffTime');
            const tripType = document.getElementById('tripType');
            const pickupLocation = document.getElementById('pickupLocation');
            const dropoffLocation = document.getElementById('dropoffLocation');
            const dropoffDate = document.getElementById('dropoffDate');

            const now = new Date();
            const today = now.toISOString().split('T')[0];
            
            if (pickupDate) {
                pickupDate.setAttribute('min', today);
            }

            if (busType) {
                busType.addEventListener('change', () => {
                    if (busType.value) {
                        FormValidator.clearError('busType');
                        busType.classList.add('valid');
                    }
                });
                busType.addEventListener('blur', () => {
                    if (!busType.value) {
                        FormValidator.showError('busType', 'Please select a bus type');
                    }
                });
            }

            if (numBuses) {
                numBuses.addEventListener('input', (e) => {
                    let value = parseInt(e.target.value) || 0;
                    if (value > 25) e.target.value = 25;
                    if (value < 1 && e.target.value !== '') e.target.value = 1;
                    if (value >= 1 && value <= 25) {
                        FormValidator.clearError('numBuses');
                        numBuses.classList.add('valid');
                    }
                });
                numBuses.addEventListener('blur', () => {
                    const value = parseInt(numBuses.value) || 0;
                    if (!value || value < 1) {
                        FormValidator.showError('numBuses', 'Please enter number of buses (1-25)');
                    } else if (value > 25) {
                        FormValidator.showError('numBuses', 'Maximum 25 buses allowed');
                    }
                });
            }

            if (numPassengers) {
                numPassengers.addEventListener('input', (e) => {
                    let value = parseInt(e.target.value) || 0;
                    if (value > 1000) e.target.value = 1000;
                    if (value < 1 && e.target.value !== '') e.target.value = 1;
                    if (value >= 1 && value <= 1000) {
                        FormValidator.clearError('numPassengers');
                        numPassengers.classList.add('valid');
                    }
                });
                numPassengers.addEventListener('blur', () => {
                    const value = parseInt(numPassengers.value) || 0;
                    if (!value || value < 1) {
                        FormValidator.showError('numPassengers', 'Please enter number of passengers (1-1000)');
                    } else if (value > 1000) {
                        FormValidator.showError('numPassengers', 'Maximum 1000 passengers allowed');
                    }
                });
            }

            if (pickupDate) {
                pickupDate.addEventListener('change', () => {
                    const selected = new Date(pickupDate.value);
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    if (selected < now) {
                        FormValidator.showError('pickupDate', 'Please select a future date');
                        pickupDate.value = '';
                    } else {
                        FormValidator.clearError('pickupDate');
                        pickupDate.classList.add('valid');
                    }
                });
            }

            if (pickupTime) {
                pickupTime.addEventListener('change', () => {
                    if (pickupTime.value) {
                        FormValidator.clearError('pickupTime');
                        pickupTime.classList.add('valid');
                    }
                });
            }

            if (dropoffTime) {
                dropoffTime.addEventListener('change', () => {
                    if (dropoffTime.value) {
                        FormValidator.clearError('dropoffTime');
                        dropoffTime.classList.add('valid');
                    }
                });
            }

            if (tripType) {
                tripType.addEventListener('change', () => {
                    if (tripType.value) {
                        FormValidator.clearError('tripType');
                        tripType.classList.add('valid');
                    }
                });
                tripType.addEventListener('blur', () => {
                    if (!tripType.value) {
                        FormValidator.showError('tripType', 'Please select trip type');
                    }
                });
            }

            if (pickupLocation) {
                pickupLocation.addEventListener('input', () => {
                    if (pickupLocation.value.trim().length > 5) {
                        FormValidator.clearError('pickupLocation');
                        pickupLocation.classList.add('valid');
                    }
                });
                pickupLocation.addEventListener('blur', () => {
                    if (!pickupLocation.value.trim()) {
                        FormValidator.showError('pickupLocation', 'Please enter pick-up location');
                    } else if (pickupLocation.value.trim().length < 5) {
                        FormValidator.showError('pickupLocation', 'Please enter a complete address');
                    }
                });
            }

            if (dropoffLocation) {
                dropoffLocation.addEventListener('input', () => {
                    if (dropoffLocation.value.trim().length > 5) {
                        FormValidator.clearError('dropoffLocation');
                        dropoffLocation.classList.add('valid');
                    }
                });
                dropoffLocation.addEventListener('blur', () => {
                    if (!dropoffLocation.value.trim()) {
                        FormValidator.showError('dropoffLocation', 'Please enter drop-off location');
                    } else if (dropoffLocation.value.trim().length < 5) {
                        FormValidator.showError('dropoffLocation', 'Please enter a complete address');
                    }
                });
            }
            if (dropoffDate) {
            // Set minimum to same as pick-up date
                if (pickupDate) {
                    pickupDate.addEventListener('change', () => {
                        dropoffDate.setAttribute('min', pickupDate.value);
                    });
                }
            
                dropoffDate.addEventListener('change', () => {
                    const pickDate = pickupDate?.value;
                    const dropDate = dropoffDate.value;
                    
                    if (pickDate && dropDate) {
                        if (new Date(dropDate) < new Date(pickDate)) {
                            FormValidator.showError('dropoffDate', 'Drop-off date cannot be before pick-up date');
                            dropoffDate.value = '';
                        } else {
                            FormValidator.clearError('dropoffDate');
                            dropoffDate.classList.add('valid');
                        }
                    }
                 });
            }
            
        }

        updateBundlePropertySize() {
            const bundleCheckboxes = this.drawer.querySelectorAll('input[name="bundle_services"]:checked');
            const hasTransportation = Array.from(bundleCheckboxes).some(cb => cb.value === 'transportation');

            if (this.bundlePropertySize) {
                this.bundlePropertySize.style.display = hasTransportation ? 'none' : 'block';
                const hiddenInput = this.bundlePropertySize.querySelector('input[type="hidden"]');
                if (hiddenInput) {
                    hiddenInput.required = !hasTransportation;
                }
            }
        }

        handleCardClick(e, card) {
            const isFlipped = card.classList.contains('flipped');
            this.cards.forEach(c => {
                if (c !== card) this.flipCard(c, false);
            });
            this.flipCard(card, !isFlipped);
        }

        flipCard(card, shouldFlip) {
            const inner = card.querySelector('.card-3d-inner');
            this.flipCooldown = true;

            if (shouldFlip) {
                card.classList.add('flipped');
                card.setAttribute('aria-expanded', 'true');
                if (inner) inner.style.transform = 'rotateY(180deg)';
            } else {
                card.classList.remove('flipped');
                card.setAttribute('aria-expanded', 'false');
                if (inner) inner.style.transform = '';
            }

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

            if (this.serviceTypeInput) {
                this.serviceTypeInput.value = serviceType;
            }

            this.updateDynamicFields(serviceType);

            const chatWidget = document.querySelector('.chat-widget');
            if (chatWidget) {
                chatWidget.style.opacity = '0';
                chatWidget.style.pointerEvents = 'none';
                chatWidget.style.transition = 'opacity 0.3s ease';
            }

            this.drawer.classList.add('active');
            this.drawer.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                const firstInput = this.drawer.querySelector('input:not([type="hidden"]), select, textarea');
                if (firstInput) firstInput.focus();
            }, 300);
        }

        closeDrawer() {
            if (!this.drawer) return;

            const chatWidget = document.querySelector('.chat-widget');
            if (chatWidget) {
                chatWidget.style.opacity = '1';
                chatWidget.style.pointerEvents = 'all';
            }

            this.drawer.classList.remove('active');
            this.drawer.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            FormValidator.clearAllErrors();
        }

        updateDynamicFields(serviceType) {
            if (this.propertySizeGroup) this.propertySizeGroup.style.display = 'none';
            if (this.transportationFields) this.transportationFields.style.display = 'none';
            if (this.bundleFields) this.bundleFields.style.display = 'none';

            const serviceNames = {
                'cleaning': 'Cleaning Services Quote',
                'transportation': 'Transportation Quote',
                'landscaping': 'Landscaping Quote',
                'maintenance': 'Maintenance Quote',
                'bundle': 'Custom Bundle Quote'
            };

            if (this.drawerServiceName) {
                this.drawerServiceName.textContent = serviceNames[serviceType] || 'Request a Quote';
            }

            if (this.step1Title) {
                const titles = {
                    'cleaning': 'Cleaning Service Details',
                    'transportation': 'Transportation Details',
                    'landscaping': 'Landscaping Details',
                    'maintenance': 'Maintenance Details',
                    'bundle': 'Build Your Bundle'
                };
                this.step1Title.textContent = titles[serviceType] || 'Service Details';
            }

            if (serviceType === 'transportation') {
                if (this.transportationFields) {
                    this.transportationFields.style.display = 'block';
                }
            } else if (serviceType === 'bundle') {
                if (this.bundleFields) {
                    this.bundleFields.style.display = 'block';
                }
            } else if (['cleaning', 'landscaping', 'maintenance'].includes(serviceType)) {
                if (this.propertySizeGroup) {
                    this.propertySizeGroup.style.display = 'block';
                    const sizeInput = document.getElementById('quoteSizeValue');
                    if (sizeInput) sizeInput.required = true;
                }
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

            setTimeout(() => {
                const firstInput = nextStepEl?.querySelector('input, select, textarea');
                if (firstInput) firstInput.focus();
            }, 100);
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

            let isValid = true;

            const requiredFields = currentStepEl.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                const isHidden = field.offsetParent === null;
                if (!isHidden && !field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    const errorEl = document.getElementById(field.id + 'Error');
                    if (errorEl) {
                        errorEl.textContent = 'This field is required';
                        errorEl.style.display = 'block';
                    }
                } else {
                    field.classList.remove('error');
                }
            });

            if (step === 1 && ['cleaning', 'landscaping', 'maintenance'].includes(this.selectedService)) {
                const sizeValue = document.getElementById('quoteSizeValue')?.value;
                if (!sizeValue) {
                    isValid = false;
                    const sizeError = document.getElementById('sizeError');
                    if (sizeError) {
                        sizeError.textContent = 'Please select a property size';
                        sizeError.style.display = 'block';
                    }
                    const sizeSelector = document.querySelector('.property-size-group .size-selector');
                    if (sizeSelector) {
                        sizeSelector.classList.add('has-error');
                        setTimeout(() => sizeSelector.classList.remove('has-error'), 3000);
                    }
                }
            }

            if (step === 1 && this.selectedService === 'bundle') {
                const bundleCheckboxes = this.drawer.querySelectorAll('input[name="bundle_services"]:checked');
                const hasTransportation = Array.from(bundleCheckboxes).some(cb => cb.value === 'transportation');
                
                if (!hasTransportation) {
                    const bundleSizeValue = document.getElementById('bundleSizeValue')?.value;
                    if (!bundleSizeValue) {
                        isValid = false;
                        const sizeError = document.getElementById('bundleSizeError');
                        if (sizeError) {
                            sizeError.textContent = 'Please select a property size';
                            sizeError.style.display = 'block';
                        }
                    }
                }

                if (bundleCheckboxes.length === 0) {
                    isValid = false;
                    const errorEl = document.getElementById('bundleServicesError');
                    if (errorEl) {
                        errorEl.textContent = 'Please select at least one service';
                        errorEl.style.display = 'block';
                    }
                }
            }
            if (step === 1 && this.selectedService === 'transportation') {
                const transportFields = ['busType', 'numBuses', 'numPassengers', 'pickupDate', 'pickupTime', 'dropoffDate', 'dropoffTime', 'tripType', 'pickupLocation', 'dropoffLocation'];
                    
                transportFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field && field.hasAttribute('required') && !field.value.trim()) {
                        isValid = false;
                            FormValidator.showError(fieldId, 'This field is required');
                        }
                });

                    // Validate drop-off date is not before pick-up
                const pickDate = document.getElementById('pickupDate')?.value;
                const dropDate = document.getElementById('dropoffDate')?.value;
                if (pickDate && dropDate && new Date(dropDate) < new Date(pickDate)) {
                        isValid = false;
                        FormValidator.showError('dropoffDate', 'Drop-off date must be on or after pick-up date');
                }

                const busCount = parseInt(document.getElementById('numBuses')?.value) || 0;
                if (busCount < 1 || busCount > 25) {
                        isValid = false;
                        FormValidator.showError('numBuses', 'Please enter 1-25 buses');
                }

                const passCount = parseInt(document.getElementById('numPassengers')?.value) || 0;
                if (passCount < 1 || passCount > 1000) {
                        isValid = false;
                        FormValidator.showError('numPassengers', 'Please enter 1-1000 passengers');
                }
            }

            if (step === 2) {
                const email = document.getElementById('quoteEmail')?.value.trim();
                const phone = document.getElementById('quotePhone')?.value.trim();
                const firstName = document.getElementById('quoteFirstName')?.value.trim();
                const lastName = document.getElementById('quoteLastName')?.value.trim();

                if (email && !FormValidator.validateEmail(email)) {
                    FormValidator.showError('email', 'Please enter a valid email address');
                    isValid = false;
                }

                if (phone && !FormValidator.validatePhone(phone)) {
                    FormValidator.showError('phone', 'Please enter a valid phone number');
                    isValid = false;
                }

                if (firstName && !FormValidator.validateName(firstName)) {
                    FormValidator.showError('firstName', 'Please enter a valid first name');
                    isValid = false;
                }

                if (lastName && !FormValidator.validateName(lastName)) {
                    FormValidator.showError('lastName', 'Please enter a valid last name');
                    isValid = false;
                }
            }

            return isValid;
        }

        selectSize(option) {
            const parent = option.closest('.size-selector');
            if (!parent) return;

            parent.querySelectorAll('.size-option').forEach(opt => {
                opt.classList.remove('selected');
                opt.setAttribute('aria-checked', 'false');
            });

            option.classList.add('selected');
            option.setAttribute('aria-checked', 'true');

            const hiddenInput = parent.nextElementSibling;
            if (hiddenInput && hiddenInput.type === 'hidden') {
                hiddenInput.value = option.dataset.size;
                const errorId = hiddenInput.id.replace('Value', 'Error');
                const errorEl = document.getElementById(errorId);
                if (errorEl) {
                    errorEl.textContent = '';
                    errorEl.style.display = 'none';
                }
                parent.classList.remove('has-error');
            }
        }

        resetForm() {
            this.currentStep = 1;
            const form = this.drawer.querySelector('#quickQuoteForm');
            if (form) {
                form.reset();
                FormValidator.clearAllErrors();
            }

            this.drawer.querySelectorAll('.form-step').forEach(step => {
                step.classList.remove('active');
            });
            const firstStep = this.drawer.querySelector('.form-step[data-step="1"]');
            if (firstStep) firstStep.classList.add('active');

            this.drawer.querySelectorAll('.size-option').forEach(opt => {
                opt.classList.remove('selected');
                opt.setAttribute('aria-checked', 'false');
            });

            if (this.propertySizeGroup) this.propertySizeGroup.style.display = 'none';
            if (this.transportationFields) this.transportationFields.style.display = 'none';
            if (this.bundleFields) this.bundleFields.style.display = 'none';

            this.updateStepUI();
        }

        async submitQuote() {
            if (!this.validateStep(this.currentStep)) return;

            const submitBtn = this.drawer.querySelector('.btn-submit-quote');
            const originalText = submitBtn ? submitBtn.innerHTML : '';

            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
            }

            const form = this.drawer.querySelector('#quickQuoteForm');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            if (this.selectedService === 'bundle') {
                const checkedServices = this.drawer.querySelectorAll('input[name="bundle_services"]:checked');
                data.bundle_services = Array.from(checkedServices).map(cb => cb.value).join(', ');
            }

            let toEmail = 'info@cfshouston.com';
            if (['cleaning', 'landscaping', 'maintenance'].includes(this.selectedService)) {
                toEmail = 'cleaning@cfshouston.com';
            } else if (this.selectedService === 'transportation') {
                toEmail = 'transportation@cfshouston.com';
            } else if (this.selectedService === 'bundle') {
                const checkedServices = this.drawer.querySelectorAll('input[name="bundle_services"]:checked');
                const hasTransportation = Array.from(checkedServices).some(cb => cb.value === 'transportation');
                const hasCleaning = Array.from(checkedServices).some(cb => ['cleaning', 'landscaping', 'maintenance'].includes(cb.value));
                
                if (hasTransportation && !hasCleaning) {
                    toEmail = 'transportation@cfshouston.com';
                } else if (hasCleaning) {
                    toEmail = 'cleaning@cfshouston.com';
                }
            }

            const messageContent = this.buildEmailMessage(data);

            const templateParams = {
                to_email: toEmail,
                name: `${data.first_name} ${data.last_name}`,
                email: data.email,
                from_name: `${data.first_name} ${data.last_name}`,
                from_email: data.email,
                service: data.service_type_display || this.selectedService,
                time: new Date().toLocaleString(),
                message: messageContent
            };

            try {
                await emailjs.send('default_service', 'template_jvn3yzi', templateParams);

                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Quote Sent!';
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                }

                this.showToast('Quote request sent successfully! We\'ll be in touch within 2 hours.', 'success');

                setTimeout(() => {
                    this.closeDrawer();
                    setTimeout(() => {
                        if (submitBtn) {
                            submitBtn.innerHTML = originalText;
                            submitBtn.style.background = '';
                            submitBtn.disabled = false;
                        }
                    }, 300);
                }, 2000);

            } catch (error) {
                console.error('EmailJS Error:', error);
                
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
                    submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                }

                this.showToast('Failed to send quote. Please call us at 281-506-8826.', 'error');

                setTimeout(() => {
                    if (submitBtn) {
                        submitBtn.innerHTML = originalText;
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                    }
                }, 3000);
            }
        }

        buildEmailMessage(data) {
            let message = '';

            message += `Phone: ${data.phone}\n`;
            message += `Company/School: ${data.company || 'Not provided'}\n`;
            
            const size = data.property_size || data.bundle_property_size;
            if (size) {
                message += `Property Size: ${size}\n`;
            }

            if (data.bundle_services) {
                message += `Bundle Services: ${data.bundle_services}\n`;
            }

            if (data.num_buses || data.bus_type) {
                message += `\n--- Transportation Details ---\n`;
                message += `Bus Type: ${data.bus_type || 'Not specified'}\n`;
                message += `Number of Buses: ${data.num_buses || 'Not specified'}\n`;
                message += `Number of Passengers: ${data.num_passengers || 'Not specified'}\n`;
                message += `Pick-up Date: ${data.pickup_date || 'Not specified'}\n`;
                message += `Pick-up Time: ${data.pickup_time || 'Not specified'}\n`;
                message += `Drop-off Date: ${data.dropoff_date || 'Not specified'}\n`;
                message += `Drop-off Time: ${data.dropoff_time || 'Not specified'}\n`;
                message += `Trip Type: ${data.trip_type || 'Not specified'}\n`;
                message += `Pick-up Location: ${data.pickup_location || 'Not specified'}\n`;
                message += `Drop-off Location: ${data.dropoff_location || 'Not specified'}\n`;
            }

            if (data.message) {
                message += `\n--- Additional Notes ---\n${data.message}\n`;
            }

            return message;
        }

        showToast(message, type = 'success') {
            const existingToast = document.querySelector('.quote-toast');
            if (existingToast) existingToast.remove();

            const toast = document.createElement('div');
            toast.className = `quote-toast toast-${type}`;
            toast.setAttribute('role', 'alert');
            toast.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            `;
            
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : '#ef4444'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                z-index: 100000;
                font-weight: 500;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                animation: slideInRight 0.3s ease;
            `;

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 5000);
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