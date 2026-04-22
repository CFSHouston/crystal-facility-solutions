/* ============================================
   CHAT MODULE - PRODUCTION READY
   Crystal Facility Solutions
   ============================================ */

(function() {
    'use strict';

    // ─── Configuration ──────────────────────────────────────────
    const CONFIG = {
        phone: '281-506-8826',
        typingDelay: 1500,
        closeAnimationDelay: 300,
        focusDelay: 100
    };

    // ─── Module State ───────────────────────────────────────────
    const state = {
        isInitialized: false,
        elements: {},
        isOpen: false,
        isMinimized: false,
        timeouts: [],
        boundHandlers: {}
    };

    // ─── Initialization ─────────────────────────────────────────
    function init() {
        if (state.isInitialized) return;

        cacheElements();
        if (!validateElements()) return;

        bindEvents();
        setInitialState();
        state.isInitialized = true;
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

        chatWindow.classList.remove('active');
        chatCloseBtn?.setAttribute('tabindex', '-1');
        chatMinimizeBtn?.setAttribute('tabindex', '-1');
        chatInput?.setAttribute('tabindex', '-1');
        chatSendBtn?.setAttribute('tabindex', '-1');
        chatWindow.setAttribute('aria-hidden', 'true');

        addBotMessage('Hi there! How can I help you today?');
    }

    function bindEvents() {
        const { chatToggleBtn, chatInput, chatSendBtn, chatCloseBtn, chatMinimizeBtn } = state.elements;

        const onToggle = () => handleToggle();
        const onMinimize = (e) => { e.stopPropagation(); minimizeChat(); };
        const onClose = (e) => { e.stopPropagation(); closeAndRefreshChat(); };
        const onKeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
        const onSend = () => sendMessage();
        const onEscape = (e) => { if (e.key === 'Escape' && state.isOpen) minimizeChat(); };

        chatToggleBtn?.addEventListener('click', onToggle);
        chatMinimizeBtn?.addEventListener('click', onMinimize);
        chatCloseBtn?.addEventListener('click', onClose);
        chatInput?.addEventListener('keypress', onKeypress);
        chatSendBtn?.addEventListener('click', onSend);
        document.addEventListener('keydown', onEscape);

        state.boundHandlers = {
            chatToggleBtn: { el: chatToggleBtn, onToggle },
            chatMinimizeBtn: { el: chatMinimizeBtn, onMinimize },
            chatCloseBtn: { el: chatCloseBtn, onClose },
            chatInput: { el: chatInput, onKeypress },
            chatSendBtn: { el: chatSendBtn, onSend },
            document: { onEscape }
        };
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

        chatWindow.removeAttribute('aria-hidden');
        chatCloseBtn?.removeAttribute('tabindex');
        chatMinimizeBtn?.removeAttribute('tabindex');
        chatInput?.removeAttribute('tabindex');
        chatSendBtn?.removeAttribute('tabindex');
        chatWindow.classList.add('active');
        chatToggleBtn.setAttribute('aria-expanded', 'true');
        chatToggleBtn.classList.remove('has-pending-chat');

        const timeoutId = setTimeout(() => chatInput?.focus(), CONFIG.focusDelay);
        state.timeouts.push(timeoutId);
    }

    function minimizeChat() {
        const { chatWindow, chatToggleBtn, chatCloseBtn, chatMinimizeBtn, chatInput, chatSendBtn } = state.elements;

        state.isOpen = false;
        state.isMinimized = true;

        chatToggleBtn?.focus();
        chatWindow.classList.remove('active');
        chatCloseBtn?.setAttribute('tabindex', '-1');
        chatMinimizeBtn?.setAttribute('tabindex', '-1');
        chatInput?.setAttribute('tabindex', '-1');
        chatSendBtn?.setAttribute('tabindex', '-1');
        chatWindow.setAttribute('aria-hidden', 'true');
        chatToggleBtn.setAttribute('aria-expanded', 'false');
        chatToggleBtn.classList.add('has-pending-chat');
        chatToggleBtn.setAttribute('aria-label', 'Restore chat');
    }

    function closeAndRefreshChat() {
        const { chatWindow, chatBody, chatInput, chatToggleBtn, chatCloseBtn, chatMinimizeBtn, chatSendBtn } = state.elements;

        state.isOpen = false;
        state.isMinimized = false;

        chatToggleBtn?.focus();
        chatWindow.classList.remove('active');
        chatCloseBtn?.setAttribute('tabindex', '-1');
        chatMinimizeBtn?.setAttribute('tabindex', '-1');
        chatInput?.setAttribute('tabindex', '-1');
        chatSendBtn?.setAttribute('tabindex', '-1');
        chatWindow.setAttribute('aria-hidden', 'true');

        const timeoutId = setTimeout(() => {
            // Clear messages safely
            while (chatBody.firstChild) {
                chatBody.removeChild(chatBody.firstChild);
            }
            chatInput.value = '';
            chatToggleBtn.setAttribute('aria-expanded', 'false');
            chatToggleBtn.classList.remove('has-pending-chat');
            chatToggleBtn.setAttribute('aria-label', 'Open chat');
            addBotMessage('Hi there! How can I help you today?');
        }, CONFIG.closeAnimationDelay);
        state.timeouts.push(timeoutId);
        state.timeouts.push(timeoutId);
    }

    function sendMessage() {
        const { chatInput, chatBody } = state.elements;
        const text = chatInput?.value.trim();
        if (!text) return;

        addUserMessage(text);
        chatInput.value = '';
        showTyping();

        const timeoutId = setTimeout(() => {
            hideTyping();
            const caseNum = Math.floor(10000 + Math.random() * 90000);
            const message = 'Message received! Thanks for reaching out. I\'ve created Case #' + caseNum + ' in our system. Our team will contact you shortly. For emergencies, please call ' + CONFIG.phone + '.';
            addBotMessage(message);
            scrollToBottom();
        }, CONFIG.typingDelay);
        state.timeouts.push(timeoutId);
    }

    function addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'message user';
        div.textContent = text;
        state.elements.chatBody.appendChild(div);
        scrollToBottom();
    }

    function addBotMessage(text) {
        const div = document.createElement('div');
        div.className = 'message bot';
        div.textContent = text;
        state.elements.chatBody.appendChild(div);
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'message bot typing-indicator';
        div.id = 'typingIndicator';

        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            div.appendChild(span);
        }

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

    // ─── Cleanup / Destroy ──────────────────────────────────────
    function destroy() {
        if (!state.isInitialized) return;

        // Clear timeouts
        state.timeouts.forEach(id => clearTimeout(id));
        state.timeouts = [];

        // Remove event listeners
        if (state.boundHandlers.chatToggleBtn) {
            state.boundHandlers.chatToggleBtn.el?.removeEventListener('click', state.boundHandlers.chatToggleBtn.onToggle);
        }
        if (state.boundHandlers.chatMinimizeBtn) {
            state.boundHandlers.chatMinimizeBtn.el?.removeEventListener('click', state.boundHandlers.chatMinimizeBtn.onMinimize);
        }
        if (state.boundHandlers.chatCloseBtn) {
            state.boundHandlers.chatCloseBtn.el?.removeEventListener('click', state.boundHandlers.chatCloseBtn.onClose);
        }
        if (state.boundHandlers.chatInput) {
            state.boundHandlers.chatInput.el?.removeEventListener('keypress', state.boundHandlers.chatInput.onKeypress);
        }
        if (state.boundHandlers.chatSendBtn) {
            state.boundHandlers.chatSendBtn.el?.removeEventListener('click', state.boundHandlers.chatSendBtn.onSend);
        }
        if (state.boundHandlers.document) {
            document.removeEventListener('keydown', state.boundHandlers.document.onEscape);
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