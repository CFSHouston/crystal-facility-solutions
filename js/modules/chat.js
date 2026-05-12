/* ============================================
   CHAT MODULE - Simple Lead Capture
   No backend needed - shows phone at end
   ============================================ */

(function() {
    'use strict';

    const CONFIG = {
        phone: '281-506-8826',
        phoneDisplay: '(281) 506-8826',
        typingDelay: 700
    };

    const state = {
        elements: {},
        isOpen: false,
        userData: { name: '', reason: '', message: '' },
        step: 0
    };

    const FLOW = [
        { bot: 'Hi there! 👋 Welcome to Crystal Facility Solutions. What\'s your name?' },
        { 
            bot: 'Nice to meet you, {name}! What service are you interested in?',
            options: ['Cleaning Services', 'Transportation', 'Landscaping', 'Maintenance', 'Other']
        },
        { bot: 'Tell us more about your needs — property size, schedule, or anything specific?' },
        { 
            bot: 'Thanks, {name}! 🎯\n\nHere\'s how to reach our team directly:\n\n📞 **{phone}**\n\n⏰ We typically respond within 2 hours during business hours.\n\nYou can also email us at: info@cfshouston.com',
            final: true
        }
    ];

    function init() {
        cacheElements();
        bindEvents();
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

    function bindEvents() {
        const { chatToggleBtn, chatInput, chatSendBtn, chatCloseBtn, chatMinimizeBtn } = state.elements;

        chatToggleBtn?.addEventListener('click', () => {
            if (!state.isOpen) {
                openChat();
                if (state.step === 0) {
                    state.step = 1;
                    setTimeout(() => showStep(0), 500);
                }
            } else {
                minimizeChat();
            }
        });

        chatMinimizeBtn?.addEventListener('click', (e) => { e.stopPropagation(); minimizeChat(); });
        chatCloseBtn?.addEventListener('click', (e) => { e.stopPropagation(); closeChat(); });
        
        chatInput?.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') handleInput(); 
        });
        chatSendBtn?.addEventListener('click', () => handleInput());
    }

    function openChat() {
        state.isOpen = true;
        state.elements.chatWindow.classList.add('active');
        state.elements.chatWindow.removeAttribute('aria-hidden');
        state.elements.chatToggleBtn.setAttribute('aria-expanded', 'true');
    }

    function minimizeChat() {
        state.isOpen = false;
        state.elements.chatWindow.classList.remove('active');
        state.elements.chatWindow.setAttribute('aria-hidden', 'true');
        state.elements.chatToggleBtn.setAttribute('aria-expanded', 'false');
    }

    function closeChat() {
        minimizeChat();
        setTimeout(() => {
            state.elements.chatBody.innerHTML = '';
            state.elements.chatInput.value = '';
            state.step = 0;
            state.userData = { name: '', reason: '', message: '' };
        }, 300);
    }

    function showStep(index) {
        const step = FLOW[index];
        let msg = step.bot
            .replace('{name}', state.userData.name)
            .replace('{phone}', CONFIG.phoneDisplay);

        // Show typing indicator
        showTyping();
        
        setTimeout(() => {
            hideTyping();
            addBotMessage(msg);

            if (step.options) {
                showOptions(step.options);
                hideInput();
            } else if (step.final) {
                showFinalActions();
                hideInput();
            } else {
                showInput();
                const placeholders = ['Your name...', 'Select above', 'Your message...'];
                state.elements.chatInput.placeholder = placeholders[index] || 'Type here...';
            }
        }, CONFIG.typingDelay);
    }

    function showOptions(options) {
        const container = document.createElement('div');
        container.className = 'chat-options';
        
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chat-option-btn';
            btn.textContent = opt;
            btn.onclick = () => {
                container.remove();
                addUserMessage(opt);
                state.userData.reason = opt;
                state.step = 3;
                showStep(2);
            };
            container.appendChild(btn);
        });
        
        state.elements.chatBody.appendChild(container);
        scrollToBottom();
    }

    function showFinalActions() {
        const container = document.createElement('div');
        container.className = 'chat-call-options';

        // Call
        const callBtn = document.createElement('a');
        callBtn.href = `tel:+1${CONFIG.phone.replace(/-/g, '')}`;
        callBtn.className = 'chat-call-btn chat-call-primary';
        callBtn.innerHTML = '<i class="fas fa-phone-alt"></i> Call Now';
        container.appendChild(callBtn);

        // Copy number
        const copyBtn = document.createElement('button');
        copyBtn.className = 'chat-call-btn chat-call-secondary';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Number';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(CONFIG.phoneDisplay);
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Number', 2000);
        };
        container.appendChild(copyBtn);

        // Start over
        const restartBtn = document.createElement('button');
        restartBtn.className = 'chat-call-btn chat-call-ghost';
        restartBtn.innerHTML = '<i class="fas fa-redo"></i> New Chat';
        restartBtn.onclick = () => {
            closeChat();
            setTimeout(() => {
                openChat();
                state.step = 1;
                showStep(0);
            }, 400);
        };
        container.appendChild(restartBtn);

        state.elements.chatBody.appendChild(container);
        scrollToBottom();
    }

    function handleInput() {
        const text = state.elements.chatInput.value.trim();
        if (!text) return;

        addUserMessage(text);
        state.elements.chatInput.value = '';

        if (state.step === 1) {
            state.userData.name = text;
            state.step = 2;
            showStep(1);
        } else if (state.step === 3) {
            state.userData.message = text;
            state.step = 4;
            showStep(3);
        }
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
        div.innerHTML = text.replace(/\n/g, '<br>');
        state.elements.chatBody.appendChild(div);
        scrollToBottom();
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

    function showInput() {
        state.elements.chatInput.style.display = '';
        state.elements.chatSendBtn.style.display = '';
    }

    function hideInput() {
        state.elements.chatInput.style.display = 'none';
        state.elements.chatSendBtn.style.display = 'none';
    }

    function scrollToBottom() {
        state.elements.chatBody.scrollTop = state.elements.chatBody.scrollHeight;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();