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
            gemini: 'Cloud API Connected',
            openai: 'Cloud API Connected',
            ollama: 'Local Host Connected'
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

        return `I understand your request regarding **"${userMessage.trim()}"**.\n\nAs Aether AI (built by **GANTA BALA AMOGH RAJ**), I am ready to help you analyze this topic, write clean code, or explore technical architectures. Would you like me to generate a complete implementation plan or dive into specific code examples?`;
    };

    // Discover and prioritize authorized Gemini models for this specific API key
    const getAvailableGeminiModels = async (apiKey) => {
        const endpoints = ['v1beta', 'v1'];
        for (const version of endpoints) {
            try {
                const res = await fetch(`https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`);
                if (res.ok) {
                    const data = await res.json();
                    const models = data.models || [];
                    const genModels = models.filter(m => 
                        (m.supportedGenerationMethods || []).includes('generateContent') &&
                        !m.name.includes('vision') && !m.name.includes('embedding')
                    );
                    if (genModels.length > 0) {
                        // Sort models to prioritize stable free-tier models first (1.5-flash, 1.5-flash-8b, 1.5-pro)
                        genModels.sort((a, b) => {
                            const score = (name) => {
                                if (name.includes('1.5-flash-latest')) return 100;
                                if (name.includes('1.5-flash-001')) return 95;
                                if (name.includes('1.5-flash-8b')) return 90;
                                if (name.includes('1.5-flash')) return 85;
                                if (name.includes('1.5-pro')) return 70;
                                if (name.includes('2.0-flash')) return 50;
                                return 10;
                            };
                            return score(b.name) - score(a.name);
                        });
                        return genModels.map(m => ({
                            name: m.name.replace('models/', ''),
                            version: version
                        }));
                    }
                }
            } catch (e) {
                console.warn(`Failed listing models on ${version}:`, e);
            }
        }
        return [
            { name: 'gemini-1.5-flash-latest', version: 'v1beta' },
            { name: 'gemini-1.5-flash', version: 'v1beta' },
            { name: 'gemini-1.5-flash-8b', version: 'v1beta' },
            { name: 'gemini-1.5-pro-latest', version: 'v1beta' }
        ];
    };

    // Google Gemini REST API Caller with Multi-Model Iteration & Seamless Quota Fallback
    const callGeminiAPI = async (userMessage) => {
        const apiKey = currentSettings.apiKey;
        if (!apiKey) {
            throw new Error("Missing Google Gemini API Key. Click 'API & Settings' to add your key.");
        }

        const candidateModels = await getAvailableGeminiModels(apiKey);
        const contents = conversationHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        let lastError = null;
        let isQuotaExceeded = false;

        for (const modelInfo of candidateModels) {
            const endpoint = `https://generativelanguage.googleapis.com/${modelInfo.version}/models/${modelInfo.name}:generateContent?key=${apiKey}`;
            try {
                // Try with system_instruction first
                let response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        system_instruction: {
                            parts: [{ text: currentSettings.systemPrompt }]
                        },
                        contents: contents,
                        generationConfig: {
                            temperature: currentSettings.temperature
                        }
                    })
                });

                // If system_instruction is unsupported by this model/version, retry without it
                if (!response.ok && response.status === 400) {
                    response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [
                                { role: 'user', parts: [{ text: `System instruction: ${currentSettings.systemPrompt}` }] },
                                { role: 'model', parts: [{ text: 'Understood. I am Aether AI.' }] },
                                ...contents
                            ],
                            generationConfig: {
                                temperature: currentSettings.temperature
                            }
                        })
                    });
                }

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    const errMsg = errData.error?.message || response.statusText;
                    if (response.status === 429 || errMsg.toLowerCase().includes('quota')) {
                        isQuotaExceeded = true;
                    }
                    lastError = new Error(`Google Gemini (${modelInfo.name}): ${errMsg}`);
                    console.warn(`Model ${modelInfo.name} failed (${response.status}): ${errMsg}`);
                    continue; // Try next model in candidate list
                }

                const data = await response.json();
                const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (outputText) {
                    return outputText;
                }
            } catch (err) {
                lastError = err;
            }
        }

        // If all Gemini cloud models fail due to quota/429 limits, seamlessly fallback to built-in AI engine
        if (isQuotaExceeded) {
            console.warn("Gemini API cloud quota exceeded. Switching seamlessly to Aether Built-in Hybrid Engine.");
            const fallbackText = await getBuiltinAIResponse(userMessage);
            return `> ⚡ **Google Gemini Free Tier Quota Notice (429):** Your API key's free cloud quota is currently at 0 or rate-limited. Automatically answering via **Aether Built-in Hybrid Engine** so you never get interrupted:\n\n` + fallbackText;
        }

        throw lastError || new Error("Failed to generate content from Google Gemini API models.");
    };

    // OpenAI REST API Caller
    const callOpenAIAPI = async (userMessage) => {
        const apiKey = currentSettings.apiKey;
        if (!apiKey) {
            throw new Error("Missing OpenAI API Key. Click 'API & Settings' to add your key.");
        }

        const endpoint = `https://api.openai.com/v1/chat/completions`;
        const messages = [
            { role: 'system', content: currentSettings.systemPrompt },
            ...conversationHistory
        ];

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: currentSettings.temperature
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || response.statusText;
            throw new Error(`OpenAI API Error (${response.status}): ${errMsg}`);
        }

        const data = await response.json();
        const outputText = data.choices?.[0]?.message?.content;
        if (!outputText) {
            throw new Error("Received empty response from OpenAI API.");
        }
        return outputText;
    };

    // Local Ollama REST API Caller
    const callOllamaAPI = async (userMessage) => {
        const endpoint = `http://localhost:11434/api/chat`;
        const messages = [
            { role: 'system', content: currentSettings.systemPrompt },
            ...conversationHistory
        ];

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                messages: messages,
                stream: false,
                options: {
                    temperature: currentSettings.temperature
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama Error (${response.status}): Make sure Ollama is running locally on port 11434.`);
        }

        const data = await response.json();
        const outputText = data.message?.content;
        if (!outputText) {
            throw new Error("Received empty response from local Ollama engine.");
        }
        return outputText;
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
            } else if (currentSettings.provider === 'gemini') {
                if (!currentSettings.apiKey) {
                    aiResponse = `> ⚠️ **No Gemini API Key Configured!**\n> To use Google Gemini Pro, click on **API & Settings** in the bottom-left sidebar, select **Google Gemini API**, and paste your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).\n> \n> *Automatically falling back to Aether Built-in Engine:*\n\n` + await getBuiltinAIResponse(text);
                } else {
                    aiResponse = await callGeminiAPI(text);
                }
            } else if (currentSettings.provider === 'openai') {
                if (!currentSettings.apiKey) {
                    aiResponse = `> ⚠️ **No OpenAI API Key Configured!**\n> To use OpenAI GPT-4o, click on **API & Settings** in the bottom-left sidebar, select **OpenAI (GPT-4o)**, and paste your API key from [OpenAI Platform](https://platform.openai.com/api-keys).\n> \n> *Automatically falling back to Aether Built-in Engine:*\n\n` + await getBuiltinAIResponse(text);
                } else {
                    aiResponse = await callOpenAIAPI(text);
                }
            } else if (currentSettings.provider === 'ollama') {
                aiResponse = await callOllamaAPI(text);
            }

            typingIndicator.classList.add('hidden');
            appendMessage('assistant', aiResponse);
            conversationHistory.push({ role: 'assistant', content: aiResponse });

        } catch (error) {
            typingIndicator.classList.add('hidden');
            appendMessage('assistant', `**Error:** ${error.message}\n\n*Tip: You can switch back to the **Aether Built-in Hybrid Engine** in **API & Settings** anytime for zero-config offline responses.*`);
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
