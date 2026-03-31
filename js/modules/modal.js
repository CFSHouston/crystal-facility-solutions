/* ============================================
   CRYSTAL FACILITY SOLUTIONS - MODAL MODULE
   Modern Event Listeners, No Window Globals
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
    let closeBtn = null;
    let firstFocusable = null;
    let lastFocusable = null;

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
        closeBtn = document.getElementById('modalCloseBtn');

        if (!modal) {
            console.warn('Modal element not found in DOM');
            return;
        }

        setupEventListeners();
        setupModalTriggers();
    }

    // ============================================
    // SETUP EVENT LISTENERS
    // ============================================
    function setupEventListeners() {
        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Close on escape key
        document.addEventListener('keydown', handleEscapeKey);

        // Close on backdrop click
        modal.addEventListener('click', handleBackdropClick);

        // Focus trap
        modal.addEventListener('keydown', trapFocus);
    }

    // ============================================
    // MODAL TRIGGERS (Event Delegation)
    // ============================================
    function setupModalTriggers() {
        // Handle all data-modal clicks
        document.addEventListener('click', function(e) {
            const trigger = e.target.closest('[data-modal]');
            if (!trigger) return;

            const serviceType = trigger.dataset.modal;
            if (serviceType) {
                openModal(serviceType);
            }
        });

        // Keyboard support for clickable cards
        document.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            
            const trigger = e.target.closest('[data-modal]');
            if (!trigger) return;

            e.preventDefault();
            const serviceType = trigger.dataset.modal;
            if (serviceType) {
                openModal(serviceType);
            }
        });
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
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        // Get focusable elements for trap
        updateFocusableElements();

        // Focus first input after animation
        setTimeout(() => {
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 100);
    }

    // ============================================
    // CLOSE MODAL
    // ============================================
    function closeModal() {
        if (!modal) return;

        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        // Clear form when closing
        if (form) {
            form.reset();
            clearErrors();
        }

        // Return focus to trigger element
        const trigger = document.querySelector(`[data-modal="${serviceInput?.value}"]`);
        if (trigger) {
            trigger.focus();
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
            const errorId = errorMap[id];
            const errorSpan = document.getElementById(errorId);

            if (field) {
                field.classList.remove('error', 'valid');
                field.value = '';
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
        if (event.key === 'Escape' && isModalOpen()) {
            closeModal();
        }
    }

    // ============================================
    // HANDLE BACKDROP CLICK
    // ============================================
    function handleBackdropClick(event) {
        if (event.target === modal) {
            closeModal();
        }
    }

    // ============================================
    // FOCUS TRAP
    // ============================================
    function updateFocusableElements() {
        const focusableSelectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])'
        ];

        const focusable = modal.querySelectorAll(focusableSelectors.join(', '));
        firstFocusable = focusable[0];
        lastFocusable = focusable[focusable.length - 1];
    }

    function trapFocus(event) {
        if (event.key !== 'Tab') return;

        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable.focus();
            }
        }
    }

    // ============================================
    // UTILITY
    // ============================================
    function isModalOpen() {
        return modal?.classList.contains('active');
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    document.addEventListener('DOMContentLoaded', init);

})();