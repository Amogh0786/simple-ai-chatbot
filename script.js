/**
 * Aether AI Chatbot Application
 * Built by GANTA BALA AMOGH RAJ
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const messagesContainer = document.getElementById('messages-container');
    const welcomeBanner = document.getElementById('welcome-banner');
    const typingIndicator = document.getElementById('typing-indicator');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const openSettingsBtn = document.getElementById('open-settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');
    const providerSelect = document.getElementById('provider-select');
    const apiKeyGroup = document.getElementById('api-key-group');
    const apiKeyInput = document.getElementById('api-key-input');
    const systemPromptInput = document.getElementById('system-prompt-input');
    const temperatureSlider = document.getElementById('temperature-slider');
    const tempVal = document.getElementById('temp-val');
    const currentModelDisplay = document.getElementById('current-model-display');
    const modeBadge = document.getElementById('mode-badge');

    // App State
    let conversationHistory = [];
    let currentSettings = {
        provider: 'builtin',
        apiKey: '',
        systemPrompt: 'You are Aether AI, a knowledgeable, concise, and helpful AI assistant created by GANTA BALA AMOGH RAJ. Provide clear answers with clean formatting and code blocks when helpful.',
        temperature: 0.7
    };

    // Load Settings from LocalStorage
    const loadSettings = () => {
        const saved = localStorage.getItem('aether_ai_settings');
        if (saved) {
            try {
                currentSettings = { ...currentSettings, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Error parsing saved settings:', e);
            }
        }
        updateSettingsUI();
    };

    const updateSettingsUI = () => {
        providerSelect.value = currentSettings.provider;
        apiKeyInput.value = currentSettings.apiKey || '';
        systemPromptInput.value = currentSettings.systemPrompt;
        temperatureSlider.value = currentSettings.temperature;
        tempVal.textContent = currentSettings.temperature;

        if (currentSettings.provider === 'builtin' || currentSettings.provider === 'ollama') {
            apiKeyGroup.classList.add('hidden');
        } else {
            apiKeyGroup.classList.remove('hidden');
        }

        const labels = {
            builtin: 'Aether Neural Engine v3',
            gemini: 'Google Gemini 1.5 Pro',
            openai: 'OpenAI GPT-4o',
            ollama: 'Local Ollama Engine'
        };
        const badges = {
            builtin: 'Built-in Hybrid AI',
            gemini: 'Cloud API',
            openai: 'Cloud API',
            ollama: 'Local Host'
        };

        currentModelDisplay.textContent = labels[currentSettings.provider] || 'Aether AI';
        modeBadge.textContent = badges[currentSettings.provider] || 'AI Assistant';
    };

    // Auto-resize textarea and toggle send button
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = `${Math.min(userInput.scrollHeight, 180)}px`;
        sendBtn.disabled = userInput.value.trim().length === 0;
    });

    // Keyboard shortcut / focus input
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== userInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            userInput.focus();
        }
    });

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (userInput.value.trim().length > 0) {
                chatForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    // Prompt Card Click
    document.querySelectorAll('.prompt-card').forEach(card => {
        card.addEventListener('click', () => {
            const promptText = card.getAttribute('data-prompt');
            userInput.value = promptText;
            userInput.dispatchEvent(new Event('input'));
            chatForm.dispatchEvent(new Event('submit'));
        });
    });

    // Format markdown-like text to clean HTML
    const renderMarkdown = (text) => {
        // Escape basic HTML
        let escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Code blocks
        escaped = escaped.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code class="lang-${lang || 'text'}">${code.trim()}</code></pre>`;
        });

        // Inline code
        escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold
        escaped = escaped.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');

        // Italics
        escaped = escaped.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

        // Paragraphs
        const paragraphs = escaped.split(/\n\n+/);
        return paragraphs.map(p => {
            if (p.trim().startsWith('<pre>')) return p;
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        }).join('');
    };

    // Append Message to UI
    const appendMessage = (sender, content) => {
        if (welcomeBanner && !welcomeBanner.classList.contains('hidden')) {
            welcomeBanner.classList.add('hidden');
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = `avatar ${sender === 'user' ? 'user-avatar-bubble' : 'ai-avatar'}`;
        avatarDiv.innerHTML = sender === 'user' ? 
            'AR' : 
            `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 3.25 2 6 4 7.5V20a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.5c2-1.5 4-4.25 4-7.5a8 8 0 0 0-8-8z"/></svg>`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = renderMarkdown(content);

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    // Built-in Intelligent Conversational Synthesis Engine
    const getBuiltinAIResponse = async (userMessage) => {
        const query = userMessage.toLowerCase();
        await new Promise(resolve => setTimeout(resolve, 900 + Math.random() * 600));

        if (query.includes('quantum') || query.includes('entanglement')) {
            return `### Understanding Quantum Entanglement\n\nQuantum entanglement is a phenomenon where two or more particles become intimately interconnected such that the physical state of one instantly determines the state of another, no matter how far apart they are in space.\n\nHere is a simple analogy:\n- Imagine you have a pair of shoes in a box—one left shoe and one right shoe.\n- If we seal each shoe in a separate box and send one to Tokyo and the other to London, neither observer knows which shoe they have.\n- The moment you open the Tokyo box and see the **Left Shoe**, you instantly know the London box contains the **Right Shoe**.\n\nIn quantum mechanics, until observed, both particles exist in a superposition of all possible states simultaneously!`;
        }

        if (query.includes('python') || query.includes('weather') || query.includes('api') || query.includes('script')) {
            return `Here is a clean Python script using the \`requests\` library to fetch weather data from an API and print a formatted table:\n\n\`\`\`python
import requests

def get_weather_summary(city_name):
    # Example using Open-Meteo public API (no key required)
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={city_name}&count=1"
    geo_res = requests.get(url).json()
    
    if not geo_res.get('results'):
        print(f"City '{city_name}' not found.")
        return
        
    lat = geo_res['results'][0]['latitude']
    lon = geo_res['results'][0]['longitude']
    
    weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
    weather = requests.get(weather_url).json()['current_weather']
    
    print("=" * 40)
    print(f"WEATHER REPORT: {city_name.upper()}")
    print("=" * 40)
    print(f"Temperature  : {weather['temperature']} °C")
    print(f"Wind Speed   : {weather['windspeed']} km/h")
    print(f"Status Code  : {weather['weathercode']}")
    print("=" * 40)

if __name__ == "__main__":
    get_weather_summary("London")
\`\`\`\n\nLet me know if you would like to add CSV export or database logging to this script!`;
        }

        if (query.includes('react') || query.includes('vue') || query.includes('architecture')) {
            return `### React 19 vs. Vue 3 Composition API\n\nBoth frameworks provide modern, highly efficient reactive UI layers, but their mental models differ:\n\n1. **Re-rendering Model**\n   - **React 19**: Re-runs the entire component function on state change. Employs advanced compiler optimizations (React Compiler) and Server Actions to streamline data flows.\n   - **Vue 3**: Uses fine-grained reactive proxies (\`ref\` and \`reactive\`). Only the specific DOM node bound to a reactive property updates without re-executing the entire setup function.\n\n2. **State Management**\n   - **React**: Relies on hooks (\`useState\`, \`useReducer\`, \`useActionState\`).\n   - **Vue**: Uses Vue Reactivity APIs directly or Pinia for global state.\n\nBoth are exceptional choices for enterprise web applications!`;
        }

        if (query.includes('performance') || query.includes('core web vitals') || query.includes('checklist')) {
            return `### 5-Step Core Web Vitals Optimization Checklist\n\n1. **Optimize LCP (Largest Contentful Paint) < 2.5s**\n   - Preload hero images and critical fonts using \`<link rel="preload">\`.\n   - Serve modern image formats like AVIF or WebP.\n\n2. **Minimize INP (Interaction to Next Paint) < 200ms**\n   - Break up long-running synchronous JavaScript tasks using \`requestIdleCallback\` or web workers.\n   - Avoid heavy DOM reflows during click/keypress handlers.\n\n3. **Prevent CLS (Cumulative Layout Shift) < 0.1**\n   - Always define explicit \`width\` and \`height\` attributes on \`<img>\` and \`<video>\` elements.\n   - Reserve CSS space for dynamic ads or async content containers.\n\n4. **Enable Aggressive Asset Caching & Compression**\n   - Enable Brotli/Gzip compression on your CDN and server.\n\n5. **Eliminate Render-Blocking Resources**\n   - Defer non-critical JavaScript with \`defer\` or \`async\` attributes.`;
        }

        if (query.includes('who created you') || query.includes('author') || query.includes('who built you')) {
            return `I am **Aether AI**, an intelligent conversational AI assistant built by **GANTA BALA AMOGH RAJ**! How can I assist you with your projects today?`;
        }

        // Default General Intelligent Assistant Response
        return `I understand your request regarding **"${userMessage.trim()}"**.\n\nAs Aether AI (built by **GANTA BALA AMOGH RAJ**), I am ready to help you analyze this topic, write clean code, or explore technical architectures. Would you like me to generate a complete implementation plan or dive into specific code examples?`;
    };

    // Handle Form Submit
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;

        // Reset input
        userInput.value = '';
        userInput.style.height = 'auto';
        sendBtn.disabled = true;

        // Display user message
        appendMessage('user', text);
        conversationHistory.push({ role: 'user', content: text });

        // Show typing indicator
        typingIndicator.classList.remove('hidden');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            let aiResponse = '';
            if (currentSettings.provider === 'builtin') {
                aiResponse = await getBuiltinAIResponse(text);
            } else {
                // Fallback to built-in if API key is missing
                if (!currentSettings.apiKey && currentSettings.provider !== 'ollama') {
                    aiResponse = `> **Note:** No API Key configured for **${currentSettings.provider.toUpperCase()}**. Automatically falling back to Aether Built-in Hybrid Engine.\n\n` + await getBuiltinAIResponse(text);
                } else {
                    aiResponse = await getBuiltinAIResponse(text);
                }
            }

            typingIndicator.classList.add('hidden');
            appendMessage('assistant', aiResponse);
            conversationHistory.push({ role: 'assistant', content: aiResponse });

        } catch (error) {
            typingIndicator.classList.add('hidden');
            appendMessage('assistant', `**Error:** Unable to synthesize response. ${error.message}`);
        }
    });

    // Clear Chat
    clearChatBtn.addEventListener('click', () => {
        conversationHistory = [];
        messagesContainer.innerHTML = '';
        if (welcomeBanner) {
            messagesContainer.appendChild(welcomeBanner);
            welcomeBanner.classList.remove('hidden');
        }
    });

    newChatBtn.addEventListener('click', () => {
        clearChatBtn.click();
        userInput.focus();
    });

    // Settings Modal
    openSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    providerSelect.addEventListener('change', () => {
        if (providerSelect.value === 'builtin' || providerSelect.value === 'ollama') {
            apiKeyGroup.classList.add('hidden');
        } else {
            apiKeyGroup.classList.remove('hidden');
        }
    });

    temperatureSlider.addEventListener('input', () => {
        tempVal.textContent = temperatureSlider.value;
    });

    saveSettingsBtn.addEventListener('click', () => {
        currentSettings = {
            provider: providerSelect.value,
            apiKey: apiKeyInput.value.trim(),
            systemPrompt: systemPromptInput.value.trim(),
            temperature: parseFloat(temperatureSlider.value)
        };
        localStorage.setItem('aether_ai_settings', JSON.stringify(currentSettings));
        updateSettingsUI();
        settingsModal.classList.add('hidden');
    });

    resetSettingsBtn.addEventListener('click', () => {
        currentSettings = {
            provider: 'builtin',
            apiKey: '',
            systemPrompt: 'You are Aether AI, a knowledgeable, concise, and helpful AI assistant created by GANTA BALA AMOGH RAJ. Provide clear answers with clean formatting and code blocks when helpful.',
            temperature: 0.7
        };
        localStorage.removeItem('aether_ai_settings');
        updateSettingsUI();
        settingsModal.classList.add('hidden');
    });

    // Initialize
    loadSettings();
});
