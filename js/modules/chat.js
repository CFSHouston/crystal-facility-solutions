/* ============================================
   CRYSTAL FACILITY SOLUTIONS - CHAT MODULE
   Refactored: Event Listeners, No Window Globals
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // PRIVATE STATE (No Globals)
    // ============================================
    const state = {
        elements: {},
        isOpen: false,
        isMinimized: false,
        observer: null
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        cacheElements();
        
        if (!validateElements()) {
            console.warn('Chat elements not found in DOM');
            return;
        }

        bindEventListeners();
        setupMutationObserver();
        
        // Add initial greeting
        addBotMessage('👋 Hi there! How can I help you today?');
    }

    // ============================================
    // DOM CACHE & VALIDATION
    // ============================================
    function cacheElements() {
        state.elements = {
            chatWindow: document.getElementById('chatWindow'),
            chatBody: document.getElementById('chatBody'),
            chatInput: document.getElementById('chatInput'),
            chatToggleBtn: document.getElementById('chatToggleBtn'),
            chatSendBtn: document.getElementById('chatSendBtn'),
            chatCloseBtn: document.getElementById('chatCloseBtn'),
            chatMinimizeBtn: document.getElementById('chatMinimizeBtn')
        };
    }

    function validateElements() {
        const { chatWindow, chatBody, chatInput } = state.elements;
        return !!(chatWindow && chatBody && chatInput);
    }

    // ============================================
    // EVENT BINDINGS
    // ============================================
    function bindEventListeners() {
        const { 
            chatToggleBtn, 
            chatInput, 
            chatSendBtn,
            chatCloseBtn,
            chatMinimizeBtn
        } = state.elements;

        // Toggle button click (floating button)
        if (chatToggleBtn) {
            chatToggleBtn.addEventListener('click', handleToggleButtonClick);
        }

        // Minimize button click (-) - hides chat, keeps conversation
        if (chatMinimizeBtn) {
            chatMinimizeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                minimizeChat();
            });
        }

        // Close button click (×) - closes and refreshes chat
        if (chatCloseBtn) {
            chatCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeAndRefreshChat();
            });
        }

        // Input enter key
        if (chatInput) {
            chatInput.addEventListener('keypress', handleKeyPress);
        }

        // Send button click
        if (chatSendBtn) {
            chatSendBtn.addEventListener('click', sendMessage);
        }

        // Global escape key - minimizes (preserves chat)
        document.addEventListener('keydown', handleGlobalKeydown);
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================
    function handleGlobalKeydown(e) {
        if (e.key === 'Escape' && state.isOpen) {
            minimizeChat();
        }
    }

    function handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    function handleToggleButtonClick() {
        if (state.isMinimized) {
            restoreChat();
        } else if (!state.isOpen) {
            openChat();
        }
    }

    // ============================================
    // MUTATION OBSERVER
    // ============================================
    function setupMutationObserver() {
        const { chatWindow, chatInput } = state.elements;
        if (!chatWindow) return;

        state.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' &&
                    chatWindow.classList.contains('active')
                ) {
                    setTimeout(() => chatInput?.focus(), 100);
                }
            });
        });

        state.observer.observe(chatWindow, { attributes: true });
    }

    // ============================================
    // OPEN CHAT (fresh)
    // ============================================
    function openChat() {
        const { chatWindow, chatToggleBtn, chatInput } = state.elements;
        if (!chatWindow) return;

        state.isOpen = true;
        state.isMinimized = false;

        chatWindow.classList.add('active');
        chatWindow.setAttribute('aria-hidden', 'false');
        chatToggleBtn?.setAttribute('aria-expanded', 'true');
        chatToggleBtn?.classList.remove('has-pending-chat');

        setTimeout(() => chatInput?.focus(), 100);
    }

    // ============================================
    // MINIMIZE CHAT (- button)
    // Hides chat but preserves conversation
    // ============================================
    function minimizeChat() {
        const { chatWindow, chatToggleBtn } = state.elements;
        if (!chatWindow || !state.isOpen) return;

        state.isOpen = false;
        state.isMinimized = true;

        chatWindow.classList.remove('active');
        chatWindow.setAttribute('aria-hidden', 'true');
        chatToggleBtn?.setAttribute('aria-expanded', 'false');
        chatToggleBtn?.classList.add('has-pending-chat');
        chatToggleBtn?.setAttribute('aria-label', 'Restore chat');

        chatToggleBtn?.focus();
    }

    // ============================================
    // RESTORE CHAT (click floating button when minimized)
    // ============================================
    function restoreChat() {
        const { chatWindow, chatToggleBtn, chatInput } = state.elements;
        if (!chatWindow) return;

        state.isOpen = true;
        state.isMinimized = false;

        chatWindow.classList.add('active');
        chatWindow.setAttribute('aria-hidden', 'false');
        chatToggleBtn?.setAttribute('aria-expanded', 'true');
        chatToggleBtn?.classList.remove('has-pending-chat');
        chatToggleBtn?.setAttribute('aria-label', 'Open chat');

        setTimeout(() => chatInput?.focus(), 100);
    }

    // ============================================
    // CLOSE AND REFRESH CHAT (× button)
    // Closes chat and clears conversation
    // ============================================
    function closeAndRefreshChat() {
        const { chatWindow, chatBody, chatInput, chatToggleBtn } = state.elements;
        
        if (state.isOpen) {
            chatWindow?.classList.remove('active');
            chatWindow?.setAttribute('aria-hidden', 'true');
        }
        
        state.isOpen = false;
        state.isMinimized = false;

        setTimeout(() => {
            if (chatBody) {
                chatBody.innerHTML = '';
            }
            
            if (chatInput) {
                chatInput.value = '';
            }
            
            chatToggleBtn?.setAttribute('aria-expanded', 'false');
            chatToggleBtn?.classList.remove('has-pending-chat');
            chatToggleBtn?.setAttribute('aria-label', 'Open chat');
            
            addBotMessage('👋 Hi there! How can I help you today?');
        }, 300);
    }

    // ============================================
    // MESSAGE HANDLING
    // ============================================
    function sendMessage() {
        const { chatInput, chatBody } = state.elements;
        if (!chatInput || !chatBody) return;

        const message = chatInput.value.trim();
        if (!message) return;

        addUserMessage(message);
        chatInput.value = '';
        scrollToBottom();
        showTypingIndicator();

        setTimeout(() => {
            hideTypingIndicator();
            
            const caseNum = generateCaseNumber();
            const botResponse = `
                <strong>✓ Message received!</strong><br><br>
                Thanks for reaching out. I've created <strong>Case #${caseNum}</strong> in our system.<br><br>
                Our team will contact you shortly. For emergencies, please call <a href="tel:281-506-8826">281-506-8826</a>.
            `;
            
            addBotMessage(botResponse);
            scrollToBottom();
        }, 1500);
    }

    function addUserMessage(text) {
        const { chatBody } = state.elements;
        if (!chatBody) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.textContent = text;
        messageDiv.setAttribute('aria-live', 'polite');
        
        chatBody.appendChild(messageDiv);
    }

    function addBotMessage(html) {
        const { chatBody } = state.elements;
        if (!chatBody) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.innerHTML = html;
        
        chatBody.appendChild(messageDiv);
    }

    // ============================================
    // TYPING INDICATOR
    // ============================================
    function showTypingIndicator() {
        const { chatBody } = state.elements;
        if (!chatBody) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        
        chatBody.appendChild(typingDiv);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // ============================================
    // UTILITIES
    // ============================================
    function scrollToBottom() {
        const { chatBody } = state.elements;
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }

    function generateCaseNumber() {
        return Math.floor(10000 + Math.random() * 90000);
    }

    // ============================================
    // CLEANUP
    // ============================================
    function destroy() {
        if (state.observer) {
            state.observer.disconnect();
            state.observer = null;
        }

        document.removeEventListener('keydown', handleGlobalKeydown);

        state.elements = {};
        state.isOpen = false;
        state.isMinimized = false;
    }

    // ============================================
    // EXPOSE MINIMAL API
    // ============================================
    const api = {
        open: openChat,
        minimize: minimizeChat,
        restore: restoreChat,
        closeAndRefresh: closeAndRefreshChat,
        send: sendMessage,
        isOpen: () => state.isOpen,
        isMinimized: () => state.isMinimized,
        destroy: destroy
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose via CustomEvent
    document.dispatchEvent(new CustomEvent('chat:api-ready', {
        detail: api,
        bubbles: true
    }));

})();