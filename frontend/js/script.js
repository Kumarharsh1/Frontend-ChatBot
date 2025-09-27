let currentChatType = 'general';
let chatHistory = [];
let messageCount = 0;
let fileCount = 0;
let isCartoonTheme = true;

// Assistant configurations with fun descriptions
const assistantConfigs = {
    general: {
        name: "General AI Assistant",
        desc: "Your magical helper for everything!",
        icon: "🔮",
        color: "#FF6B8B",
        avatar: "🔮"
    },
    news: {
        name: "News Assistant", 
        desc: "Fresh news and hot topics!",
        icon: "📰",
        color: "#4ECDC4",
        avatar: "📰"
    },
    health: {
        name: "Health & Wellness",
        desc: "Your friendly health advisor!",
        icon: "🏥",
        color: "#45B7D1",
        avatar: "🏥"
    },
    ecommerce: {
        name: "E-commerce",
        desc: "Shopping made fun and easy!",
        icon: "🛒",
        color: "#96CEB4",
        avatar: "🛒"
    },
    travel: {
        name: "Travel & Hospitality",
        desc: "Adventure and travel planning!",
        icon: "✈️",
        color: "#FFEAA7",
        avatar: "✈️"
    }
};

// Fun facts to display
const funFacts = [
    "Did you know? AI can process information faster than the speed of light! ⚡",
    "Fun fact: This chatbot learns from every conversation! 🧠",
    "Wow! AI can help write stories, poems, and even songs! 🎵",
    "Amazing! This technology was science fiction just 10 years ago! 🚀",
    "Cool fact: AI can understand context and emotions! 😊"
];

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    showRandomFact();
    createConfetti();
});

function initializeApp() {
    updateStats();
    setupDragAndDrop();
    showNotification('🎉 Magic AI ChatBot is Ready!', 'success');
}

function setupEventListeners() {
    // Function button event listeners
    document.querySelectorAll('.func-btn').forEach(button => {
        button.addEventListener('click', function() {
            switchAssistant(this.dataset.type, this.dataset.color);
        });
    });

    // Message input events
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // File input events
    document.getElementById('dropZone').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // URL input enter key support
    document.getElementById('urlInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            processUpload();
        }
    });
}

function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.style.borderColor = '#4ECDC4';
        dropZone.style.backgroundColor = 'rgba(78, 205, 196, 0.1)';
        dropZone.style.transform = 'scale(1.05)';
    }

    function unhighlight() {
        dropZone.style.borderColor = '';
        dropZone.style.backgroundColor = '';
        dropZone.style.transform = 'scale(1)';
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }
}

function switchAssistant(type, color) {
    // Remove active class from all buttons
    document.querySelectorAll('.func-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.currentTarget.classList.add('active');
    
    // Update current chat type
    currentChatType = type;
    
    // Update assistant display
    const config = assistantConfigs[type];
    document.getElementById('assistantName').textContent = config.name;
    document.getElementById('assistantDesc').textContent = config.desc;
    document.querySelector('.assistant-avatar').textContent = config.avatar;
    
    // Add system message with fun animation
    addMessage(`✨ Switched to ${config.name} mode! ${getRandomEmoji()} How can I assist you today?`, 'bot');
    
    updateStats();
    showNotification(`🎯 ${config.name} activated!`, 'success');
    createConfetti();
}

function getRandomEmoji() {
    const emojis = ['😊', '👍', '🎉', '🚀', '🌟', '⚡', '🎯', '🌈'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) {
        showNotification('💬 Please enter a message first!', 'warning');
        return;
    }

    // Add user message to chat
    addMessage(message, 'user');
    messageInput.value = '';
    messageInput.style.height = 'auto';
    messageCount++;
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        const response = await fetch('http://localhost:5000/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                type: currentChatType
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Remove typing indicator
        hideTypingIndicator();
        
        if (data.error) {
            addMessage(`❌ Oops! Error: ${data.error}`, 'bot');
            showNotification('⚠️ AI service error', 'error');
        } else {
            addMessage(data.response, 'bot');
            showNotification('✅ Response received!', 'success');
            createConfetti();
        }
    } catch (error) {
        hideTypingIndicator();
        addMessage('❌ Connection error! Please check if the backend is running on port 5000. 🛠️', 'bot');
        showNotification('🔌 Connection failed', 'error');
        console.error('API Error:', error);
    }
    
    updateStats();
}

function showTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    indicator.style.display = 'flex';
    
    // Auto-hide after 30 seconds as fallback
    setTimeout(() => {
        if (indicator.style.display === 'flex') {
            hideTypingIndicator();
            showNotification('⏰ Request timeout', 'warning');
        }
    }, 30000);
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    indicator.style.display = 'none';
}

