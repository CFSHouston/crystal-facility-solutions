/* ============================================
   CONTACT MODULE - PRODUCTION READY
   Crystal Facility Solutions
   ============================================ */

(function() {
    'use strict';

    // ─── Configuration ──────────────────────────────────────────
    const CONFIG = {
        emailjs: {
            publicKey: 'F2TtT04bpqE_Lew1Q',
            serviceId: 'service_jd5lns8',
            templateId: 'template_jvn3yzi'
        },
        routes: {
            transportation: { to_email: 'transportation@cfshouston.com', department: 'Transportation Team' },
            cleaning: { to_email: 'cleaning@cfshouston.com', department: 'Cleaning Team' },
            landscaping: { to_email: 'cleaning@cfshouston.com', department: 'Landscaping Team' },
            maintenance: { to_email: 'cleaning@cfshouston.com', department: 'Maintenance Team' },
            other: { to_email: 'info@cfshouston.com', department: 'General Inquiries' }
        },
        defaultRoute: { to_email: 'info@cfshouston.com', department: 'General Inquiries' }
    };

    // ─── Module State ───────────────────────────────────────────
    const state = {
        isInitialized: false,
        timeouts: [],
        boundHandlers: {},
        rafId: null,
        isTouchDevice: window.matchMedia('(pointer: coarse)').matches,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
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

    // ─── Initialization ─────────────────────────────────────────
    function init() {
        if (state.isInitialized) return;
        if (!document.querySelector('.contact-cinematic')) return;

        initEmailJS();
        initParticles();
        initMethodCards();
        initButton();
        initCharCount();
        initValidation();
        if (!state.isTouchDevice && !state.prefersReducedMotion) {
            initTilt();
        }

        state.isInitialized = true;
    }

    // ─── EmailJS ────────────────────────────────────────────────
    function initEmailJS() {
        if (typeof emailjs !== 'undefined') {
            emailjs.init({ publicKey: CONFIG.emailjs.publicKey });
        }
    }

    // ─── Particle System ────────────────────────────────────────
    function initParticles() {
        const canvas = document.getElementById('contactParticles');
        if (!canvas || state.prefersReducedMotion) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: false });
        let particles = [];
        let isActive = true;

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedY = Math.random() * -0.5 - 0.2;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.y += this.speedY;
                if (this.y < 0) {
                    this.y = canvas.height;
                    this.x = Math.random() * canvas.width;
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(124, 179, 66, ${this.opacity})`;
                ctx.fill();
            }
        }

        function createParticles() {
            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            if (!isActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            state.rafId = requestAnimationFrame(animate);
        }

        const onResize = () => resize();
        window.addEventListener('resize', onResize);

        resize();
        createParticles();
        animate();

        state.boundHandlers.particles = { onResize };
    }

    // ─── Method Cards ───────────────────────────────────────────
    function initMethodCards() {
        const cards = document.querySelectorAll('.method-card');
        if (!cards.length) return;

        const handlers = [];
        cards.forEach(card => {
            const onMouseMove = (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--x', x + '%');
                card.style.setProperty('--y', y + '%');
            };
            card.addEventListener('mousemove', onMouseMove);
            handlers.push({ card, onMouseMove });
        });

        state.boundHandlers.methodCards = handlers;
    }

    // ─── Button Ripple ──────────────────────────────────────────
    function initButton() {
        const btn = document.querySelector('.btn-cinematic');
        if (!btn) return;

        const onMouseMove = (e) => {
            const rect = btn.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            btn.style.setProperty('--x', x + '%');
            btn.style.setProperty('--y', y + '%');
        };

        btn.addEventListener('mousemove', onMouseMove);
        state.boundHandlers.button = { btn, onMouseMove };
    }

    // ─── Character Counter ──────────────────────────────────────
    function initCharCount() {
        const textarea = document.getElementById('cineMessage');
        const counter = document.querySelector('.char-counter');
        if (!textarea || !counter) return;

        const onInput = () => {
            const len = textarea.value.length;
            counter.textContent = len + '/300';
            counter.style.color = len > 250 ? '#f59e0b' : 'rgba(255,255,255,0.4)';
        };

        textarea.addEventListener('input', onInput);
        state.boundHandlers.charCount = { el: textarea, onInput };
    }

    // ─── Form Validation ────────────────────────────────────────
    function initValidation() {
        const contactForm = document.getElementById('cinematicForm');
        if (!contactForm) return;

        contactForm.setAttribute('novalidate', 'true');

        const formInputs = contactForm.querySelectorAll('input[required], select[required], textarea[required]');
        const submitBtn = contactForm.querySelector('.btn-cinematic');

        const validators = {
            cineName: { pattern: /^[a-zA-Z\s]{2,50}$/, message: 'Please enter a valid name (2-50 letters)' },
            cineEmail: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' },
            cineService: { validate: (val) => val !== '', message: 'Please select a service' },
            cineMessage: { pattern: /^[\s\S]{10,300}$/, message: 'Message must be 10-300 characters' }
        };

        const inputHandlers = [];

        formInputs.forEach(input => {
            const wrapper = input.closest('.input-glass');
            if (!wrapper) return;

            // RESTRUCTURE DOM: Create inner wrapper to isolate input height from error messages
            const label = wrapper.querySelector('label');
            const icon = wrapper.querySelector('i');
            const glow = wrapper.querySelector('.input-glow');

            // Clean up existing validation elements
            const existingIcon = wrapper.querySelector('.validation-icon');
            const existingError = wrapper.querySelector('.error-message-inline');
            if (existingIcon) existingIcon.remove();
            if (existingError) existingError.remove();

            // Create or reuse inner wrapper for input-related elements
            let innerWrapper = wrapper.querySelector('.input-glass-inner');
            if (!innerWrapper) {
                innerWrapper = document.createElement('div');
                innerWrapper.className = 'input-glass-inner';
                wrapper.insertBefore(innerWrapper, wrapper.firstChild);
            }
            innerWrapper.innerHTML = '';

            // Build DOM order inside inner wrapper: input → glow → icon → label → validation-icon
            innerWrapper.appendChild(input);
            if (glow) innerWrapper.appendChild(glow);
            if (icon) innerWrapper.appendChild(icon);
            if (label) innerWrapper.appendChild(label);

            // Create validation icon (inside inner wrapper)
            const iconDiv = document.createElement('div');
            iconDiv.className = 'validation-icon';
            const iconI = document.createElement('i');
            iconI.className = 'fas fa-check-circle';
            iconDiv.appendChild(iconI);
            innerWrapper.appendChild(iconDiv);

            // Create error element (inside outer wrapper, AFTER inner wrapper)
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message-inline';
            const errorSpan = document.createElement('span');
            errorDiv.appendChild(errorSpan);
            wrapper.appendChild(errorDiv);
            // Track value for floating label
            const updateValueState = () => {
                if (input.value.trim()) {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            };

            const onBlur = () => {
                updateValueState();
                validateField(input);
            };
            const onInput = () => {
                updateValueState();
                if (input.classList.contains('invalid')) validateField(input);
                if (input.id === 'cineMessage') updateCharCounter(input);
                if (submitBtn.classList.contains('error-state')) {
                    submitBtn.classList.remove('error-state');
                    resetSubmitButton(submitBtn);
                }
            };

            input.addEventListener('blur', onBlur);
            input.addEventListener('input', onInput);

            if (input.tagName === 'SELECT') {
                const onChange = () => {
                    updateValueState();
                    validateField(input);
                    if (submitBtn.classList.contains('error-state')) {
                        submitBtn.classList.remove('error-state');
                        resetSubmitButton(submitBtn);
                    }
                };
                input.addEventListener('change', onChange);
                inputHandlers.push({ input, onBlur, onInput, onChange });
            } else {
                inputHandlers.push({ input, onBlur, onInput });
            }
        });

        state.boundHandlers.formInputs = inputHandlers;

        // Form submit
        const onSubmit = (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFormSubmit(contactForm, formInputs, submitBtn);
        };
        contactForm.addEventListener('submit', onSubmit);
        state.boundHandlers.formSubmit = { el: contactForm, onSubmit };

        // Prevent click propagation from error elements
        const onClick = (e) => {
            if (e.target.closest('.error-message-inline') || e.target.closest('.form-summary-error')) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        };
        contactForm.addEventListener('click', onClick, true);
        state.boundHandlers.formClick = { el: contactForm, onClick };

        function validateField(input) {
            const wrapper = input.closest('.input-glass');
            if (!wrapper) return false;
            const errorDiv = wrapper.querySelector('.error-message-inline');
            const iconDiv = wrapper.querySelector('.validation-icon');
            const value = input.value.trim();
            const validator = validators[input.id];

            if (!value) {
                showError(input, 'This field is required');
                return false;
            }

            if (validator) {
                let isValid = true;
                if (validator.pattern) isValid = validator.pattern.test(value);
                else if (validator.validate) isValid = validator.validate(value);

                if (!isValid) {
                    showError(input, validator.message);
                    return false;
                }
            }

            showSuccess(input);
            return true;
        }

        function showError(input, message) {
            const wrapper = input.closest('.input-glass');
            if (!wrapper) return;
            const innerWrapper = wrapper.querySelector('.input-glass-inner');
            const errorDiv = wrapper.querySelector('.error-message-inline');
            const iconDiv = innerWrapper ? innerWrapper.querySelector('.validation-icon') : null;

            input.classList.remove('valid');
            input.classList.add('invalid');
            if (innerWrapper) innerWrapper.setAttribute('data-valid', 'false');
            if (errorDiv) {
                const span = errorDiv.querySelector('span');
                if (span) span.textContent = message;
                errorDiv.classList.add('visible');
            }
            if (iconDiv) {
                const icon = iconDiv.querySelector('i');
                if (icon) icon.className = 'fas fa-exclamation-circle';
            }
        }

        function showSuccess(input) {
            const wrapper = input.closest('.input-glass');
            if (!wrapper) return;
            const innerWrapper = wrapper.querySelector('.input-glass-inner');
            const errorDiv = wrapper.querySelector('.error-message-inline');
            const iconDiv = innerWrapper ? innerWrapper.querySelector('.validation-icon') : null;

            input.classList.remove('invalid');
            input.classList.add('valid');
            if (innerWrapper) innerWrapper.setAttribute('data-valid', 'true');
            if (errorDiv) errorDiv.classList.remove('visible');
            if (iconDiv) {
                const icon = iconDiv.querySelector('i');
                if (icon) icon.className = 'fas fa-check-circle';
            }
        }

        function updateCharCounter(input) {
            const counter = input.parentElement.querySelector('.char-counter');
            if (!counter) return;
            const current = input.value.length;
            const max = 300;
            counter.textContent = current + '/' + max;
            if (current > 300) counter.style.color = '#ef4444';
            else if (current > 250) counter.style.color = '#f59e0b';
            else counter.style.color = 'rgba(255,255,255,0.4)';
        }
    }

    function resetSubmitButton(btn) {
        btn.innerHTML = '';
        const spanText = document.createElement('span');
        spanText.className = 'btn-text';
        spanText.textContent = 'Start Conversation';
        const spanIcon = document.createElement('span');
        spanIcon.className = 'btn-icon';
        const icon = document.createElement('i');
        icon.className = 'fas fa-paper-plane';
        spanIcon.appendChild(icon);
        const particles = document.createElement('div');
        particles.className = 'btn-particles';
        btn.appendChild(spanText);
        btn.appendChild(spanIcon);
        btn.appendChild(particles);
    }

    // ─── Form Submission ────────────────────────────────────────
    function handleFormSubmit(contactForm, formInputs, submitBtn) {
        if (typeof emailjs === 'undefined') {
            showFormError(contactForm, submitBtn, 'Email service not available. Please contact us directly.');
            return;
        }

        let isValid = true;
        let firstError = null;

        formInputs.forEach(input => {
            // Trigger validation
            input.dispatchEvent(new Event('blur'));
            if (input.classList.contains('invalid')) {
                isValid = false;
                if (!firstError) firstError = input;
            }
        });

        if (isValid) {
            const name = sanitizeInput(document.getElementById('cineName').value);
            const email = sanitizeInput(document.getElementById('cineEmail').value);
            const service = sanitizeInput(document.getElementById('cineService').value);
            const message = sanitizeInput(document.getElementById('cineMessage').value);

            const route = CONFIG.routes[service] || CONFIG.defaultRoute;
            const serviceLabel = service.charAt(0).toUpperCase() + service.slice(1);

            const templateParams = {
                to_email: route.to_email,
                to_name: route.department,
                from_name: name,
                from_email: email,
                service: serviceLabel,
                message: message,
                time: new Date().toLocaleString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
                }),
                reply_to: email
            };

            submitBtn.disabled = true;
            setButtonLoading(submitBtn);

            emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, templateParams)
                .then(() => {
                    showFormSuccess(contactForm, submitBtn, route.department);
                })
                .catch(() => {
                    showFormError(contactForm, submitBtn, 'Failed to send message. Please email us directly at ' + route.to_email);
                });
        } else {
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            showValidationSummary(contactForm, submitBtn);
        }
    }

    function setButtonLoading(btn) {
        btn.innerHTML = '';
        const spanText = document.createElement('span');
        spanText.className = 'btn-text';
        spanText.textContent = 'Sending...';
        const spanIcon = document.createElement('span');
        spanIcon.className = 'btn-icon';
        const icon = document.createElement('i');
        icon.className = 'fas fa-spinner fa-spin';
        spanIcon.appendChild(icon);
        btn.appendChild(spanText);
        btn.appendChild(spanIcon);
    }

    function showFormSuccess(contactForm, submitBtn, department) {
        const formGlass = contactForm.closest('.form-glass');
        if (!formGlass) return;

        const overlay = document.createElement('div');
        overlay.className = 'form-success-overlay';

        const content = document.createElement('div');
        content.className = 'success-content';

        const iconDiv = document.createElement('div');
        iconDiv.className = 'success-icon';
        const icon = document.createElement('i');
        icon.className = 'fas fa-check-circle';
        iconDiv.appendChild(icon);

        const h3 = document.createElement('h3');
        h3.textContent = 'Message Sent!';

        const p = document.createElement('p');
        p.textContent = "We've received your inquiry.";

        const small = document.createElement('small');
        small.textContent = 'Routed to: ' + department;
        small.style.cssText = 'opacity: 0.7; margin-top: 0.5rem; display: block;';

        content.appendChild(iconDiv);
        content.appendChild(h3);
        content.appendChild(p);
        content.appendChild(small);
        overlay.appendChild(content);

        formGlass.style.position = 'relative';
        formGlass.appendChild(overlay);

        const timeoutId = setTimeout(() => {
            contactForm.reset();
            formInputsReset(contactForm);
            if (overlay.parentNode) overlay.remove();
            submitBtn.disabled = false;
            resetSubmitButton(submitBtn);
        }, 3000);
        state.timeouts.push(timeoutId);
    }

    function showFormError(contactForm, submitBtn, message) {
        submitBtn.disabled = false;
        submitBtn.classList.add('error-state');

        const spanText = document.createElement('span');
        spanText.className = 'btn-text';
        spanText.textContent = 'Failed to Send';
        const spanIcon = document.createElement('span');
        spanIcon.className = 'btn-icon';
        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-triangle';
        spanIcon.appendChild(icon);
        submitBtn.innerHTML = '';
        submitBtn.appendChild(spanText);
        submitBtn.appendChild(spanIcon);

        const existing = contactForm.querySelector('.form-summary-error');
        if (existing) existing.remove();

        const summary = document.createElement('div');
        summary.className = 'form-summary-error';
        const span = document.createElement('span');
        span.textContent = message;
        summary.appendChild(span);
        contactForm.insertBefore(summary, contactForm.firstChild);

        requestAnimationFrame(() => summary.classList.add('visible'));
    }

    function showValidationSummary(contactForm, submitBtn) {
        const existing = contactForm.querySelector('.form-summary-error');
        if (existing) existing.remove();

        const summary = document.createElement('div');
        summary.className = 'form-summary-error';
        const span = document.createElement('span');
        span.textContent = 'Please correct the errors below.';
        summary.appendChild(span);
        contactForm.insertBefore(summary, contactForm.firstChild);

        requestAnimationFrame(() => summary.classList.add('visible'));

        const timeoutId = setTimeout(() => {
            summary.classList.remove('visible');
            const removeTimeout = setTimeout(() => {
                if (summary.parentNode) summary.remove();
            }, 300);
            state.timeouts.push(removeTimeout);
        }, 5000);
        state.timeouts.push(timeoutId);

        submitBtn.classList.add('error-state');
        const spanText = document.createElement('span');
        spanText.className = 'btn-text';
        spanText.textContent = 'Please Fix Errors';
        const spanIcon = document.createElement('span');
        spanIcon.className = 'btn-icon';
        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-triangle';
        spanIcon.appendChild(icon);
        submitBtn.innerHTML = '';
        submitBtn.appendChild(spanText);
        submitBtn.appendChild(spanIcon);
    }

    function formInputsReset(contactForm) {
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(i => {
            i.classList.remove('valid', 'invalid');
            const wrapper = i.closest('.input-glass');
            const innerWrapper = wrapper?.querySelector('.input-glass-inner');
            const icon = innerWrapper ? innerWrapper.querySelector('.validation-icon') : wrapper?.querySelector('.validation-icon');
            if (icon) icon.style.opacity = '0';
            if (innerWrapper) innerWrapper.removeAttribute('data-valid');
        });
    }

    // ─── 3D Tilt Effect ─────────────────────────────────────────
    function initTilt() {
        const form = document.querySelector('.form-glass');
        const container = document.querySelector('.form-floating-container');
        if (!form || !container) return;

        const onMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            form.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(20px)`;
        };

        const onMouseLeave = () => {
            form.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateZ(0)';
        };

        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseleave', onMouseLeave);

        state.boundHandlers.tilt = { container, onMouseMove, onMouseLeave };
    }

    // ─── Cleanup / Destroy ──────────────────────────────────────
    function destroy() {
        if (!state.isInitialized) return;

        // Stop particles
        if (state.rafId) {
            cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }

        // Clear timeouts
        state.timeouts.forEach(id => clearTimeout(id));
        state.timeouts = [];

        // Remove event listeners
        if (state.boundHandlers.particles) {
            window.removeEventListener('resize', state.boundHandlers.particles.onResize);
        }

        if (state.boundHandlers.methodCards) {
            state.boundHandlers.methodCards.forEach(h => {
                h.card.removeEventListener('mousemove', h.onMouseMove);
            });
        }

        if (state.boundHandlers.button) {
            state.boundHandlers.button.btn.removeEventListener('mousemove', state.boundHandlers.button.onMouseMove);
        }

        if (state.boundHandlers.charCount) {
            state.boundHandlers.charCount.el.removeEventListener('input', state.boundHandlers.charCount.onInput);
        }

        if (state.boundHandlers.formInputs) {
            state.boundHandlers.formInputs.forEach(h => {
                h.input.removeEventListener('blur', h.onBlur);
                h.input.removeEventListener('input', h.onInput);
                if (h.onChange) h.input.removeEventListener('change', h.onChange);
            });
        }

        if (state.boundHandlers.formSubmit) {
            state.boundHandlers.formSubmit.el.removeEventListener('submit', state.boundHandlers.formSubmit.onSubmit);
        }

        if (state.boundHandlers.formClick) {
            state.boundHandlers.formClick.el.removeEventListener('click', state.boundHandlers.formClick.onClick, true);
        }

        if (state.boundHandlers.tilt) {
            state.boundHandlers.tilt.container.removeEventListener('mousemove', state.boundHandlers.tilt.onMouseMove);
            state.boundHandlers.tilt.container.removeEventListener('mouseleave', state.boundHandlers.tilt.onMouseLeave);
        }

        state.boundHandlers = {};
        state.isInitialized = false;
    }

    // ─── Bootstrap ──────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();