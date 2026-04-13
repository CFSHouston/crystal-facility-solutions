/* ============================================
   CRYSTAL FACILITY SOLUTIONS - CHAT MODULE
   Fixed: aria-hidden warning, removed inert
   ============================================ */

(function() {
    'use strict';

    const state = {
        elements: {},
        isOpen: false,
        isMinimized: false
    };

    function init() {
        cacheElements();
        if (!validateElements()) {
            console.warn('Chat: Elements not found');
            return;
        }
        bindEvents();
        setInitialState();
    }

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
        const { chatWindow, chatBody, chatInput, chatToggleBtn } = state.elements;
        return !!(chatWindow && chatBody && chatInput && chatToggleBtn);
    }

    function setInitialState() {
        const { chatWindow, chatCloseBtn, chatMinimizeBtn, chatInput, chatSendBtn } = state.elements;
        
        // Set initial closed state
        chatWindow.classList.remove('active');
        // FIX: Set aria-hidden last, after ensuring no focus inside
        chatCloseBtn?.setAttribute('tabindex', '-1');
        chatMinimizeBtn?.setAttribute('tabindex', '-1');
        chatInput?.setAttribute('tabindex', '-1');
        chatSendBtn?.setAttribute('tabindex', '-1');
        chatWindow.setAttribute('aria-hidden', 'true');
        
        // Add greeting
        addBotMessage('👋 Hi there! How can I help you today?');
    }

    function bindEvents() {
        const { chatToggleBtn, chatInput, chatSendBtn, chatCloseBtn, chatMinimizeBtn } = state.elements;

        chatToggleBtn?.addEventListener('click', handleToggle);
        chatMinimizeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            minimizeChat();
        });
        chatCloseBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAndRefreshChat();
        });
        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
        chatSendBtn?.addEventListener('click', sendMessage);
        
        // Escape key to minimize
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.isOpen) minimizeChat();
        });
    }

    function handleToggle() {
        if (state.isMinimized || !state.isOpen) {
            openChat();
        }
    }

    function openChat() {
        const { chatWindow, chatToggleBtn, chatInput, chatCloseBtn, chatMinimizeBtn, chatSendBtn } = state.elements;
        
        state.isOpen = true;
        state.isMinimized = false;

        // FIX: Remove aria-hidden FIRST, then enable focus, then add active class
        chatWindow.removeAttribute('aria-hidden');
        
        // Enable focus
        chatCloseBtn?.removeAttribute('tabindex');
        chatMinimizeBtn?.removeAttribute('tabindex');
        chatInput?.removeAttribute('tabindex');
        chatSendBtn?.removeAttribute('tabindex');
        
        // Now show the window
        chatWindow.classList.add('active');
        
        // Update toggle button
        chatToggleBtn.setAttribute('aria-expanded', 'true');
        chatToggleBtn.classList.remove('has-pending-chat');
        
        // Focus input after animation
        setTimeout(() => chatInput?.focus(), 100);
    }

    function minimizeChat() {
        const { chatWindow, chatToggleBtn, chatCloseBtn, chatMinimizeBtn, chatInput, chatSendBtn } = state.elements;
        
        state.isOpen = false;
        state.isMinimized = true;

        // FIX: Move focus to toggle button BEFORE hiding
        chatToggleBtn?.focus();
        
        // Now hide the window
        chatWindow.classList.remove('active');
        
        // Disable focus via tabindex
        chatCloseBtn?.setAttribute('tabindex', '-1');
        chatMinimizeBtn?.setAttribute('tabindex', '-1');
        chatInput?.setAttribute('tabindex', '-1');
        chatSendBtn?.setAttribute('tabindex', '-1');
        
        // Set aria-hidden LAST (after focus is moved away)
        chatWindow.setAttribute('aria-hidden', 'true');
        
        // Update toggle button
        chatToggleBtn.setAttribute('aria-expanded', 'false');
        chatToggleBtn.classList.add('has-pending-chat');
        chatToggleBtn.setAttribute('aria-label', 'Restore chat');
    }

    function closeAndRefreshChat() {
        const { chatWindow, chatBody, chatInput, chatToggleBtn, chatCloseBtn, chatMinimizeBtn, chatSendBtn } = state.elements;
        
        state.isOpen = false;
        state.isMinimized = false;

        // FIX: Move focus to toggle button BEFORE hiding
        chatToggleBtn?.focus();
        
        // Now hide the window
        chatWindow.classList.remove('active');
        
        // Disable focus via tabindex
        chatCloseBtn?.setAttribute('tabindex', '-1');
        chatMinimizeBtn?.setAttribute('tabindex', '-1');
        chatInput?.setAttribute('tabindex', '-1');
        chatSendBtn?.setAttribute('tabindex', '-1');
        
        // Set aria-hidden LAST (after focus is moved away)
        chatWindow.setAttribute('aria-hidden', 'true');

        // Clear after animation
        setTimeout(() => {
            chatBody.innerHTML = '';
            chatInput.value = '';
            chatToggleBtn.setAttribute('aria-expanded', 'false');
            chatToggleBtn.classList.remove('has-pending-chat');
            chatToggleBtn.setAttribute('aria-label', 'Open chat');
            addBotMessage('👋 Hi there! How can I help you today?');
        }, 300);
    }

    function sendMessage() {
        const { chatInput, chatBody } = state.elements;
        const text = chatInput?.value.trim();
        if (!text) return;

        addUserMessage(text);
        chatInput.value = '';
        showTyping();

        setTimeout(() => {
            hideTyping();
            const caseNum = Math.floor(10000 + Math.random() * 90000);
            addBotMessage(`<strong>✓ Message received!</strong><br><br>Thanks for reaching out. I've created <strong>Case #${caseNum}</strong> in our system.<br><br>Our team will contact you shortly. For emergencies, please call <a href="tel:281-506-8826">281-506-8826</a>.`);
            scrollToBottom();
        }, 1500);
    }

    function addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'message user';
        div.textContent = text;
        state.elements.chatBody.appendChild(div);
        scrollToBottom();
    }

    function addBotMessage(html) {
        const div = document.createElement('div');
        div.className = 'message bot';
        div.innerHTML = html;
        state.elements.chatBody.appendChild(div);
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'message bot typing-indicator';
        div.id = 'typingIndicator';
        div.innerHTML = '<span></span><span></span><span></span>';
        state.elements.chatBody.appendChild(div);
        scrollToBottom();
    }

    function hideTyping() {
        document.getElementById('typingIndicator')?.remove();
    }

    function scrollToBottom() {
        const { chatBody } = state.elements;
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();