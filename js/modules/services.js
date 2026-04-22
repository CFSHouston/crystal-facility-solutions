/* ============================================
   SERVICES MODULE - PRODUCTION READY
   Crystal Facility Solutions
   ============================================ */

(function() {
    'use strict';

    // ─── Configuration ──────────────────────────────────────────
    const CONFIG = {
        tiltMaxAngle: 8,
        tiltPerspective: 1000,
        particleCount: 30,
        animationDuration: 600,
        staggerDelay: 100,
        flipCooldown: 350,
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phoneRegex: /^[\d\s\-\+\(\)]{10,}$/,
        nameRegex: /^[a-zA-Z\s\-'"]{2,50}$/,
        emails: {
            default: 'info@cfshouston.com',
            cleaning: 'cleaning@cfshouston.com',
            transportation: 'transportation@cfshouston.com'
        },
        phone: '281-506-8826',
        emailjs: {
            serviceId: 'default_service',
            templateId: 'template_jvn3yzi'
        }
    };

    // ─── Utilities ──────────────────────────────────────────────
    const utils = {
        throttle: (func, limit) => {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => { inThrottle = false; }, limit);
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

    // ─── Input Sanitization ─────────────────────────────────────
    function sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim();
    }

    function sanitizeForDisplay(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ─── Particle System ────────────────────────────────────────
    class ParticleSystem {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d', { willReadFrequently: false });
            this.particles = [];
            this.animationId = null;
            this.isActive = true;
            this.resizeHandler = null;
            this.visibilityHandler = null;
            this.init();
        }

        init() {
            this.resize();
            this.createParticles();
            this.animate();

            this.resizeHandler = utils.debounce(() => this.resize(), 250);
            this.visibilityHandler = () => {
                this.isActive = document.visibilityState === 'visible';
                if (this.isActive) this.animate();
            };

            window.addEventListener('resize', this.resizeHandler);
            document.addEventListener('visibilitychange', this.visibilityHandler);
        }

        resize() {
            const parent = this.canvas.parentElement;
            if (parent) {
                this.canvas.width = parent.offsetWidth;
                this.canvas.height = parent.offsetHeight;
            }
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
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            if (this.resizeHandler) {
                window.removeEventListener('resize', this.resizeHandler);
            }
            if (this.visibilityHandler) {
                document.removeEventListener('visibilitychange', this.visibilityHandler);
            }
        }
    }

    // ─── Form Validator ─────────────────────────────────────────
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

    // ─── Services Theater ───────────────────────────────────────
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
            this.timeouts = [];
            this.boundHandlers = {};
            this.particleSystem = null;
            this.observer = null;

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
                if (!inner) return;

                const onMouseMove = utils.throttle((e) => {
                    if (card.classList.contains('flipped')) return;
                    this.handleTilt(e, card, inner);
                }, 16);

                const onMouseLeave = () => {
                    if (card.classList.contains('flipped')) return;
                    this.resetTilt(card, inner);
                };

                card.addEventListener('mousemove', onMouseMove);
                card.addEventListener('mouseleave', onMouseLeave);

                if (!this.boundHandlers.tilt) this.boundHandlers.tilt = [];
                this.boundHandlers.tilt.push({ card, onMouseMove, onMouseLeave });
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
                inner.style.transform = `perspective(${CONFIG.tiltPerspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
            }
        }

        resetTilt(card, inner) {
            if (!card.classList.contains('flipped')) {
                inner.style.transform = '';
            }
        }

        setupEventListeners() {
            const self = this;

            // Card click handlers
            this.cards.forEach(card => {
                const onClick = (e) => {
                    if (e.target.closest('.btn-quick-quote') ||
                        e.target.closest('.btn-learn-more') ||
                        e.target.closest('.btn-close-back')) {
                        return;
                    }
                    const now = Date.now();
                    if (self.flipCooldown || (now - self.lastFlipTime < CONFIG.flipCooldown)) return;
                    self.handleCardClick(e, card);
                    self.lastFlipTime = now;
                };

                const onKeyDown = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        self.handleCardClick(e, card);
                    }
                };

                card.addEventListener('click', onClick);
                card.addEventListener('keydown', onKeyDown);

                if (!this.boundHandlers.cards) this.boundHandlers.cards = [];
                this.boundHandlers.cards.push({ card, onClick, onKeyDown });
            });

            // Filter buttons
            this.filters.forEach(btn => {
                const onClick = () => this.handleFilter(btn);
                btn.addEventListener('click', onClick);
                if (!this.boundHandlers.filters) this.boundHandlers.filters = [];
                this.boundHandlers.filters.push({ btn, onClick });
            });

            // Quick quote buttons
            document.querySelectorAll('.btn-quick-quote').forEach(btn => {
                const onClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    const service = btn.dataset.service;
                    if (service) this.openDrawer(service);
                };
                btn.addEventListener('click', onClick, true);
                if (!this.boundHandlers.quoteBtns) this.boundHandlers.quoteBtns = [];
                this.boundHandlers.quoteBtns.push({ btn, onClick });
            });

            // Close back buttons
            document.querySelectorAll('.btn-close-back').forEach(btn => {
                const onClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const card = btn.closest('.service-card-3d');
                    this.flipCard(card, false);
                };
                btn.addEventListener('click', onClick);
                if (!this.boundHandlers.closeBtns) this.boundHandlers.closeBtns = [];
                this.boundHandlers.closeBtns.push({ btn, onClick });
            });

            // Bundle button
            const bundleBtn = document.getElementById('btnOpenBundle');
            if (bundleBtn) {
                const onClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openDrawer('bundle');
                };
                bundleBtn.addEventListener('click', onClick);
                this.boundHandlers.bundleBtn = { bundleBtn, onClick };
            }

            // Drawer events
            if (this.drawer) {
                this.setupDrawerListeners();
            }

            // Global Escape key
            const onEscape = (e) => {
                if (e.key === 'Escape') {
                    if (this.drawer?.classList.contains('active')) {
                        this.closeDrawer();
                    }
                    this.cards.forEach(c => this.flipCard(c, false));
                }
            };
            document.addEventListener('keydown', onEscape);
            this.boundHandlers.escape = onEscape;

            // Learn more buttons
            document.querySelectorAll('.btn-learn-more').forEach(btn => {
                const onClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const contactSection = document.getElementById('contact');
                    if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                };
                btn.addEventListener('click', onClick);
                if (!this.boundHandlers.learnMore) this.boundHandlers.learnMore = [];
                this.boundHandlers.learnMore.push({ btn, onClick });
            });
        }

        setupDrawerListeners() {
            const closeBtn = this.drawer.querySelector('.btn-close-drawer');
            if (closeBtn) {
                const onClick = () => this.closeDrawer();
                closeBtn.addEventListener('click', onClick);
                if (!this.boundHandlers.drawer) this.boundHandlers.drawer = [];
                this.boundHandlers.drawer.push({ el: closeBtn, onClick });
            }

            const backdrop = this.drawer.querySelector('.drawer-backdrop');
            if (backdrop) {
                const onClick = () => this.closeDrawer();
                backdrop.addEventListener('click', onClick);
                this.boundHandlers.drawer.push({ el: backdrop, onClick });
            }

            const nextBtn = this.drawer.querySelector('.btn-next-step');
            if (nextBtn) {
                const onClick = () => this.nextStep();
                nextBtn.addEventListener('click', onClick);
                this.boundHandlers.drawer.push({ el: nextBtn, onClick });
            }

            const prevBtn = this.drawer.querySelector('.btn-prev-step');
            if (prevBtn) {
                const onClick = () => this.prevStep();
                prevBtn.addEventListener('click', onClick);
                this.boundHandlers.drawer.push({ el: prevBtn, onClick });
            }

            this.drawer.querySelectorAll('.size-option').forEach(option => {
                const onClick = () => this.selectSize(option);
                const onKeyDown = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.selectSize(option);
                    }
                };
                option.addEventListener('click', onClick);
                option.addEventListener('keydown', onKeyDown);
                if (!this.boundHandlers.sizeOptions) this.boundHandlers.sizeOptions = [];
                this.boundHandlers.sizeOptions.push({ option, onClick, onKeyDown });
            });

            const bundleCheckboxes = this.drawer.querySelectorAll('input[name="bundle_services"]');
            bundleCheckboxes.forEach(cb => {
                const onChange = () => this.updateBundlePropertySize();
                cb.addEventListener('change', onChange);
                if (!this.boundHandlers.bundleCheckboxes) this.boundHandlers.bundleCheckboxes = [];
                this.boundHandlers.bundleCheckboxes.push({ cb, onChange });
            });

            const form = this.drawer.querySelector('#quickQuoteForm');
            if (form) {
                const onSubmit = (e) => {
                    e.preventDefault();
                    this.submitQuote();
                };
                form.addEventListener('submit', onSubmit);
                this.boundHandlers.form = { form, onSubmit };
            }
        }

        setupValidationListeners() {
            const fields = [
                { id: 'quoteEmail', validator: FormValidator.validateEmail, errorMsg: 'Please enter a valid email address' },
                { id: 'quoteFirstName', validator: FormValidator.validateName, errorMsg: 'Please enter a valid name (letters only, min 2 characters)' },
                { id: 'quoteLastName', validator: FormValidator.validateName, errorMsg: 'Please enter a valid name (letters only, min 2 characters)' }
            ];

            fields.forEach(({ id, validator, errorMsg }) => {
                const field = document.getElementById(id);
                if (!field) return;

                const onBlur = () => {
                    const value = field.value.trim();
                    if (value && !validator(value)) {
                        FormValidator.showError(id.replace('quote', '').toLowerCase(), errorMsg);
                    } else if (value) {
                        FormValidator.clearError(id.replace('quote', '').toLowerCase());
                    }
                };

                const onInput = () => {
                    FormValidator.clearError(id.replace('quote', '').toLowerCase());
                };

                field.addEventListener('blur', onBlur);
                field.addEventListener('input', onInput);

                if (!this.boundHandlers.validation) this.boundHandlers.validation = [];
                this.boundHandlers.validation.push({ field, onBlur, onInput });
            });

            // Phone field with formatting
            const phoneField = document.getElementById('quotePhone');
            if (phoneField) {
                const onInput = (e) => {
                    let digits = e.target.value.replace(/\D/g, '');
                    if (digits.length > 11) digits = digits.slice(0, 11);
                    e.target.value = FormValidator.formatPhone(digits);
                    FormValidator.clearError('phone');
                };

                const onBlur = () => {
                    const value = phoneField.value.trim();
                    const digits = value.replace(/\D/g, '');
                    if (value) {
                        if (digits.length < 10) {
                            FormValidator.showError('phone', 'Please enter a complete phone number (10 digits)');
                        } else {
                            FormValidator.clearError('phone');
                        }
                    }
                };

                phoneField.addEventListener('input', onInput);
                phoneField.addEventListener('blur', onBlur);
                this.boundHandlers.validation.push({ field: phoneField, onBlur, onInput });
            }
        }

        setupTransportationValidation() {
            const fields = {
                busType: { el: document.getElementById('busType'), validate: (v) => !!v, error: 'Please select a bus type' },
                numBuses: { el: document.getElementById('numBuses'), min: 1, max: 25, error: 'Please enter number of buses (1-25)', maxError: 'Maximum 25 buses allowed' },
                numPassengers: { el: document.getElementById('numPassengers'), min: 1, max: 1000, error: 'Please enter number of passengers (1-1000)', maxError: 'Maximum 1000 passengers allowed' },
                pickupDate: { el: document.getElementById('pickupDate') },
                pickupTime: { el: document.getElementById('pickupTime') },
                dropoffTime: { el: document.getElementById('dropoffTime') },
                tripType: { el: document.getElementById('tripType'), validate: (v) => !!v, error: 'Please select trip type' },
                pickupLocation: { el: document.getElementById('pickupLocation'), minLen: 5, error: 'Please enter pick-up location', shortError: 'Please enter a complete address' },
                dropoffLocation: { el: document.getElementById('dropoffLocation'), minLen: 5, error: 'Please enter drop-off location', shortError: 'Please enter a complete address' },
                dropoffDate: { el: document.getElementById('dropoffDate') }
            };

            const now = new Date();
            const today = now.toISOString().split('T')[0];
            if (fields.pickupDate.el) {
                fields.pickupDate.el.setAttribute('min', today);
            }

            // Set up min date for dropoff based on pickup
            if (fields.pickupDate.el && fields.dropoffDate.el) {
                const onPickupChange = () => {
                    fields.dropoffDate.el.setAttribute('min', fields.pickupDate.el.value);
                };
                fields.pickupDate.el.addEventListener('change', onPickupChange);
                if (!this.boundHandlers.transport) this.boundHandlers.transport = [];
                this.boundHandlers.transport.push({ el: fields.pickupDate.el, onPickupChange });
            }

            // Bus type
            if (fields.busType.el) {
                const onChange = () => {
                    if (fields.busType.el.value) {
                        FormValidator.clearError('busType');
                        fields.busType.el.classList.add('valid');
                    }
                };
                const onBlur = () => {
                    if (!fields.busType.el.value) {
                        FormValidator.showError('busType', fields.busType.error);
                    }
                };
                fields.busType.el.addEventListener('change', onChange);
                fields.busType.el.addEventListener('blur', onBlur);
                this.boundHandlers.transport.push(
                    { el: fields.busType.el, onChange },
                    { el: fields.busType.el, onBlur }
                );
            }

            // Numeric fields with min/max
            ['numBuses', 'numPassengers'].forEach(key => {
                const config = fields[key];
                if (!config.el) return;

                const onInput = (e) => {
                    let value = parseInt(e.target.value) || 0;
                    if (value > config.max) e.target.value = config.max;
                    if (value < 1 && e.target.value !== '') e.target.value = 1;
                    if (value >= config.min && value <= config.max) {
                        FormValidator.clearError(key);
                        config.el.classList.add('valid');
                    }
                };

                const onBlur = () => {
                    const value = parseInt(config.el.value) || 0;
                    if (!value || value < config.min) {
                        FormValidator.showError(key, config.error);
                    } else if (value > config.max) {
                        FormValidator.showError(key, config.maxError);
                    }
                };

                config.el.addEventListener('input', onInput);
                config.el.addEventListener('blur', onBlur);
                this.boundHandlers.transport.push(
                    { el: config.el, onInput },
                    { el: config.el, onBlur }
                );
            });

            // Date fields
            if (fields.pickupDate.el) {
                const onChange = () => {
                    const selected = new Date(fields.pickupDate.el.value);
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    if (selected < now) {
                        FormValidator.showError('pickupDate', 'Please select a future date');
                        fields.pickupDate.el.value = '';
                    } else {
                        FormValidator.clearError('pickupDate');
                        fields.pickupDate.el.classList.add('valid');
                    }
                };
                fields.pickupDate.el.addEventListener('change', onChange);
                this.boundHandlers.transport.push({ el: fields.pickupDate.el, onChange });
            }

            if (fields.dropoffDate.el) {
                const onChange = () => {
                    const pickDate = fields.pickupDate.el?.value;
                    const dropDate = fields.dropoffDate.el.value;
                    if (pickDate && dropDate && new Date(dropDate) < new Date(pickDate)) {
                        FormValidator.showError('dropoffDate', 'Drop-off date cannot be before pick-up date');
                        fields.dropoffDate.el.value = '';
                    } else {
                        FormValidator.clearError('dropoffDate');
                        fields.dropoffDate.el.classList.add('valid');
                    }
                };
                fields.dropoffDate.el.addEventListener('change', onChange);
                this.boundHandlers.transport.push({ el: fields.dropoffDate.el, onChange });
            }

            // Time fields
            ['pickupTime', 'dropoffTime'].forEach(key => {
                if (fields[key].el) {
                    const onChange = () => {
                        if (fields[key].el.value) {
                            FormValidator.clearError(key);
                            fields[key].el.classList.add('valid');
                        }
                    };
                    fields[key].el.addEventListener('change', onChange);
                    this.boundHandlers.transport.push({ el: fields[key].el, onChange });
                }
            });

            // Trip type
            if (fields.tripType.el) {
                const onChange = () => {
                    if (fields.tripType.el.value) {
                        FormValidator.clearError('tripType');
                        fields.tripType.el.classList.add('valid');
                    }
                };
                const onBlur = () => {
                    if (!fields.tripType.el.value) {
                        FormValidator.showError('tripType', fields.tripType.error);
                    }
                };
                fields.tripType.el.addEventListener('change', onChange);
                fields.tripType.el.addEventListener('blur', onBlur);
                this.boundHandlers.transport.push(
                    { el: fields.tripType.el, onChange },
                    { el: fields.tripType.el, onBlur }
                );
            }

            // Location fields
            ['pickupLocation', 'dropoffLocation'].forEach(key => {
                if (!fields[key].el) return;
                const config = fields[key];

                const onInput = () => {
                    if (config.el.value.trim().length > config.minLen) {
                        FormValidator.clearError(key);
                        config.el.classList.add('valid');
                    }
                };

                const onBlur = () => {
                    if (!config.el.value.trim()) {
                        FormValidator.showError(key, config.error);
                    } else if (config.el.value.trim().length < config.minLen) {
                        FormValidator.showError(key, config.shortError);
                    }
                };

                config.el.addEventListener('input', onInput);
                config.el.addEventListener('blur', onBlur);
                this.boundHandlers.transport.push(
                    { el: config.el, onInput },
                    { el: config.el, onBlur }
                );
            });
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

            const timeoutId = setTimeout(() => {
                this.flipCooldown = false;
            }, CONFIG.flipCooldown);
            this.timeouts.push(timeoutId);
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
            if (!this.drawer) return;

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

            const timeoutId = setTimeout(() => {
                const firstInput = this.drawer.querySelector('input:not([type="hidden"]), select, textarea');
                if (firstInput) firstInput.focus();
            }, 300);
            this.timeouts.push(timeoutId);
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
                cleaning: 'Cleaning Services Quote',
                transportation: 'Transportation Quote',
                landscaping: 'Landscaping Quote',
                maintenance: 'Maintenance Quote',
                bundle: 'Custom Bundle Quote'
            };

            if (this.drawerServiceName) {
                this.drawerServiceName.textContent = serviceNames[serviceType] || 'Request a Quote';
            }

            if (this.step1Title) {
                const titles = {
                    cleaning: 'Cleaning Service Details',
                    transportation: 'Transportation Details',
                    landscaping: 'Landscaping Details',
                    maintenance: 'Maintenance Details',
                    bundle: 'Build Your Bundle'
                };
                this.step1Title.textContent = titles[serviceType] || 'Service Details';
            }

            if (serviceType === 'transportation') {
                if (this.transportationFields) this.transportationFields.style.display = 'block';
            } else if (serviceType === 'bundle') {
                if (this.bundleFields) this.bundleFields.style.display = 'block';
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

            const timeoutId = setTimeout(() => {
                const firstInput = nextStepEl?.querySelector('input, select, textarea');
                if (firstInput) firstInput.focus();
            }, 100);
            this.timeouts.push(timeoutId);
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
                        const timeoutId = setTimeout(() => sizeSelector.classList.remove('has-error'), 3000);
                        this.timeouts.push(timeoutId);
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
            const originalText = submitBtn ? submitBtn.textContent : '';

            if (submitBtn) {
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
            }

            const form = this.drawer.querySelector('#quickQuoteForm');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Sanitize all inputs
            Object.keys(data).forEach(key => {
                if (typeof data[key] === 'string') {
                    data[key] = sanitizeInput(data[key]);
                }
            });

            if (this.selectedService === 'bundle') {
                const checkedServices = this.drawer.querySelectorAll('input[name="bundle_services"]:checked');
                data.bundle_services = Array.from(checkedServices).map(cb => cb.value).join(', ');
            }

            let toEmail = CONFIG.emails.default;
            if (['cleaning', 'landscaping', 'maintenance'].includes(this.selectedService)) {
                toEmail = CONFIG.emails.cleaning;
            } else if (this.selectedService === 'transportation') {
                toEmail = CONFIG.emails.transportation;
            } else if (this.selectedService === 'bundle') {
                const checkedServices = this.drawer.querySelectorAll('input[name="bundle_services"]:checked');
                const hasTransportation = Array.from(checkedServices).some(cb => cb.value === 'transportation');
                const hasCleaning = Array.from(checkedServices).some(cb => ['cleaning', 'landscaping', 'maintenance'].includes(cb.value));

                if (hasTransportation && !hasCleaning) {
                    toEmail = CONFIG.emails.transportation;
                } else if (hasCleaning) {
                    toEmail = CONFIG.emails.cleaning;
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
                await emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, templateParams);

                if (submitBtn) {
                    submitBtn.textContent = 'Quote Sent!';
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                }

                this.showToast('Quote request sent successfully! We\'ll be in touch within 2 hours.', 'success');

                const timeoutId = setTimeout(() => {
                    this.closeDrawer();
                    const resetTimeout = setTimeout(() => {
                        if (submitBtn) {
                            submitBtn.textContent = originalText;
                            submitBtn.style.background = '';
                            submitBtn.disabled = false;
                        }
                    }, 300);
                    this.timeouts.push(resetTimeout);
                }, 2000);
                this.timeouts.push(timeoutId);

            } catch (error) {
                if (submitBtn) {
                    submitBtn.textContent = 'Failed';
                    submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                }

                this.showToast('Failed to send quote. Please call us at ' + CONFIG.phone + '.', 'error');

                const timeoutId = setTimeout(() => {
                    if (submitBtn) {
                        submitBtn.textContent = originalText;
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                    }
                }, 3000);
                this.timeouts.push(timeoutId);
            }
        }

        buildEmailMessage(data) {
            const parts = [];
            parts.push(`Phone: ${data.phone || 'Not provided'}`);
            parts.push(`Company/School: ${data.company || 'Not provided'}`);

            const size = data.property_size || data.bundle_property_size;
            if (size) parts.push(`Property Size: ${size}`);
            if (data.bundle_services) parts.push(`Bundle Services: ${data.bundle_services}`);

            if (data.num_buses || data.bus_type) {
                parts.push('');
                parts.push('--- Transportation Details ---');
                parts.push(`Bus Type: ${data.bus_type || 'Not specified'}`);
                parts.push(`Number of Buses: ${data.num_buses || 'Not specified'}`);
                parts.push(`Number of Passengers: ${data.num_passengers || 'Not specified'}`);
                parts.push(`Pick-up Date: ${data.pickup_date || 'Not specified'}`);
                parts.push(`Pick-up Time: ${data.pickup_time || 'Not specified'}`);
                parts.push(`Drop-off Date: ${data.dropoff_date || 'Not specified'}`);
                parts.push(`Drop-off Time: ${data.dropoff_time || 'Not specified'}`);
                parts.push(`Trip Type: ${data.trip_type || 'Not specified'}`);
                parts.push(`Pick-up Location: ${data.pickup_location || 'Not specified'}`);
                parts.push(`Drop-off Location: ${data.dropoff_location || 'Not specified'}`);
            }

            if (data.message) {
                parts.push('');
                parts.push('--- Additional Notes ---');
                parts.push(data.message);
            }

            return parts.join('\n');
        }

        showToast(message, type = 'success') {
            const existingToast = document.querySelector('.quote-toast');
            if (existingToast) existingToast.remove();

            const toast = document.createElement('div');
            toast.className = `quote-toast toast-${type}`;
            toast.setAttribute('role', 'alert');

            const icon = document.createElement('i');
            icon.className = `fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}`;

            const span = document.createElement('span');
            span.textContent = message;

            toast.appendChild(icon);
            toast.appendChild(span);

            // Use CSS classes instead of cssText for CSP compliance
            toast.classList.add('toast-visible');
            if (type === 'success') {
                toast.classList.add('toast-success');
            } else {
                toast.classList.add('toast-error');
            }

            document.body.appendChild(toast);

            const timeoutId = setTimeout(() => {
                toast.classList.add('toast-hiding');
                const removeTimeout = setTimeout(() => {
                    if (toast.parentNode) toast.remove();
                }, 300);
                this.timeouts.push(removeTimeout);
            }, 5000);
            this.timeouts.push(timeoutId);
        }

        setupIntersectionObserver() {
            const observerOptions = {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px'
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        this.observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            this.cards.forEach(card => {
                this.observer.observe(card);
            });
        }

        animateEntry() {
            this.cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(60px)';

                const timeoutId = setTimeout(() => {
                    card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '1';
                    card.style.transform = '';
                }, index * CONFIG.staggerDelay);
                this.timeouts.push(timeoutId);
            });
        }

        destroy() {
            // Clear all timeouts
            this.timeouts.forEach(id => clearTimeout(id));
            this.timeouts = [];

            // Destroy particle system
            if (this.particleSystem) {
                this.particleSystem.destroy();
                this.particleSystem = null;
            }

            // Disconnect observer
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }

            // Remove all event listeners
            Object.keys(this.boundHandlers).forEach(key => {
                const handlers = this.boundHandlers[key];
                if (Array.isArray(handlers)) {
                    handlers.forEach(h => {
                        if (h.card) {
                            if (h.onClick) h.card.removeEventListener('click', h.onClick);
                            if (h.onKeyDown) h.card.removeEventListener('keydown', h.onKeyDown);
                        } else if (h.btn) {
                            h.btn.removeEventListener('click', h.onClick);
                        } else if (h.el && h.onClick) {
                            h.el.removeEventListener('click', h.onClick);
                        } else if (h.el && h.onChange) {
                            h.el.removeEventListener('change', h.onChange);
                        } else if (h.el && h.onInput) {
                            h.el.removeEventListener('input', h.onInput);
                        } else if (h.el && h.onBlur) {
                            h.el.removeEventListener('blur', h.onBlur);
                        } else if (h.option) {
                            if (h.onClick) h.option.removeEventListener('click', h.onClick);
                            if (h.onKeyDown) h.option.removeEventListener('keydown', h.onKeyDown);
                        } else if (h.cb && h.onChange) {
                            h.cb.removeEventListener('change', h.onChange);
                        } else if (h.field) {
                            if (h.onBlur) h.field.removeEventListener('blur', h.onBlur);
                            if (h.onInput) h.field.removeEventListener('input', h.onInput);
                        }
                    });
                } else if (handlers && handlers.el) {
                    if (handlers.onClick) handlers.el.removeEventListener('click', handlers.onClick);
                    if (handlers.onSubmit) handlers.el.removeEventListener('submit', handlers.onSubmit);
                } else if (handlers && handlers.bundleBtn && handlers.onClick) {
                    handlers.bundleBtn.removeEventListener('click', handlers.onClick);
                } else if (typeof handlers === 'function') {
                    document.removeEventListener('keydown', handlers);
                }
            });

            this.boundHandlers = {};
        }
    }

    // ─── Bootstrap ──────────────────────────────────────────────
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
})();