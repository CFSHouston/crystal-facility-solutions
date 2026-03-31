/* ============================================
   CRYSTAL FACILITY SOLUTIONS - FORMS MODULE
   Modern Event Listeners, Async/Await, No Window Globals
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // PRIVATE STATE
    // ============================================
    const state = {
        validators: {
            name: (name) => /^[a-zA-Z\s]{2,}$/.test(name.trim()),
            email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
            phone: (phone) => phone.replace(/\D/g, '').length >= 10,
            sqFt: (sqFt) => /^\d+(\.\d+)?$/.test(sqFt.trim()) && parseFloat(sqFt) > 0,
            required: (value) => value.trim().length > 0,
            minLength: (value, min) => value.trim().length >= min
        },
        errorMessages: {
            name: 'Please enter a valid name (letters only, min 2 characters)',
            email: 'Please enter a valid email address',
            phone: 'Please enter a valid phone number (min 10 digits)',
            company: 'Please enter a company/school name (min 2 characters)',
            propertyType: 'Please select a property type',
            propertySize: 'Please enter a valid square footage (numbers/decimals only)',
            frequency: 'Please select service frequency',
            rating: 'Please select a rating',
            userType: 'Please select user type',
            serviceUsed: 'Please select service used',
            feedback: 'Please enter your feedback'
        }
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        initFeedbackForm();
        initQuoteForm();
        initStarRating();
        initPropertySizeInput();
    }

    // ============================================
    // PROPERTY SIZE - DECIMAL VALIDATION (like phone)
    // ============================================
    function initPropertySizeInput() {
        const propertySizeInput = document.getElementById('quotePropertySize');
        if (!propertySizeInput) return;

        propertySizeInput.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value && !state.validators.sqFt(value)) {
                showQuoteFieldError(this, state.errorMessages.propertySize);
            } else if (value) {
                showFieldSuccess(this);
            }
        });

        propertySizeInput.addEventListener('input', function() {
            clearQuoteFieldError(this);
        });
    }

    // ============================================
    // STAR RATING
    // ============================================
    function initStarRating() {
        const starContainer = document.getElementById('starContainer');
        if (!starContainer) return;
        
        starContainer.addEventListener('click', handleStarClick);
        starContainer.addEventListener('keydown', handleStarKeydown);
    }

    function handleStarClick(e) {
        const star = e.target.closest('.star');
        if (!star) return;
        
        const rating = parseInt(star.dataset.rating);
        updateStarVisuals(rating);
        clearRatingError();
    }

    function handleStarKeydown(e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        
        const star = e.target.closest('.star');
        if (!star) return;
        
        e.preventDefault();
        const rating = parseInt(star.dataset.rating);
        updateStarVisuals(rating);
        clearRatingError();
    }

    function updateStarVisuals(rating) {
        const starContainer = document.getElementById('starContainer');
        const ratingInput = document.getElementById('ratingInput');
        const stars = starContainer.querySelectorAll('.star');
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
                star.style.color = '#ffc107';
            } else {
                star.classList.remove('active');
                star.style.color = '#ddd';
            }
            star.setAttribute('aria-checked', index < rating ? 'true' : 'false');
        });

        if (ratingInput) {
            ratingInput.value = rating;
        }
    }

    // ============================================
    // FEEDBACK FORM
    // ============================================
    function initFeedbackForm() {
        const feedbackForm = document.getElementById('feedbackForm');
        if (!feedbackForm) return;

        setupFeedbackRealTimeValidation();
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }

    function setupFeedbackRealTimeValidation() {
        // Name field
        const nameField = document.getElementById('firstName');
        if (nameField) {
            nameField.addEventListener('blur', function() {
                const value = this.value.trim();
                if (value && !state.validators.name(value)) {
                    showFeedbackError(this, state.errorMessages.name);
                } else if (value) {
                    showFieldSuccess(this);
                }
            });

            nameField.addEventListener('input', function() {
                clearFeedbackError(this);
            });
        }

        // Email field
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('blur', function() {
                const value = this.value.trim();
                if (value && !state.validators.email(value)) {
                    showFeedbackError(this, state.errorMessages.email);
                } else if (value) {
                    showFieldSuccess(this);
                }
            });

            emailField.addEventListener('input', function() {
                clearFeedbackError(this);
            });
        }

        // User type select
        const userTypeField = document.getElementById('userType');
        if (userTypeField) {
            userTypeField.addEventListener('change', function() {
                if (this.value) {
                    showFieldSuccess(this);
                } else {
                    showFeedbackError(this, state.errorMessages.userType);
                }
            });
        }

        // Service used select
        const serviceUsedField = document.getElementById('serviceUsed');
        if (serviceUsedField) {
            serviceUsedField.addEventListener('change', function() {
                if (this.value) {
                    showFieldSuccess(this);
                } else {
                    showFeedbackError(this, state.errorMessages.serviceUsed);
                }
            });
        }

        // Feedback textarea
        const feedbackField = document.getElementById('feedback');
        if (feedbackField) {
            feedbackField.addEventListener('blur', function() {
                const value = this.value.trim();
                if (value) {
                    showFieldSuccess(this);
                }
            });

            feedbackField.addEventListener('input', function() {
                if (this.value.trim()) {
                    clearFeedbackError(this);
                }
            });
        }

        // Rating
        const starContainer = document.getElementById('starContainer');
        if (starContainer) {
            starContainer.addEventListener('click', clearRatingError);
        }
    }

    async function handleFeedbackSubmit(e) {
        e.preventDefault();
        const form = e.target;

        const nameField = form.querySelector('#firstName');
        const emailField = form.querySelector('#email');
        const userTypeField = form.querySelector('#userType');
        const serviceUsedField = form.querySelector('#serviceUsed');
        const feedbackField = form.querySelector('#feedback');
        const ratingInput = document.getElementById('ratingInput');

        const name = nameField?.value.trim() || '';
        const email = emailField?.value.trim() || '';
        const userType = userTypeField?.value || '';
        const serviceUsed = serviceUsedField?.value || '';
        const feedback = feedbackField?.value.trim() || '';
        const rating = ratingInput?.value || '0';

        clearAllFeedbackErrors(form);

        let hasErrors = false;

        // Validate name
        if (!name) {
            showFeedbackError(nameField, 'Please enter your name');
            hasErrors = true;
        } else if (!state.validators.name(name)) {
            showFeedbackError(nameField, state.errorMessages.name);
            hasErrors = true;
        } else {
            showFieldSuccess(nameField);
        }

        // Validate email
        if (!email) {
            showFeedbackError(emailField, 'Please enter your email address');
            hasErrors = true;
        } else if (!state.validators.email(email)) {
            showFeedbackError(emailField, state.errorMessages.email);
            hasErrors = true;
        } else {
            showFieldSuccess(emailField);
        }

        // Validate user type
        if (!userType) {
            showFeedbackError(userTypeField, state.errorMessages.userType);
            hasErrors = true;
        } else {
            showFieldSuccess(userTypeField);
        }

        // Validate service used
        if (!serviceUsed) {
            showFeedbackError(serviceUsedField, state.errorMessages.serviceUsed);
            hasErrors = true;
        } else {
            showFieldSuccess(serviceUsedField);
        }

        // Validate rating
        if (rating === '0') {
            showRatingError();
            hasErrors = true;
        }

        // Validate feedback
        if (!feedback) {
            showFeedbackError(feedbackField, state.errorMessages.feedback);
            hasErrors = true;
        } else {
            showFieldSuccess(feedbackField);
        }

        if (hasErrors) return;

        setLoadingState(form, true);

        try {
            await submitToSalesforce(form);
            showSuccessMessage(`Thank you ${name}! Your ${rating}-star feedback has been submitted.`);
            form.reset();
            resetRating();
            clearAllFeedbackErrors(form);
        } catch (error) {
            console.error('Form submission error:', error);
            showErrorMessage('Something went wrong. Please try again or call us directly at 281-506-8826.');
        } finally {
            setLoadingState(form, false);
        }
    }

    // ============================================
    // QUOTE FORM
    // ============================================
    function initQuoteForm() {
        const quoteForm = document.getElementById('quoteForm');
        if (!quoteForm) return;

        setupQuoteRealTimeValidation();
        quoteForm.addEventListener('submit', handleQuoteSubmit);
    }

    function setupQuoteRealTimeValidation() {
        const fieldConfig = [
            { id: 'quoteName', validator: state.validators.name, errorMsg: state.errorMessages.name },
            { id: 'quoteEmail', validator: state.validators.email, errorMsg: state.errorMessages.email },
            { id: 'quotePhone', validator: state.validators.phone, errorMsg: state.errorMessages.phone },
            { id: 'quoteCompany', validator: (v) => state.validators.minLength(v, 2), errorMsg: state.errorMessages.company },
            { id: 'quotePropertySize', validator: state.validators.sqFt, errorMsg: state.errorMessages.propertySize }
        ];

        fieldConfig.forEach(({ id, validator, errorMsg }) => {
            const field = document.getElementById(id);
            if (!field) return;

            field.addEventListener('blur', function() {
                const value = this.value.trim();
                if (value && !validator(value)) {
                    showQuoteFieldError(this, errorMsg);
                } else if (value) {
                    showFieldSuccess(this);
                }
            });

            field.addEventListener('input', function() {
                clearQuoteFieldError(this);
            });
        });

        // Add change listeners for select fields in quote form
        const propertyTypeField = document.getElementById('quotePropertyType');
        if (propertyTypeField) {
            propertyTypeField.addEventListener('change', function() {
                if (this.value) {
                    showFieldSuccess(this);
                }
            });
        }

        const frequencyField = document.getElementById('quoteFrequency');
        if (frequencyField) {
            frequencyField.addEventListener('change', function() {
                if (this.value) {
                    showFieldSuccess(this);
                }
            });
        }
    }

    async function handleQuoteSubmit(e) {
        e.preventDefault();
        const form = e.target;

        clearAllQuoteErrors(form);

        const fields = {
            name: document.getElementById('quoteName'),
            email: document.getElementById('quoteEmail'),
            phone: document.getElementById('quotePhone'),
            company: document.getElementById('quoteCompany'),
            propertyType: document.getElementById('quotePropertyType'),
            propertySize: document.getElementById('quotePropertySize'),
            frequency: document.getElementById('quoteFrequency')
        };

        const values = {
            name: fields.name?.value.trim() || '',
            email: fields.email?.value.trim() || '',
            phone: fields.phone?.value.trim() || '',
            company: fields.company?.value.trim() || '',
            propertyType: fields.propertyType?.value || '',
            propertySize: fields.propertySize?.value.trim() || '',
            frequency: fields.frequency?.value || '',
            serviceType: document.getElementById('serviceTypeInput')?.value || ''
        };

        let hasErrors = false;

        if (!values.name) {
            showQuoteFieldError(fields.name, 'Please enter your full name');
            hasErrors = true;
        } else if (!state.validators.name(values.name)) {
            showQuoteFieldError(fields.name, state.errorMessages.name);
            hasErrors = true;
        } else {
            showFieldSuccess(fields.name);
        }

        if (!values.email) {
            showQuoteFieldError(fields.email, 'Please enter your email address');
            hasErrors = true;
        } else if (!state.validators.email(values.email)) {
            showQuoteFieldError(fields.email, state.errorMessages.email);
            hasErrors = true;
        } else {
            showFieldSuccess(fields.email);
        }

        if (!values.phone) {
            showQuoteFieldError(fields.phone, 'Please enter your phone number');
            hasErrors = true;
        } else if (!state.validators.phone(values.phone)) {
            showQuoteFieldError(fields.phone, state.errorMessages.phone);
            hasErrors = true;
        } else {
            showFieldSuccess(fields.phone);
        }

        if (!values.company) {
            showQuoteFieldError(fields.company, 'Please enter your company/school name');
            hasErrors = true;
        } else if (values.company.length < 2) {
            showQuoteFieldError(fields.company, state.errorMessages.company);
            hasErrors = true;
        } else {
            showFieldSuccess(fields.company);
        }

        if (!values.propertyType) {
            showQuoteFieldError(fields.propertyType, 'Please select a property type');
            hasErrors = true;
        } else {
            showFieldSuccess(fields.propertyType);
        }

        if (!values.propertySize) {
            showQuoteFieldError(fields.propertySize, 'Please enter the property size');
            hasErrors = true;
        } else if (!state.validators.sqFt(values.propertySize)) {
            showQuoteFieldError(fields.propertySize, state.errorMessages.propertySize);
            hasErrors = true;
        } else {
            showFieldSuccess(fields.propertySize);
        }

        if (!values.frequency) {
            showQuoteFieldError(fields.frequency, 'Please select service frequency');
            hasErrors = true;
        } else {
            showFieldSuccess(fields.frequency);
        }

        if (hasErrors) return;

        setLoadingState(form, true);

        try {
            await submitToSalesforce(form);
            showSuccessMessage(`Thank you ${values.name}! Your quote request for ${values.serviceType} has been submitted. We'll contact you within 24 hours.`);
            
            form.reset();
            clearAllQuoteErrors(form);
            
            setTimeout(() => {
                const modal = document.getElementById('quoteModal');
                if (modal) {
                    modal.classList.remove('active');
                    modal.setAttribute('aria-hidden', 'true');
                    document.body.classList.remove('modal-open');
                }
            }, 2000);

        } catch (error) {
            console.error('Quote submission error:', error);
            showErrorMessage('Something went wrong. Please try again or call us directly at 281-506-8826.');
        } finally {
            setLoadingState(form, false);
        }
    }

    // ============================================
    // ERROR HANDLING - FEEDBACK FORM
    // ============================================
    function showFeedbackError(field, message) {
        if (!field) return;
        
        field.classList.add('error');
        field.classList.remove('valid');
        field.setAttribute('aria-invalid', 'true');
        
        // Show error message
        let errorEl = field.nextElementSibling;
        if (!errorEl || !errorEl.classList.contains('error-message')) {
            errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            errorEl.setAttribute('role', 'alert');
            errorEl.style.cssText = 'color: #dc3545; font-size: 0.875rem; display: block; margin-top: 0.25rem;';
            field.insertAdjacentElement('afterend', errorEl);
        }
        
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    function clearFeedbackError(field) {
        if (!field) return;
        
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        
        const errorEl = field.nextElementSibling;
        if (errorEl && errorEl.classList.contains('error-message')) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
    }

    function clearAllFeedbackErrors(form) {
        // Remove all error classes from fields
        const errorFields = form.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
            field.classList.add('valid');
            field.removeAttribute('aria-invalid');
        });
        
        // Hide all error messages
        const allErrorMessages = form.querySelectorAll('.error-message');
        allErrorMessages.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        
        // Clear rating error
        clearRatingError();
    }

    // ============================================
    // ERROR HANDLING - QUOTE FORM
    // ============================================
    function showQuoteFieldError(field, message) {
        if (!field) return;
        
        field.classList.add('error');
        field.classList.remove('valid');
        field.setAttribute('aria-invalid', 'true');
        
        const formField = field.closest('.form-field');
        if (!formField) return;
        
        const fieldId = field.id;
        let errorEl = document.getElementById(fieldId + 'Error');
        
        if (!errorEl) {
            errorEl = formField.querySelector('.error-message');
        }
        
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    function clearQuoteFieldError(field) {
        if (!field) return;
        
        field.classList.remove('error');
        
        const formField = field.closest('.form-field');
        if (!formField) return;
        
        const fieldId = field.id;
        let errorEl = document.getElementById(fieldId + 'Error');
        
        if (!errorEl) {
            errorEl = formField.querySelector('.error-message');
        }
        
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
    }

    function clearAllQuoteErrors(form) {
        const errorFields = form.querySelectorAll('.error');
        const errorMessages = form.querySelectorAll('.error-message');
        
        errorFields.forEach(field => {
            field.classList.remove('error');
            field.classList.add('valid');
            field.removeAttribute('aria-invalid');
        });
        
        errorMessages.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }

    // ============================================
    // SHARED FIELD SUCCESS - AGGRESSIVE FIX
    // ============================================
    function showFieldSuccess(field) {
        if (!field) return;
        
        // Remove all error attributes and classes
        field.classList.remove('error');
        field.classList.add('valid');
        field.removeAttribute('aria-invalid');
        
        // AGGRESSIVE: Override any CSS pseudo-elements by adding inline style
        field.style.borderColor = '#28a745'; // Force green border
        
        // Hide error message for feedback form
        const nextEl = field.nextElementSibling;
        if (nextEl && nextEl.classList.contains('error-message')) {
            nextEl.textContent = '';
            nextEl.style.display = 'none';
        }
        
        // Hide error message for quote form
        const formField = field.closest('.form-field');
        if (formField) {
            const errorEl = formField.querySelector('.error-message');
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.style.display = 'none';
            }
        }
        
        // AGGRESSIVE: If there's a warning icon pseudo-element, hide it by 
        // adding a data attribute that CSS can use to hide the icon
        field.setAttribute('data-valid', 'true');
    }

    // ============================================
    // RATING ERROR
    // ============================================
    function showRatingError() {
        const ratingGroup = document.querySelector('.rating-group');
        if (!ratingGroup) return;
        
        ratingGroup.classList.add('error');
        
        let errorEl = ratingGroup.querySelector('.error-message');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            errorEl.setAttribute('role', 'alert');
            errorEl.style.cssText = 'color: #dc3545; font-size: 0.875rem; display: block; margin-top: 0.25rem;';
            ratingGroup.appendChild(errorEl);
        }
        
        errorEl.textContent = state.errorMessages.rating;
        errorEl.style.display = 'block';
    }

    function clearRatingError() {
        const ratingGroup = document.querySelector('.rating-group');
        if (!ratingGroup) return;
        
        ratingGroup.classList.remove('error');
        const errorEl = ratingGroup.querySelector('.error-message');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
    }

    function resetRating() {
        const starContainer = document.getElementById('starContainer');
        const ratingInput = document.getElementById('ratingInput');
        
        if (!starContainer) return;
        
        const stars = starContainer.querySelectorAll('.star');
        
        stars.forEach(star => {
            star.classList.remove('active');
            star.style.color = '#ddd';
            star.setAttribute('aria-checked', 'false');
        });
        
        if (ratingInput) ratingInput.value = '0';
    }

    // ============================================
    // LOADING STATES
    // ============================================
    function setLoadingState(form, isLoading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (isLoading) {
            form.classList.add('submitting');
            if (submitBtn) {
                submitBtn.classList.add('btn-loading');
                submitBtn.disabled = true;
            }
        } else {
            form.classList.remove('submitting');
            if (submitBtn) {
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
        }
    }

    // ============================================
    // SUBMISSION
    // ============================================
    async function submitToSalesforce(form) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        console.log('Form data ready for Salesforce:', data);
        
        return { success: true };
    }

    // ============================================
    // TOAST MESSAGES
    // ============================================
    function showSuccessMessage(message) {
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.setAttribute('role', 'alert');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 10000;
            font-size: 1rem;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    function showErrorMessage(message) {
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.setAttribute('role', 'alert');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 10000;
            font-size: 1rem;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    // ============================================
    // CLEANUP
    // ============================================
    function destroy() {
        const feedbackForm = document.getElementById('feedbackForm');
        const quoteForm = document.getElementById('quoteForm');
        const starContainer = document.getElementById('starContainer');

        feedbackForm?.removeEventListener('submit', handleFeedbackSubmit);
        quoteForm?.removeEventListener('submit', handleQuoteSubmit);
        starContainer?.removeEventListener('click', handleStarClick);
        starContainer?.removeEventListener('keydown', handleStarKeydown);
    }

    // ============================================
    // INITIALIZE
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();