/* ============================================
   CINEMATIC CONTACT MODULE (v6 - EMAILJS ROUTING)
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // EMAIL CONFIGURATION - UPDATE THESE VALUES
    // ============================================
    
    const EMAIL_CONFIG = {
        // EmailJS Configuration - Replace with your actual credentials
        publicKey: 'F2TtT04bpqE_Lew1Q',      // Your EmailJS public key
        serviceId: 'service_jd5lns8',       // Your EmailJS service ID
        templateId: 'template_jvn3yzi',     // Your EmailJS template ID
        
        // Email Routing Rules
        routes: {
            transportation: {
                to_email: 'transportation@cfshouston.com',
                department: 'Transportation Team'
            },
            cleaning: {
                to_email: 'cleaning@cfshouston.com', 
                department: 'Cleaning Team'
            },
            landscaping: {
                to_email: 'cleaning@cfshouston.com',
                department: 'Landscaping Team'
            },
            maintenance: {
                to_email: 'cleaning@cfshouston.com',
                department: 'Maintenance Team'
            },
            maintenance: {
                to_email: 'info@cfshouston.com',
                department: 'Contact Team'
            }
        },
        
        // Fallback for any other service
        defaultRoute: {
            to_email: 'info@cfshouston.com',
            department: 'General Inquiries'
        }
    };

    // ============================================
    // INITIALIZE EMAILJS
    // ============================================
    
    if (typeof emailjs !== 'undefined') {
        emailjs.init({
            publicKey: EMAIL_CONFIG.publicKey,
        });
    } else {
        console.warn('EmailJS SDK not loaded');
    }

    // ============================================
    // PARTICLES ANIMATION
    // ============================================

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

    // ============================================
    // MOUSE TRACKING FOR METHOD CARDS
    // ============================================

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

    // ============================================
    // BUTTON RIPPLE EFFECT
    // ============================================

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

    // ============================================
    // CHARACTER COUNTER
    // ============================================

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
    // FORM VALIDATION
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

            // Create validation icon
            const iconDiv = document.createElement('div');
            iconDiv.className = 'validation-icon';
            iconDiv.innerHTML = '<i class="fas fa-check-circle"></i>';
            input.insertAdjacentElement('afterend', iconDiv);

            // Create error element
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message-inline';
            errorDiv.innerHTML = '<span></span>';
            wrapper.appendChild(errorDiv);

            // Stop events on error message
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

            // For select dropdown
            if (input.tagName === 'SELECT') {
                input.addEventListener('change', function() {
                    validateField(input);
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

        // Character counter update
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

        // ============================================
        // FORM SUBMISSION WITH EMAILJS ROUTING
        // ============================================

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Check if EmailJS is loaded
            if (typeof emailjs === 'undefined') {
                alert('Email service not available. Please contact us directly.');
                return;
            }

            let isValid = true;
            let firstError = null;

            // Validate all fields
            formInputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                    if (!firstError) firstError = input;
                }
            });

            if (isValid) {
                // Get form values
                const name = document.getElementById('cineName').value.trim();
                const email = document.getElementById('cineEmail').value.trim();
                const service = document.getElementById('cineService').value;
                const message = document.getElementById('cineMessage').value.trim();

                // Determine routing based on service
                const route = EMAIL_CONFIG.routes[service] || EMAIL_CONFIG.defaultRoute;
                const serviceLabel = service.charAt(0).toUpperCase() + service.slice(1);

                // Prepare template parameters for EmailJS
                const templateParams = {
                    to_email: route.to_email,
                    to_name: route.department,
                    from_name: name,
                    from_email: email,
                    service: serviceLabel,
                    message: message,
                    time: new Date().toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZoneName: 'short'
                    }),
                    reply_to: email
                };

                // Show loading state
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="btn-text">Sending...</span><span class="btn-icon"><i class="fas fa-spinner fa-spin"></i></span>';

                // Send via EmailJS
                emailjs.send(EMAIL_CONFIG.serviceId, EMAIL_CONFIG.templateId, templateParams)
                    .then(function(response) {
                        console.log('SUCCESS!', response.status, response.text);
                        
                        // Success overlay
                        const overlay = document.createElement('div');
                        overlay.className = 'form-success-overlay';
                        overlay.innerHTML = `
                            <div class="success-content">
                                <div class="success-icon"><i class="fas fa-check-circle"></i></div>
                                <h3>Message Sent!</h3>
                                <p>We've received your inquiry.</p>
                                <small style="opacity: 0.7; margin-top: 0.5rem; display: block;">
                                    Routed to: ${route.department}
                                </small>
                            </div>
                        `;
                        const formGlass = contactForm.closest('.form-glass');
                        formGlass.style.position = 'relative';
                        formGlass.appendChild(overlay);

                        // Reset form after 3 seconds
                        setTimeout(() => {
                            contactForm.reset();
                            formInputs.forEach(i => {
                                i.classList.remove('valid', 'invalid');
                                const icon = i.closest('.input-glass').querySelector('.validation-icon');
                                if (icon) icon.style.opacity = '0';
                            });
                            overlay.remove();
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = '<span class="btn-text">Start Conversation</span><span class="btn-icon"><i class="fas fa-paper-plane"></i></span><div class="btn-particles"></div>';
                        }, 3000);

                    }, function(error) {
                        console.error('FAILED...', error);
                        
                        // Show error state
                        submitBtn.disabled = false;
                        submitBtn.classList.add('error-state');
                        submitBtn.innerHTML = '<span class="btn-text">Failed to Send</span><span class="btn-icon"><i class="fas fa-exclamation-triangle"></i></span>';

                        // Show error summary
                        const existing = contactForm.querySelector('.form-summary-error');
                        if (existing) existing.remove();

                        const summary = document.createElement('div');
                        summary.className = 'form-summary-error';
                        summary.innerHTML = '<span>Failed to send message. Please email us directly at ' + route.to_email + '</span>';
                        contactForm.insertBefore(summary, contactForm.firstChild);

                        ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup'].forEach(eventType => {
                            summary.addEventListener(eventType, function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                e.stopImmediatePropagation();
                                return false;
                            }, true);
                        });

                        requestAnimationFrame(() => summary.classList.add('visible'));
                    });

            } else {
                // Validation Error - scroll to first error
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }

                // Show error summary
                const existing = contactForm.querySelector('.form-summary-error');
                if (existing) existing.remove();

                const summary = document.createElement('div');
                summary.className = 'form-summary-error';
                summary.innerHTML = '<span>Please correct the errors below.</span>';
                contactForm.insertBefore(summary, contactForm.firstChild);

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

                // Update button to error state
                submitBtn.classList.add('error-state');
                submitBtn.innerHTML = '<span class="btn-text">Please Fix Errors</span><span class="btn-icon"><i class="fas fa-exclamation-triangle"></i></span>';
            }
        });

        // Global capture on form to stop click propagation from error elements
        contactForm.addEventListener('click', function(e) {
            if (e.target.closest('.error-message-inline') || e.target.closest('.form-summary-error')) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        }, true);
    }

    // ============================================
    // 3D TILT EFFECT FOR FORM
    // ============================================

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

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        initParticles();
        initMethodCards();
        initButton();
        initCharCount();
        initValidation();
        initTilt();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();