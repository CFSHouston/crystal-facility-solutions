/* ============================================
   CRYSTAL FACILITY SOLUTIONS - FORMS MODULE
   Form Validation and Submission Handling
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // VALIDATION UTILITIES
    // ============================================
    const validators = {
        name: (name) => /^[a-zA-Z\s]{2,}$/.test(name),
        email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        phone: (phone) => phone.replace(/\D/g, '').length >= 10,
        sqFt: (sqFt) => parseInt(sqFt) > 0,
        minLength: (value, min) => value.length >= min,
        required: (value) => value.trim().length > 0
    };

    // ============================================
    // FEEDBACK FORM
    // ============================================
    function initFeedbackForm() {
        const feedbackForm = document.getElementById('feedbackForm');
        if (!feedbackForm) return;

        // Rating functionality
        window.setRating = function(rating) {
            const stars = document.querySelectorAll('.star');
            const ratingInput = document.getElementById('ratingInput');

            stars.forEach((star, index) => {
                star.classList.toggle('active', index < rating);
            });

            if (ratingInput) ratingInput.value = rating;
        };

        // Form submission
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = this.firstName?.value.trim() || '';
            const email = this.email?.value.trim() || '';
            const rating = document.getElementById('ratingInput')?.value || '0';

            // Validation
            if (!validators.name(name)) {
                alert("⚠️ Please enter a valid name (letters only, min 2 chars)");
                this.firstName?.focus();
                return;
            }

            if (!validators.email(email)) {
                alert("⚠️ Please enter a valid email (example: john@example.com)");
                this.email?.focus();
                return;
            }

            if (rating === '0') {
                alert('⚠️ Please select a star rating!');
                return;
            }

            // Build form data
            const formData = {
                firstName: name,
                email: email,
                userType: this.userType?.value || '',
                serviceUsed: this.serviceUsed?.value || '',
                rating: parseInt(rating),
                feedback: this.feedback?.value || '',
                permission: this.permission?.checked || false,
                source: 'Website Feedback Form',
                date: new Date().toISOString(),
                status: 'New Feedback'
            };

            // Submit (console log for demo)
            console.log('Salesforce Feedback Data:', formData);

            // Success message
            alert(`✅ Thank you ${formData.firstName}!\n\n` +
                  `Your ${formData.rating}-star feedback has been recorded.\n\n` +
                  `We appreciate your input!`);

            // Reset form
            this.reset();
            document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
            if (document.getElementById('ratingInput')) {
                document.getElementById('ratingInput').value = '0';
            }
        });
    }

    // ============================================
    // QUOTE FORM (MODAL)
    // ============================================
    function initQuoteForm() {
        const quoteForm = document.getElementById('quoteForm');
        if (!quoteForm) return;

        // Field configuration
        const fields = [
            { id: 'quoteName', validator: validators.name, errorMsg: 'Letters only, min 2 characters' },
            { id: 'quoteEmail', validator: validators.email, errorMsg: 'Enter valid email' },
            { id: 'quotePhone', validator: validators.phone, errorMsg: 'Min 10 digits required' },
            { id: 'quoteCompany', validator: (v) => validators.minLength(v, 2), errorMsg: 'Min 2 characters' },
            { id: 'quotePropertySize', validator: validators.sqFt, errorMsg: 'Numbers only' }
        ];

        // Real-time validation
        fields.forEach(({ id, validator, errorMsg }) => {
            const field = document.getElementById(id);
            field?.addEventListener('blur', function() {
                if (this.value.trim() && !validator(this.value)) {
                    showError(id, errorMsg);
                } else if (this.value.trim()) {
                    showSuccess(id);
                }
            });
        });

        // Form submission
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Clear previous errors
            clearAllErrors();

            let hasErrors = false;
            const values = {
                name: document.getElementById('quoteName')?.value.trim() || '',
                email: document.getElementById('quoteEmail')?.value.trim() || '',
                phone: document.getElementById('quotePhone')?.value.trim() || '',
                company: document.getElementById('quoteCompany')?.value.trim() || '',
                propertyType: document.getElementById('quotePropertyType')?.value || '',
                propertySize: document.getElementById('quotePropertySize')?.value.trim() || '',
                frequency: document.getElementById('quoteFrequency')?.value || ''
            };

            // Validate all fields
            if (!values.name) { 
                showError('quoteName', 'Name is required'); 
                hasErrors = true; 
            } else if (!validators.name(values.name)) { 
                showError('quoteName', 'Letters only, min 2 chars'); 
                hasErrors = true; 
            } else { 
                showSuccess('quoteName'); 
            }

            if (!values.email) { 
                showError('quoteEmail', 'Email is required'); 
                hasErrors = true; 
            } else if (!validators.email(values.email)) { 
                showError('quoteEmail', 'Enter valid email'); 
                hasErrors = true; 
            } else { 
                showSuccess('quoteEmail'); 
            }

            if (!values.phone) { 
                showError('quotePhone', 'Phone is required'); 
                hasErrors = true; 
            } else if (!validators.phone(values.phone)) { 
                showError('quotePhone', 'Min 10 digits required'); 
                hasErrors = true; 
            } else { 
                showSuccess('quotePhone'); 
            }

            if (!values.company) { 
                showError('quoteCompany', 'Company/School is required'); 
                hasErrors = true; 
            } else if (values.company.length < 2) { 
                showError('quoteCompany', 'Min 2 characters'); 
                hasErrors = true; 
            } else { 
                showSuccess('quoteCompany'); 
            }

            if (!values.propertyType) { 
                showError('quotePropertyType', 'Select property type'); 
                hasErrors = true; 
            }

            if (!values.propertySize) { 
                showError('quotePropertySize', 'Property size is required'); 
                hasErrors = true; 
            } else if (!validators.sqFt(values.propertySize)) { 
                showError('quotePropertySize', 'Numbers only'); 
                hasErrors = true; 
            } else { 
                showSuccess('quotePropertySize'); 
            }

            if (!values.frequency) { 
                showError('quoteFrequency', 'Select frequency'); 
                hasErrors = true; 
            }

            // Submit if no errors
            if (!hasErrors) {
                const formData = {
                    ...values,
                    serviceType: document.getElementById('serviceTypeInput')?.value || '',
                    details: this.details?.value || '',
                    source: 'Quote Request Modal',
                    date: new Date().toISOString()
                };

                console.log('✅ Quote submitted:', formData);

                alert(`✅ Quote Request Submitted!\n\n` +
                      `Thank you ${values.name}!\n\n` +
                      `Your request for ${formData.serviceType} has been sent.\n` +
                      `We'll contact you within 24 hours.`);

                this.reset();
                if (window.closeModal) {
                    window.closeModal();
                }
            }
        });

        // Close modal on backdrop click
        const quoteModal = document.getElementById('quoteModal');
        quoteModal?.addEventListener('click', (e) => {
            if (e.target === quoteModal && window.closeModal) {
                window.closeModal();
            }
        });
    }

    // ============================================
    // ERROR HANDLING UTILITIES
    // ============================================
    function getErrorId(fieldId) {
        const map = {
            'quoteName': 'nameError',
            'quoteEmail': 'emailError',
            'quotePhone': 'phoneError',
            'quoteCompany': 'companyError',
            'quotePropertyType': 'propertyTypeError',
            'quotePropertySize': 'propertySizeError',
            'quoteFrequency': 'frequencyError'
        };
        return map[fieldId] || fieldId.replace('quote', '').toLowerCase() + 'Error';
    }

    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorSpan = document.getElementById(getErrorId(fieldId));

        field?.classList.add('error');
        field?.classList.remove('valid');
        if (errorSpan) errorSpan.textContent = message;
    }

    function showSuccess(fieldId) {
        const field = document.getElementById(fieldId);
        const errorSpan = document.getElementById(getErrorId(fieldId));

        field?.classList.remove('error');
        field?.classList.add('valid');
        if (errorSpan) errorSpan.textContent = '';
    }

    function clearAllErrors() {
        const errorFields = ['quoteName', 'quoteEmail', 'quotePhone', 'quoteCompany', 
                     'quotePropertyType', 'quotePropertySize', 'quoteFrequency'];
        
        errorFields.forEach(id => {
            const field = document.getElementById(id);
            const errorSpan = document.getElementById(getErrorId(id));
            field?.classList.remove('error', 'valid');
            if (errorSpan) errorSpan.textContent = '';
        });
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        initFeedbackForm();
        initQuoteForm();
    });

})();