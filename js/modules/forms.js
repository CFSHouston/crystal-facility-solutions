/* ============================================
   FORMS MODULE - PRODUCTION READY
   Crystal Facility Solutions
   ============================================ */

(function() {
    'use strict';

    // ─── Configuration ──────────────────────────────────────────
    const CONFIG = {
        phone: '281-506-8826',
        validators: {
            name: (name) => /^[a-zA-Z\\s]{2,}$/.test(name.trim()),
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

    // ─── Module State ───────────────────────────────────────────
    const state = {
        isInitialized: false,
        timeouts: [],
        boundHandlers: {}
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

        initFeedbackForm();
        initQuoteForm();
        initStarRating();
        initPropertySizeInput();

        state.isInitialized = true;
    }

    // ─── Property Size Input ────────────────────────────────────
    function initPropertySizeInput() {
        const propertySizeInput = document.getElementById('quotePropertySize');
        if (!propertySizeInput) return;

        const onBlur = () => {
            const value = propertySizeInput.value.trim();
            if (value && !CONFIG.validators.sqFt(value)) {
                showQuoteFieldError(propertySizeInput, CONFIG.errorMessages.propertySize);
            } else if (value) {
                showFieldSuccess(propertySizeInput);
            }
        };

        const onInput = () => clearQuoteFieldError(propertySizeInput);

        propertySizeInput.addEventListener('blur', onBlur);
        propertySizeInput.addEventListener('input', onInput);

        state.boundHandlers.propertySize = { el: propertySizeInput, onBlur, onInput };
    }

    // ─── Star Rating ────────────────────────────────────────────
    function initStarRating() {
        const starContainer = document.getElementById('starContainer');
        if (!starContainer) return;

        const onClick = (e) => {
            const star = e.target.closest('.star');
            if (!star) return;
            const rating = parseInt(star.dataset.rating);
            updateStarVisuals(rating);
            clearRatingError();
        };

        const onKeydown = (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const star = e.target.closest('.star');
            if (!star) return;
            e.preventDefault();
            const rating = parseInt(star.dataset.rating);
            updateStarVisuals(rating);
            clearRatingError();
        };

        starContainer.addEventListener('click', onClick);
        starContainer.addEventListener('keydown', onKeydown);

        state.boundHandlers.starRating = { el: starContainer, onClick, onKeydown };
    }

    function updateStarVisuals(rating) {
        const starContainer = document.getElementById('starContainer');
        const ratingInput = document.getElementById('ratingInput');
        if (!starContainer) return;

        const stars = starContainer.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < rating);
            star.style.color = index < rating ? '#ffc107' : '#ddd';
            star.setAttribute('aria-checked', index < rating ? 'true' : 'false');
        });

        if (ratingInput) ratingInput.value = rating;
    }

    // ─── Feedback Form ──────────────────────────────────────────
    function initFeedbackForm() {
        const feedbackForm = document.getElementById('feedbackForm');
        if (!feedbackForm) return;

        setupFeedbackRealTimeValidation();

        const onSubmit = (e) => handleFeedbackSubmit(e);
        feedbackForm.addEventListener('submit', onSubmit);
        state.boundHandlers.feedbackForm = { el: feedbackForm, onSubmit };
    }

    function setupFeedbackRealTimeValidation() {
        const fields = [
            { id: 'firstName', validator: CONFIG.validators.name, errorMsg: CONFIG.errorMessages.name },
            { id: 'email', validator: CONFIG.validators.email, errorMsg: CONFIG.errorMessages.email }
        ];

        fields.forEach(({ id, validator, errorMsg }) => {
            const field = document.getElementById(id);
            if (!field) return;

            const onBlur = () => {
                const value = field.value.trim();
                if (value && !validator(value)) {
                    showFeedbackError(field, errorMsg);
                } else if (value) {
                    showFieldSuccess(field);
                }
            };

            const onInput = () => clearFeedbackError(field);

            field.addEventListener('blur', onBlur);
            field.addEventListener('input', onInput);

            if (!state.boundHandlers.feedbackValidation) state.boundHandlers.feedbackValidation = [];
            state.boundHandlers.feedbackValidation.push({ field, onBlur, onInput });
        });

        // Select fields
        ['userType', 'serviceUsed'].forEach(id => {
            const field = document.getElementById(id);
            if (!field) return;

            const onChange = () => {
                if (field.value) {
                    showFieldSuccess(field);
                } else {
                    showFeedbackError(field, CONFIG.errorMessages[id]);
                }
            };

            field.addEventListener('change', onChange);
            if (!state.boundHandlers.feedbackSelects) state.boundHandlers.feedbackSelects = [];
            state.boundHandlers.feedbackSelects.push({ field, onChange });
        });

        // Feedback textarea
        const feedbackField = document.getElementById('feedback');
        if (feedbackField) {
            const onBlur = () => {
                if (feedbackField.value.trim()) showFieldSuccess(feedbackField);
            };
            const onInput = () => {
                if (feedbackField.value.trim()) clearFeedbackError(feedbackField);
            };
            feedbackField.addEventListener('blur', onBlur);
            feedbackField.addEventListener('input', onInput);
            if (!state.boundHandlers.feedbackTextarea) state.boundHandlers.feedbackTextarea = [];
            state.boundHandlers.feedbackTextarea.push({ field: feedbackField, onBlur, onInput });
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

        const name = sanitizeInput(nameField?.value || '');
        const email = sanitizeInput(emailField?.value || '');
        const userType = sanitizeInput(userTypeField?.value || '');
        const serviceUsed = sanitizeInput(serviceUsedField?.value || '');
        const feedback = sanitizeInput(feedbackField?.value || '');
        const rating = ratingInput?.value || '0';

        clearAllFeedbackErrors(form);

        let hasErrors = false;

        if (!name) {
            showFeedbackError(nameField, 'Please enter your name');
            hasErrors = true;
        } else if (!CONFIG.validators.name(name)) {
            showFeedbackError(nameField, CONFIG.errorMessages.name);
            hasErrors = true;
        } else {
            showFieldSuccess(nameField);
        }

        if (!email) {
            showFeedbackError(emailField, 'Please enter your email address');
            hasErrors = true;
        } else if (!CONFIG.validators.email(email)) {
            showFeedbackError(emailField, CONFIG.errorMessages.email);
            hasErrors = true;
        } else {
            showFieldSuccess(emailField);
        }

        if (!userType) {
            showFeedbackError(userTypeField, CONFIG.errorMessages.userType);
            hasErrors = true;
        } else {
            showFieldSuccess(userTypeField);
        }

        if (!serviceUsed) {
            showFeedbackError(serviceUsedField, CONFIG.errorMessages.serviceUsed);
            hasErrors = true;
        } else {
            showFieldSuccess(serviceUsedField);
        }

        if (rating === '0') {
            showRatingError();
            hasErrors = true;
        }

        if (!feedback) {
            showFeedbackError(feedbackField, CONFIG.errorMessages.feedback);
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
            showErrorMessage('Something went wrong. Please try again or call us directly at ' + CONFIG.phone + '.');
        } finally {
            setLoadingState(form, false);
        }
    }

    // ─── Quote Form ─────────────────────────────────────────────
    function initQuoteForm() {
        const quoteForm = document.getElementById('quoteForm');
        if (!quoteForm) return;

        setupQuoteRealTimeValidation();

        const onSubmit = (e) => handleQuoteSubmit(e);
        quoteForm.addEventListener('submit', onSubmit);
        state.boundHandlers.quoteForm = { el: quoteForm, onSubmit };
    }

    function setupQuoteRealTimeValidation() {
        const fieldConfig = [
            { id: 'quoteName', validator: CONFIG.validators.name, errorMsg: CONFIG.errorMessages.name },
            { id: 'quoteEmail', validator: CONFIG.validators.email, errorMsg: CONFIG.errorMessages.email },
            { id: 'quotePhone', validator: CONFIG.validators.phone, errorMsg: CONFIG.errorMessages.phone },
            { id: 'quoteCompany', validator: (v) => CONFIG.validators.minLength(v, 2), errorMsg: CONFIG.errorMessages.company },
            { id: 'quotePropertySize', validator: CONFIG.validators.sqFt, errorMsg: CONFIG.errorMessages.propertySize }
        ];

        fieldConfig.forEach(({ id, validator, errorMsg }) => {
            const field = document.getElementById(id);
            if (!field) return;

            const onBlur = () => {
                const value = field.value.trim();
                if (value && !validator(value)) {
                    showQuoteFieldError(field, errorMsg);
                } else if (value) {
                    showFieldSuccess(field);
                }
            };

            const onInput = () => clearQuoteFieldError(field);

            field.addEventListener('blur', onBlur);
            field.addEventListener('input', onInput);

            if (!state.boundHandlers.quoteValidation) state.boundHandlers.quoteValidation = [];
            state.boundHandlers.quoteValidation.push({ field, onBlur, onInput });
        });

        // Select fields
        ['quotePropertyType', 'quoteFrequency'].forEach(id => {
            const field = document.getElementById(id);
            if (!field) return;

            const onChange = () => {
                if (field.value) showFieldSuccess(field);
            };

            field.addEventListener('change', onChange);
            if (!state.boundHandlers.quoteSelects) state.boundHandlers.quoteSelects = [];
            state.boundHandlers.quoteSelects.push({ field, onChange });
        });
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
            name: sanitizeInput(fields.name?.value || ''),
            email: sanitizeInput(fields.email?.value || ''),
            phone: sanitizeInput(fields.phone?.value || ''),
            company: sanitizeInput(fields.company?.value || ''),
            propertyType: sanitizeInput(fields.propertyType?.value || ''),
            propertySize: sanitizeInput(fields.propertySize?.value || ''),
            frequency: sanitizeInput(fields.frequency?.value || ''),
            serviceType: sanitizeInput(document.getElementById('serviceTypeInput')?.value || '')
        };

        let hasErrors = false;

        if (!values.name) {
            showQuoteFieldError(fields.name, 'Please enter your full name');
            hasErrors = true;
        } else if (!CONFIG.validators.name(values.name)) {
            showQuoteFieldError(fields.name, CONFIG.errorMessages.name);
            hasErrors = true;
        } else {
            showFieldSuccess(fields.name);
        }

        if (!values.email) {
            showQuoteFieldError(fields.email, 'Please enter your email address');
            hasErrors = true;
        } else if (!CONFIG.validators.email(values.email)) {
            showQuoteFieldError(fields.email, CONFIG.errorMessages.email);
            hasErrors = true;
        } else {
            showFieldSuccess(fields.email);
        }

        if (!values.phone) {
            showQuoteFieldError(fields.phone, 'Please enter your phone number');
            hasErrors = true;
        } else if (!CONFIG.validators.phone(values.phone)) {
            showQuoteFieldError(fields.phone, CONFIG.errorMessages.phone);
            hasErrors = true;
        } else {
            showFieldSuccess(fields.phone);
        }

        if (!values.company) {
            showQuoteFieldError(fields.company, 'Please enter your company/school name');
            hasErrors = true;
        } else if (values.company.length < 2) {
            showQuoteFieldError(fields.company, CONFIG.errorMessages.company);
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
        } else if (!CONFIG.validators.sqFt(values.propertySize)) {
            showQuoteFieldError(fields.propertySize, CONFIG.errorMessages.propertySize);
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

            const timeoutId = setTimeout(() => {
                const modal = document.getElementById('quoteModal');
                if (modal) {
                    modal.classList.remove('active');
                    modal.setAttribute('aria-hidden', 'true');
                    document.body.classList.remove('modal-open');
                }
            }, 2000);
            state.timeouts.push(timeoutId);

        } catch (error) {
            showErrorMessage('Something went wrong. Please try again or call us directly at ' + CONFIG.phone + '.');
        } finally {
            setLoadingState(form, false);
        }
    }

    // ─── Error Handling ─────────────────────────────────────────
    function showFeedbackError(field, message) {
        if (!field) return;
        field.classList.add('error');
        field.classList.remove('valid');
        field.setAttribute('aria-invalid', 'true');

        let errorEl = field.nextElementSibling;
        if (!errorEl || !errorEl.classList.contains('error-message')) {
            errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            errorEl.setAttribute('role', 'alert');
            field.insertAdjacentElement('afterend', errorEl);
        }
        errorEl.textContent = message;
    }

    function clearFeedbackError(field) {
        if (!field) return;
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        const errorEl = field.nextElementSibling;
        if (errorEl && errorEl.classList.contains('error-message')) {
            errorEl.textContent = '';
        }
    }

    function clearAllFeedbackErrors(form) {
        form.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
            field.classList.add('valid');
            field.removeAttribute('aria-invalid');
        });
        form.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        clearRatingError();
    }

    function showQuoteFieldError(field, message) {
        if (!field) return;
        field.classList.add('error');
        field.classList.remove('valid');
        field.setAttribute('aria-invalid', 'true');

        const formField = field.closest('.form-field');
        if (!formField) return;

        const fieldId = field.id;
        let errorEl = document.getElementById(fieldId + 'Error') || formField.querySelector('.error-message');
        if (errorEl) {
            errorEl.textContent = message;
        }
    }

    function clearQuoteFieldError(field) {
        if (!field) return;
        field.classList.remove('error');
        const formField = field.closest('.form-field');
        if (!formField) return;
        const fieldId = field.id;
        let errorEl = document.getElementById(fieldId + 'Error') || formField.querySelector('.error-message');
        if (errorEl) {
            errorEl.textContent = '';
        }
    }

    function clearAllQuoteErrors(form) {
        form.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
            field.classList.add('valid');
            field.removeAttribute('aria-invalid');
        });
        form.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
    }

    function showFieldSuccess(field) {
        if (!field) return;
        field.classList.remove('error');
        field.classList.add('valid');
        field.removeAttribute('aria-invalid');
        field.style.borderColor = '#28a745';
        field.setAttribute('data-valid', 'true');

        const nextEl = field.nextElementSibling;
        if (nextEl && nextEl.classList.contains('error-message')) {
            nextEl.textContent = '';
        }

        const formField = field.closest('.form-field');
        if (formField) {
            const errorEl = formField.querySelector('.error-message');
            if (errorEl) errorEl.textContent = '';
        }
    }

    // ─── Rating Error ───────────────────────────────────────────
    function showRatingError() {
        const ratingGroup = document.querySelector('.rating-group');
        if (!ratingGroup) return;
        ratingGroup.classList.add('error');

        let errorEl = ratingGroup.querySelector('.error-message');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            errorEl.setAttribute('role', 'alert');
            ratingGroup.appendChild(errorEl);
        }
        errorEl.textContent = CONFIG.errorMessages.rating;
    }

    function clearRatingError() {
        const ratingGroup = document.querySelector('.rating-group');
        if (!ratingGroup) return;
        ratingGroup.classList.remove('error');
        const errorEl = ratingGroup.querySelector('.error-message');
        if (errorEl) errorEl.textContent = '';
    }

    function resetRating() {
        const starContainer = document.getElementById('starContainer');
        const ratingInput = document.getElementById('ratingInput');
        if (!starContainer) return;

        starContainer.querySelectorAll('.star').forEach(star => {
            star.classList.remove('active');
            star.style.color = '#ddd';
            star.setAttribute('aria-checked', 'false');
        });
        if (ratingInput) ratingInput.value = '0';
    }

    // ─── Loading States ─────────────────────────────────────────
    function setLoadingState(form, isLoading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) return;

        if (isLoading) {
            form.classList.add('submitting');
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;
        } else {
            form.classList.remove('submitting');
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    }

    // ─── Submission ─────────────────────────────────────────────
    async function submitToSalesforce(form) {
        // Simulate network delay
        await new Promise(resolve => {
            const timeoutId = setTimeout(resolve, 1500);
            state.timeouts.push(timeoutId);
        });

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Sanitize all data
        Object.keys(data).forEach(key => {
            if (typeof data[key] === 'string') {
                data[key] = sanitizeInput(data[key]);
            }
        });

        // TODO: Replace with actual Salesforce API call
        return { success: true, data };
    }

    // ─── Toast Messages ─────────────────────────────────────────
    function showSuccessMessage(message) {
        document.querySelectorAll('.toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.setAttribute('role', 'alert');

        const icon = document.createElement('i');
        icon.className = 'fas fa-check-circle';

        const span = document.createElement('span');
        span.textContent = message;

        toast.appendChild(icon);
        toast.appendChild(span);
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('toast-visible'));

        const timeoutId = setTimeout(() => {
            toast.classList.add('toast-hiding');
            const removeTimeout = setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 300);
            state.timeouts.push(removeTimeout);
        }, 5000);
        state.timeouts.push(timeoutId);
    }

    function showErrorMessage(message) {
        document.querySelectorAll('.toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.setAttribute('role', 'alert');

        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-circle';

        const span = document.createElement('span');
        span.textContent = message;

        toast.appendChild(icon);
        toast.appendChild(span);
        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('toast-visible'));

        const timeoutId = setTimeout(() => {
            toast.classList.add('toast-hiding');
            const removeTimeout = setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 300);
            state.timeouts.push(removeTimeout);
        }, 5000);
        state.timeouts.push(timeoutId);
    }

    // ─── Cleanup / Destroy ──────────────────────────────────────
    function destroy() {
        if (!state.isInitialized) return;

        // Clear timeouts
        state.timeouts.forEach(id => clearTimeout(id));
        state.timeouts = [];

        // Remove event listeners
        Object.keys(state.boundHandlers).forEach(key => {
            const handlers = state.boundHandlers[key];
            if (Array.isArray(handlers)) {
                handlers.forEach(h => {
                    if (h.el && h.onClick) h.el.removeEventListener('click', h.onClick);
                    if (h.el && h.onKeydown) h.el.removeEventListener('keydown', h.onKeydown);
                    if (h.el && h.onSubmit) h.el.removeEventListener('submit', h.onSubmit);
                    if (h.el && h.onChange) h.el.removeEventListener('change', h.onChange);
                    if (h.el && h.onBlur) h.el.removeEventListener('blur', h.onBlur);
                    if (h.el && h.onInput) h.el.removeEventListener('input', h.onInput);
                    if (h.field && h.onBlur) h.field.removeEventListener('blur', h.onBlur);
                    if (h.field && h.onInput) h.field.removeEventListener('input', h.onInput);
                    if (h.field && h.onChange) h.field.removeEventListener('change', h.onChange);
                });
            } else if (handlers.el) {
                if (handlers.onClick) handlers.el.removeEventListener('click', handlers.onClick);
                if (handlers.onKeydown) handlers.el.removeEventListener('keydown', handlers.onKeydown);
                if (handlers.onSubmit) handlers.el.removeEventListener('submit', handlers.onSubmit);
                if (handlers.onBlur) handlers.el.removeEventListener('blur', handlers.onBlur);
                if (handlers.onInput) handlers.el.removeEventListener('input', handlers.onInput);
            }
        });

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