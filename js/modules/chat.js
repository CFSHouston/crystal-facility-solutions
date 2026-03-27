/* ============================================
   CRYSTAL FACILITY SOLUTIONS - CHAT MODULE
   Chat Widget Functionality
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // DOM ELEMENTS
    // ============================================
    let chatWindow = null;
    let chatBody = null;
    let chatInput = null;

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        chatWindow = document.getElementById('chatWindow');
        chatBody = document.getElementById('chatBody');
        chatInput = document.getElementById('chatInput');

        if (!chatWindow || !chatBody || !chatInput) {
            console.warn('Chat elements not found in DOM');
            return;
        }

        // Bind global functions
        window.toggleChat = toggleChat;
        window.sendMessage = sendMessage;
    }

    // ============================================
    // TOGGLE CHAT WINDOW
    // ============================================
    function toggleChat() {
        if (!chatWindow) return;
        chatWindow.classList.toggle('active');
        
        // Focus input when opening
        if (chatWindow.classList.contains('active') && chatInput) {
            setTimeout(() => chatInput.focus(), 100);
        }
    }

    // ============================================
    // SEND MESSAGE
    // ============================================
    function sendMessage() {
        if (!chatInput || !chatBody) return;

        const message = chatInput.value.trim();
        
        if (!message) return;

        // Add user message
        addMessage(message, 'user');

        // Clear input
        chatInput.value = '';
        
        // Scroll to bottom
        scrollToBottom();

        // Simulate bot response
        setTimeout(() => {
            const caseNum = Math.floor(Math.random() * 10000);
            const botResponse = `
                <strong>✓ Message received!</strong><br><br>
                Thanks for reaching out. I've created Case #${caseNum} in our Salesforce system. Our team will contact you shortly.
            `;
            addMessage(botResponse, 'bot');
            scrollToBottom();
        }, 1000);
    }

    // ============================================
    // ADD MESSAGE TO CHAT
    // ============================================
    function addMessage(content, type) {
        if (!chatBody) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        // Support HTML content for bot messages
        if (type === 'bot') {
            messageDiv.innerHTML = content;
        } else {
            messageDiv.textContent = content;
        }

        chatBody.appendChild(messageDiv);
    }

    // ============================================
    // SCROLL TO BOTTOM
    // ============================================
    function scrollToBottom() {
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }

    // ============================================
    // HANDLE ENTER KEY
    // ============================================
    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        init();

        // Bind enter key on chat input
        if (chatInput) {
            chatInput.addEventListener('keypress', handleKeyPress);
        }
    });

})();