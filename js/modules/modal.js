/* ============================================
   CRYSTAL FACILITY SOLUTIONS - MODAL MODULE
   Quote Request Modal Functionality
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // DOM ELEMENTS
    // ============================================
    let modal = null;
    let modalTitle = null;
    let serviceInput = null;
    let form = null;

    // Service name mapping
    const serviceNames = {
        'cleaning': 'Cleaning Services Quote',
        'landscaping': 'Landscaping Services Quote',
        'maintenance': 'Maintenance Services Quote'
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        modal = document.getElementById('quoteModal');
        modalTitle = document.getElementById('modalTitle');
        serviceInput = document.getElementById('serviceTypeInput');
        form = document.getElementById('quoteForm');

        if (!modal) {
            console.warn('Modal element not found in DOM');
            return;
        }

        // Bind global functions
        window.openModal = openModal;
        window.closeModal = closeModal;
        window.clearErrors = clearErrors;

        // Close on escape key
        document.addEventListener('keydown', handleEscapeKey);
    }

    // ============================================
    // OPEN MODAL
    // ============================================
    function openModal(serviceType) {
        if (!modal) return;

        // Reset form before opening
        if (form) {
            form.reset();
            clearErrors();
        }

        // Set service type and title
        if (serviceInput) {
            serviceInput.value = serviceType;
        }
        
        if (modalTitle) {
            modalTitle.textContent = serviceNames[serviceType] || 'Request a Quote';
        }

        // Show modal
        modal.classList.add('active');
        document.body.classList.add('modal-open');

        // Focus first input
        setTimeout(() => {
            const firstInput = document.getElementById('quoteName');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    // ============================================
    // CLOSE MODAL
    // ============================================
    function closeModal() {
        if (!modal) return;

        modal.classList.remove('active');
        document.body.classList.remove('modal-open');

        // Optional: Clear form when closing
        if (form) {
            form.reset();
            clearErrors();
        }
    }

    // ============================================
    // CLEAR ERRORS
    // ============================================
    function clearErrors() {
        const fields = [
            'quoteName', 
            'quoteEmail', 
            'quotePhone', 
            'quoteCompany', 
            'quotePropertyType', 
            'quotePropertySize', 
            'quoteFrequency'
        ];

        const errorMap = {
            'quoteName': 'nameError',
            'quoteEmail': 'emailError',
            'quotePhone': 'phoneError',
            'quoteCompany': 'companyError',
            'quotePropertyType': 'propertyTypeError',
            'quotePropertySize': 'propertySizeError',
            'quoteFrequency': 'frequencyError'
        };

        fields.forEach(id => {
            const field = document.getElementById(id);
            const errorId = errorMap[id] || id.replace('quote', '').toLowerCase() + 'Error';
            const errorSpan = document.getElementById(errorId);

            if (field) {
                field.classList.remove('error', 'valid');
                field.value = '';  // Clear the value
            }
            
            if (errorSpan) {
                errorSpan.textContent = '';
            }
        });
    }

    // ============================================
    // HANDLE ESCAPE KEY
    // ============================================
    function handleEscapeKey(event) {
        if (event.key === 'Escape' && modal?.classList.contains('active')) {
            closeModal();
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    document.addEventListener('DOMContentLoaded', init);

})();