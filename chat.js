/**
 * Mistral AI Chatbot Integration
 */

const chatFab = document.getElementById('chat-fab');
const chatPanel = document.getElementById('chat-panel-widget');
const chatCloseBtn = document.getElementById('chat-close-btn');
const chatConfigBtn = document.getElementById('chat-config-btn');
const chatConfigPanel = document.getElementById('chat-config-panel');
const mistralApiKeyInput = document.getElementById('mistral-api-key');
const saveKeyBtn = document.getElementById('save-key-btn');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const noteFrame = document.getElementById('note-frame');

const STORAGE_KEY = 'mistral_api_key';

// Check for existing API key
function initApiKey() {
    const key = localStorage.getItem(STORAGE_KEY);
    if (key) {
        mistralApiKeyInput.value = key;
        chatConfigPanel.classList.add('hidden');
    } else {
        chatConfigPanel.classList.remove('hidden');
    }
}

// UI Toggles
function toggleChat() {
    chatPanel.classList.toggle('open');
}

chatFab.addEventListener('click', toggleChat);
chatCloseBtn.addEventListener('click', () => chatPanel.classList.remove('open'));

chatConfigBtn.addEventListener('click', () => {
    chatConfigPanel.classList.toggle('hidden');
});

// Save API Key
saveKeyBtn.addEventListener('click', () => {
    const key = mistralApiKeyInput.value.trim();
    if (key) {
        localStorage.setItem(STORAGE_KEY, key);
        chatConfigPanel.classList.add('hidden');
    }
});

// Add message to chat DOM
function appendMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${role}`;

    // Simple markdown parsing for the response (bold and code blocks)
    let parsedContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');

    msgDiv.innerHTML = `<div class="message-content">${parsedContent}</div>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
}

// Extract content from currently loaded iframe for RAG context
function getNoteContext() {
    try {
        const iframeDoc = noteFrame.contentDocument || noteFrame.contentWindow.document;
        // Basic extraction of readable text
        const text = Array.from(iframeDoc.body.childNodes)
            .filter(node => node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE')
            .map(node => node.textContent || node.innerText || '')
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

        return text.substring(0, 8000); // Limit context length to avoid huge payload
    } catch (e) {
        console.warn("Could not extract iframe context", e);
        return "No specific note context available. Answer generally about deep learning.";
    }
}

// Handle sending message
async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const apiKey = localStorage.getItem(STORAGE_KEY);
    if (!apiKey) {
        chatConfigPanel.classList.remove('hidden');
        appendMessage('assistant', 'Please enter your Mistral API key first.');
        return;
    }

    // Disable input
    chatInput.value = '';
    chatInput.disabled = true;
    chatSendBtn.disabled = true;

    // Show user message
    appendMessage('user', text);

    // Show typing indicator
    const typingMsg = appendMessage('assistant', '...');

    const context = getNoteContext();

    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'mistral-tiny',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful AI assistant specialized in Deep Learning. You answer questions strictly based on the provided context from the user's study notes. Keep answers concise. Formatting: Use **bold** for emphasis and \`code\` for technical terms.\n\nContext:\n${context}`
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        const data = await response.json();

        // Remove typing indicator
        typingMsg.remove();

        if (response.ok) {
            appendMessage('assistant', data.choices[0].message.content);
        } else {
            appendMessage('assistant', `Error: ${data.error?.message || 'Failed to reach Mistral API.'}`);
        }
    } catch (err) {
        typingMsg.remove();
        appendMessage('assistant', `Error connecting to API: ${err.message}`);
    } finally {
        // Re-enable input
        chatInput.disabled = false;
        chatSendBtn.disabled = false;
        chatInput.focus();
    }
}

// Event listeners for sending
chatSendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Initialize
initApiKey();