async function processUpload() {
    const fileInput = document.getElementById('fileInput');
    const urlInput = document.getElementById('urlInput');
    
    if (fileInput.files.length > 0) {
        await uploadFile(fileInput.files[0]);
    } else if (urlInput.value.trim()) {
        await processUrl(urlInput.value.trim());
    } else {
        showNotification('📁 Please select a file or enter a URL!', 'warning');
    }
}

async function uploadFile(file) {
    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('text')) {
        showNotification('❌ Please select a PDF or text file!', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', currentChatType);

    try {
        showNotification('📤 Uploading and processing file...', 'info');
        const response = await fetch('http://localhost:5000/api/upload/file', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            showNotification('❌ Upload error: ' + data.error, 'error');
        } else {
            showNotification('✅ File processed successfully!', 'success');
            fileCount++;
            document.getElementById('fileInput').value = '';
            updateStats();
            createConfetti();
            
            // Add confirmation message to chat
            addMessage(`📁 File "${file.name}" has been processed and is now available for questions! ${getRandomEmoji()}`, 'bot');
        }
    } catch (error) {
        showNotification('❌ Upload failed: ' + error.message, 'error');
    }
}

async function processUrl(url) {
    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        showNotification('🌐 Please enter a valid URL starting with http:// or https://', 'warning');
        return;
    }

    try {
        showNotification('🔗 Processing URL content...', 'info');
        const response = await fetch('http://localhost:5000/api/upload/url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url,
                type: currentChatType
            })
        });

        if (!response.ok) {
            throw new Error(`URL processing failed: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            showNotification('❌ URL processing error: ' + data.error, 'error');
        } else {
            showNotification('✅ URL content processed successfully!', 'success');
            document.getElementById('urlInput').value = '';
            createConfetti();
            
            // Add confirmation message to chat
            addMessage(`🔗 Content from URL has been processed and is now available for questions! ${getRandomEmoji()}`, 'bot');
        }
    } catch (error) {
        showNotification('❌ URL processing failed: ' + error.message, 'error');
    }
}

function handleFileSelect(file) {
    if (file.type === 'application/pdf' || file.type === 'text/plain' || file.type.includes('pdf') || file.type.includes('text')) {
        uploadFile(file);
    } else {
        showNotification('❌ Please select a PDF or text file!', 'warning');
    }
}

function addMessage(content, sender) {
    const chatMessages = document.getElementById('chatMessages');
    
    // Remove welcome message if it's the first user message
    if (sender === 'user' && messageCount === 0) {
        const welcomeMsg = document.querySelector('.welcome-message');
        if (welcomeMsg) welcomeMsg.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Convert URLs to clickable links
    const formattedContent = content.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" style="color: inherit; text-decoration: underline; font-weight: 600;">$1</a>'
    );
    
    messageContent.innerHTML = formattedContent;
    messageDiv.appendChild(messageContent);
    
    // Add timestamp
    const timestamp = document.createElement('div');
    timestamp.className = 'message-meta';
    timestamp.innerHTML = `⏰ ${new Date().toLocaleTimeString()}`;
    messageDiv.appendChild(timestamp);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to chat history
    chatHistory.push({
        type: sender,
        content: content,
        timestamp: new Date().toISOString(),
        assistant: currentChatType
    });
    
    return messageDiv;
}

function updateStats() {
    document.getElementById('messageCount').textContent = messageCount;
    document.getElementById('fileCount').textContent = fileCount;
}

function clearChat() {
    if (confirm('Are you sure you want to clear the chat history? 🧹')) {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        messageCount = 0;
        chatHistory = [];
        updateStats();
        
        // Add welcome message back
        const welcomeMsg = document.createElement('div');
        welcomeMsg.className = 'welcome-message';
        welcomeMsg.innerHTML = `
            <div class="welcome-avatar">🤖</div>
            <div class="welcome-content">
                <h3>Chat Cleared! 🧹</h3>
                <p>Fresh start! Choose an assistant and let's begin a new adventure! 🚀</p>
            </div>
        `;
        chatMessages.appendChild(welcomeMsg);
        
        showNotification('💫 Chat history cleared!', 'info');
        createConfetti();
    }
}

function tellJoke() {
    const jokes = [
        "Why did the AI go to school? To improve its algorithm! 🤓",
        "Why was the computer cold? It left its Windows open! ❄️",
        "What do you call a funny robot? A laugh-a-bot! 😂",
        "Why did the chatbot break up with its girlfriend? It needed more space! 💔",
        "What's an AI's favorite type of music? Al-gorithms! 🎵"
    ];
    
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    addMessage(joke, 'bot');
    showNotification('😂 Here\'s a joke for you!', 'success');
}

function toggleTheme() {
    // This would toggle between cartoon and other themes
    showNotification('🎨 Theme changer coming soon!', 'info');
}

function addEmoji(emoji) {
    const messageInput = document.getElementById('messageInput');
    messageInput.value += emoji;
    messageInput.focus();
    showNotification(`😊 Added ${emoji} to message!`, 'success');
}

function showRandomFact() {
    const fact = funFacts[Math.floor(Math.random() * funFacts.length)];
    document.querySelector('.fact-box p').textContent = fact;
}

function showNotification(message, type) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 25px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.4s ease;
        font-weight: 600;
        border: 3px solid white;
        max-width: 300px;
        text-align: center;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 4000);
}

function getNotificationColor(type) {
    const colors = {
        'success': 'linear-gradient(135deg, #96CEB4, #84DCC6)',
        'error': 'linear-gradient(135deg, #FF6B8B, #FF8FA3)',
        'warning': 'linear-gradient(135deg, #FFEAA7, #FFD166)',
        'info': 'linear-gradient(135deg, #45B7D1, #4ECDC4)'
    };
    return colors[type] || colors.info;
}

function createConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiPieces = [];
    const colors = ['#FF6B8B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#A593E0'];

    for (let i = 0; i < 50; i++) {
        confettiPieces.push({
            x: Math.random() * canvas.width,
            y: -10,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * 360
        });
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let activePieces = 0;
        
        confettiPieces.forEach(piece => {
            piece.y += piece.speed;
            piece.x += Math.sin(piece.angle * Math.PI / 180) * 2;
            piece.angle += 5;
            
            ctx.save();
            ctx.translate(piece.x, piece.y);
            ctx.rotate(piece.angle * Math.PI / 180);
            ctx.fillStyle = piece.color;
            ctx.fillRect(-piece.size/2, -piece.size/2, piece.size, piece.size);
            ctx.restore();
            
            if (piece.y < canvas.height) {
                activePieces++;
            }
        });
        
        if (activePieces > 0) {
            requestAnimationFrame(animateConfetti);
        }
    }
    
    animateConfetti();
}

// Auto-focus message input on load
window.addEventListener('load', function() {
    setTimeout(() => {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.focus();
        }
    }, 1000);
});

// Export chat function
function exportChat() {
    if (chatHistory.length === 0) {
        showNotification('💬 No chat history to export!', 'warning');
        return;
    }

    const chatData = {
        exportDate: new Date().toISOString(),
        totalMessages: messageCount,
        chatHistory: chatHistory
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('📁 Chat exported successfully!', 'success');
}