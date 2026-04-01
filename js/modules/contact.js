/* ============================================
   CINEMATIC CONTACT MODULE (FIXED v5 - NO ICONS)
   ============================================ */

(function() {
    'use strict';

    // Particles
    function initParticles() {
        const canvas = document.getElementById('contactParticles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];

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

        function init() {
            resize();
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        init();
        animate();
    }

    // Mouse tracking for method cards
    function initMethodCards() {
        document.querySelectorAll('.method-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--x', x + '%');
                card.style.setProperty('--y', y + '%');
            });
        });
    }

    // Button ripple
    function initButton() {
        const btn = document.querySelector('.btn-cinematic');
        if (!btn) return;

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            btn.style.setProperty('--x', x + '%');
            btn.style.setProperty('--y', y + '%');
        });
    }

    // Character count
    function initCharCount() {
        const textarea = document.getElementById('cineMessage');
        const counter = document.querySelector('.char-counter');
        if (!textarea || !counter) return;

        textarea.addEventListener('input', () => {
            const len = textarea.value.length;
            counter.textContent = `${len}/300`;
            counter.style.color = len > 250 ? '#f59e0b' : 'rgba(255,255,255,0.4)';
        });
    }

    // ============================================
    // INLINE FORM VALIDATION (FIXED v5 - NO ICONS)
    // ============================================

    function initValidation() {
        const contactForm = document.getElementById('cinematicForm');
        if (!contactForm) return;

        // Disable HTML5 validation
        contactForm.setAttribute('novalidate', 'true');

        const formInputs = contactForm.querySelectorAll('input[required], select[required], textarea[required]');
        const submitBtn = contactForm.querySelector('.btn-cinematic');

        // Validation rules
        const validators = {
            cineName: {
                pattern: /^[a-zA-Z\s]{2,50}$/,
                message: 'Please enter a valid name (2-50 letters)'
            },
            cineEmail: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            cineService: {
                validate: (val) => val !== '',
                message: 'Please select a service'
            },
            cineMessage: {
                pattern: /^[\s\S]{10,300}$/,
                message: 'Message must be 10-300 characters'
            }
        };

        // Setup each field
        formInputs.forEach(input => {
            const wrapper = input.closest('.input-glass');
            if (!wrapper) return;

            // Remove any existing validation elements first
            const existingIcon = wrapper.querySelector('.validation-icon');
            const existingError = wrapper.querySelector('.error-message-inline');
            if (existingIcon) existingIcon.remove();
            if (existingError) existingError.remove();

            // Create validation icon for INSIDE the input (checkmark/X) - KEEP THIS ONE
            const iconDiv = document.createElement('div');
            iconDiv.className = 'validation-icon';
            iconDiv.innerHTML = '<i class="fas fa-check-circle"></i>';
            input.insertAdjacentElement('afterend', iconDiv);

            // Create error element - NO ICON, just text
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message-inline';
            errorDiv.innerHTML = '<span></span>'; // Just text, no icon
            wrapper.appendChild(errorDiv);

            // Stop ALL events on error message
            ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup'].forEach(eventType => {
                errorDiv.addEventListener(eventType, function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                }, true);
            });

            // Validate on blur
            input.addEventListener('blur', function() {
                validateField(input);
            });

            // Clear error on input and reset button
            input.addEventListener('input', function() {
                if (input.classList.contains('invalid')) {
                    validateField(input);
                }
                updateCharCounter(input);

                // Reset button to normal state when user types
                if (submitBtn.classList.contains('error-state')) {
                    submitBtn.classList.remove('error-state');
                    submitBtn.innerHTML = '<span class="btn-text">Start Conversation</span><span class="btn-icon"><i class="fas fa-paper-plane"></i></span><div class="btn-particles"></div>';
                }
            });

            // For select
            if (input.tagName === 'SELECT') {
                input.addEventListener('change', function() {
                    validateField(input);
                    // Reset button on change
                    if (submitBtn.classList.contains('error-state')) {
                        submitBtn.classList.remove('error-state');
                        submitBtn.innerHTML = '<span class="btn-text">Start Conversation</span><span class="btn-icon"><i class="fas fa-paper-plane"></i></span><div class="btn-particles"></div>';
                    }
                });
            }
        });

        // Validate single field
        function validateField(input) {
            const wrapper = input.closest('.input-glass');
            if (!wrapper) return false;
            const errorDiv = wrapper.querySelector('.error-message-inline');
            const iconDiv = wrapper.querySelector('.validation-icon');
            const value = input.value.trim();
            const validator = validators[input.id];

            // Required check
            if (!value) {
                showError(input, 'This field is required');
                return false;
            }

            // Pattern validation
            if (validator) {
                let isValid = true;
                if (validator.pattern) {
                    isValid = validator.pattern.test(value);
                } else if (validator.validate) {
                    isValid = validator.validate(value);
                }

                if (!isValid) {
                    showError(input, validator.message);
                    return false;
                }
            }

            // Valid
            showSuccess(input);
            return true;
        }

        function showError(input, message) {
            const wrapper = input.closest('.input-glass');
            if (!wrapper) return;
            const errorDiv = wrapper.querySelector('.error-message-inline');
            const iconDiv = wrapper.querySelector('.validation-icon');

            input.classList.remove('valid');
            input.classList.add('invalid');
            if (errorDiv) {
                const span = errorDiv.querySelector('span');
                if (span) span.textContent = message;
                errorDiv.classList.add('visible');
            }
            if (iconDiv) {
                iconDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                iconDiv.style.opacity = '1';
                iconDiv.style.color = '#ff6b6b';
            }
        }

        function showSuccess(input) {
            const wrapper = input.closest('.input-glass');
            if (!wrapper) return;
            const errorDiv = wrapper.querySelector('.error-message-inline');
            const iconDiv = wrapper.querySelector('.validation-icon');

            input.classList.remove('invalid');
            input.classList.add('valid');
            if (errorDiv) errorDiv.classList.remove('visible');
            if (iconDiv) {
                iconDiv.innerHTML = '<i class="fas fa-check-circle"></i>';
                iconDiv.style.opacity = '1';
                iconDiv.style.color = 'var(--cfs-green, #7cb342)';
            }
        }

        // Character counter
        function updateCharCounter(input) {
            if (input.id !== 'cineMessage') return;
            const counter = input.parentElement.querySelector('.char-counter');
            if (!counter) return;
            const current = input.value.length;
            const max = 300;
            counter.textContent = current + '/' + max;
            if (current > 250) counter.style.color = '#f59e0b';
            if (current > 300) counter.style.color = '#ef4444';
            if (current <= 250) counter.style.color = 'rgba(255,255,255,0.4)';
        }

        // Form submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();

            let isValid = true;
            let firstError = null;

            formInputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                    if (!firstError) firstError = input;
                }
            });

            if (isValid) {
                // Success - show overlay
                const overlay = document.createElement('div');
                overlay.className = 'form-success-overlay';
                overlay.innerHTML = `
                    <div class="success-content">
                        <div class="success-icon"><i class="fas fa-check-circle"></i></div>
                        <h3>Message Sent!</h3>
                        <p>We'll get back to you very soon.</p>
                    </div>
                `;
                const formGlass = contactForm.closest('.form-glass');
                formGlass.style.position = 'relative';
                formGlass.appendChild(overlay);

                setTimeout(() => {
                    contactForm.reset();
                    formInputs.forEach(i => {
                        i.classList.remove('valid', 'invalid');
                        const icon = i.closest('.input-glass').querySelector('.validation-icon');
                        if (icon) icon.style.opacity = '0';
                    });
                    overlay.remove();
                    submitBtn.classList.remove('error-state');
                    submitBtn.innerHTML = '<span class="btn-text">Start Conversation</span><span class="btn-icon"><i class="fas fa-paper-plane"></i></span><div class="btn-particles"></div>';
                }, 3000);

            } else {
                // Error - scroll to first error
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }

                // Show summary - NO ICON
                const existing = contactForm.querySelector('.form-summary-error');
                if (existing) existing.remove();

                const summary = document.createElement('div');
                summary.className = 'form-summary-error';
                summary.innerHTML = '<span>Please correct the errors below.</span>'; // No icon
                contactForm.insertBefore(summary, contactForm.firstChild);

                // Stop ALL events on summary
                ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup'].forEach(eventType => {
                    summary.addEventListener(eventType, function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        return false;
                    }, true);
                });

                requestAnimationFrame(() => summary.classList.add('visible'));

                setTimeout(() => {
                    summary.classList.remove('visible');
                    setTimeout(() => summary.remove(), 300);
                }, 5000);

                // Update button
                submitBtn.classList.add('error-state');
                submitBtn.innerHTML = '<span class="btn-text">Please Fix Errors</span><span class="btn-icon"><i class="fas fa-exclamation-triangle"></i></span>';
            }
        });

        // Global capture on form to stop any click propagation from error elements
        contactForm.addEventListener('click', function(e) {
            if (e.target.closest('.error-message-inline') || e.target.closest('.form-summary-error')) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        }, true);
    }

    // 3D tilt for form
    function initTilt() {
        const form = document.querySelector('.form-glass');
        if (!form || window.matchMedia('(pointer: coarse)').matches) return;

        const container = document.querySelector('.form-floating-container');

        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            form.style.transform = `
                perspective(1000px)
                rotateY(${x * 10}deg)
                rotateX(${-y * 10}deg)
                translateZ(20px)
            `;
        });

        container.addEventListener('mouseleave', () => {
            form.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateZ(0)';
        });
    }

    function init() {
        initParticles();
        initMethodCards();
        initButton();
        initCharCount();
        initValidation();
        initTilt();
    }

    document.readyState === 'loading' 
        ? document.addEventListener('DOMContentLoaded', init)
        : init();
})();