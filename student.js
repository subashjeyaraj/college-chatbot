/**
 * Student Chatbot Logic & AI Interaction Engine
 */

let speechOutputEnabled = false;
let recognition = null;
let isListening = false;

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    // Check or setup user
    let currentUser = CollegeStorage.getCurrentUser();
    if (!currentUser) {
        currentUser = { username: "student", role: "student", name: "Guest Student" };
        CollegeStorage.setCurrentUser(currentUser);
    }

    const userNameLabel = document.getElementById("userNameLabel");
    if (userNameLabel) {
        userNameLabel.textContent = currentUser.name || currentUser.username;
    }

    // Load saved messages if any
    loadSavedChat();

    // Setup input listeners
    const input = document.getElementById("messageInput");
    if (input) {
        input.focus();
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Setup Web Speech API if supported
    setupSpeechRecognition();
});

// Format time for message bubbles
function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Quick Prompt Sender
function sendPrompt(text) {
    const input = document.getElementById("messageInput");
    if (input) {
        input.value = text;
        sendMessage();
    }
}

// Main Send Message Handler
function sendMessage() {
    const input = document.getElementById("messageInput");
    const rawMsg = input ? input.value.trim() : "";
    if (!rawMsg) return;

    const chatBox = document.getElementById("chatBox");
    const timestamp = getTimestamp();

    // 1. Render User Message
    const userMsgHtml = `
        <div class="message-row user">
            <div class="message-bubble">
                ${escapeHtml(rawMsg)}
                <span class="msg-timestamp">${timestamp}</span>
            </div>
        </div>
    `;
    chatBox.innerHTML += userMsgHtml;
    input.value = "";
    scrollToBottom();

    // Save to history
    saveChatMessage("user", rawMsg, timestamp);

    // 2. Show Typing Indicator
    showTyping(true);

    // 3. Process AI Response with realistic micro-delay
    setTimeout(() => {
        showTyping(false);
        const botResponse = generateBotResponse(rawMsg);
        renderBotResponse(botResponse);
        CollegeStorage.incrementQueryCount();
    }, 450 + Math.random() * 300);
}

// AI Matching Logic
function generateBotResponse(userQuery) {
    const query = userQuery.toLowerCase().trim();
    const cleanTokens = query.replace(/[^\w\s]/gi, '').split(/\s+/);

    // Greetings check
    const greetings = ["hi", "hello", "hey", "hola", "greetings", "good morning", "good afternoon", "good evening"];
    if (greetings.includes(query) || (cleanTokens.length === 1 && greetings.includes(cleanTokens[0]))) {
        return {
            text: "Hello there! 👋 I'm your Apex Campus Assistant. How can I assist you with your college academics, fee dates, or campus facilities today?",
            chips: ["Syllabus", "Fee Structure", "Exam Dates", "Hostel Info"]
        };
    }

    // Who are you / About
    if (query.includes("who are you") || query.includes("what can you do") || query.includes("help") || query.includes("features")) {
        return {
            text: "🤖 I am **CampusBot AI**, built for Apex University students & staff.\n\nI can answer questions regarding:\n• 📚 Course Syllabus & Academic Handbooks\n• 💰 Tuition Fees, Payment Schedules & Scholarships\n• 📅 Exam Dates, Hall Tickets & Timetables\n• 🚀 Campus Placements & Company Statistics\n• 🏢 Hostel Rooms, Mess Menus & Rules\n• 📖 Library Timings & IEEE E-Resources\n• 📞 Contact Numbers of Deans, HODs, & Helplines",
            chips: ["View Campus Map", "Check Fees", "Download Syllabus"]
        };
    }

    // Thank you
    if (query.includes("thank") || query.includes("thanks")) {
        return {
            text: "You're very welcome! 😊 Feel free to ask whenever you need academic assistance. Have a productive day at Apex!",
            chips: ["Library Hours", "Campus Map"]
        };
    }

    // Search Knowledge Base
    const data = CollegeStorage.getChatData();
    let bestMatch = null;
    let highestScore = 0;

    data.forEach(item => {
        let score = 0;
        const mainKw = (item.keyword || "").toLowerCase();

        // Exact match or contains main keyword
        if (query.includes(mainKw) && mainKw.length > 2) {
            score += 10;
        }

        // Check aliases
        if (Array.isArray(item.aliases)) {
            item.aliases.forEach(alias => {
                const a = alias.toLowerCase();
                if (query.includes(a)) {
                    score += 8;
                }
            });
        }

        // Word overlap
        cleanTokens.forEach(token => {
            if (token.length > 3) {
                if (mainKw.includes(token)) score += 3;
                if ((item.response || "").toLowerCase().includes(token)) score += 1;
            }
        });

        if (score > highestScore) {
            highestScore = score;
            bestMatch = item;
        }
    });

    if (bestMatch && highestScore >= 5) {
        return {
            text: bestMatch.response,
            image: bestMatch.image,
            file: bestMatch.file,
            fileName: bestMatch.fileName,
            category: bestMatch.category
        };
    }

    // Fallback if no match
    return {
        text: "I couldn't find an exact record for that query. 🤔\n\nCould you try rephrasing or pick from one of the popular categories below?",
        chips: ["Academic Syllabus", "Fee Schedule", "Exam Dates", "Placement Stats", "Hostels", "Campus Map", "Emergency Contacts"]
    };
}

// Render Bot Response Bubble
function renderBotResponse(responseObj) {
    const chatBox = document.getElementById("chatBox");
    const timestamp = getTimestamp();

    let contentHtml = formatMarkdown(responseObj.text);

    // Media attachment (image)
    if (responseObj.image) {
        contentHtml += `
            <div class="attachment-card">
                <img src="${responseObj.image}" alt="Campus visual" class="attachment-img" onclick="openImageModal('${responseObj.image}')">
            </div>
        `;
    }

    // File attachment (PDF/Doc)
    if (responseObj.file && responseObj.fileName) {
        contentHtml += `
            <div class="attachment-card">
                <div class="attachment-file-bar">
                    <div class="file-info">
                        <span style="font-size:1.2rem;">📄</span>
                        <span>${escapeHtml(responseObj.fileName)}</span>
                    </div>
                    <a href="${responseObj.file}" download="${responseObj.fileName}">
                        <button class="btn btn-primary btn-sm" style="width:auto;padding:0.35rem 0.75rem;">
                            ⬇️ Download
                        </button>
                    </a>
                </div>
            </div>
        `;
    }

    // Interactive suggestion chips if available
    let chipsHtml = "";
    if (responseObj.chips && responseObj.chips.length > 0) {
        chipsHtml = `
            <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.75rem;">
                ${responseObj.chips.map(chip => `
                    <button class="chip-btn" onclick="sendPrompt('${escapeHtml(chip)}')">${escapeHtml(chip)}</button>
                `).join("")}
            </div>
        `;
    }

    const botMsgHtml = `
        <div class="message-row bot">
            <img src="assets/bot-avatar.jpg" alt="Bot Avatar" class="msg-avatar">
            <div class="message-bubble">
                ${contentHtml}
                ${chipsHtml}
                <div class="message-actions">
                    <button class="msg-action-btn" onclick="copyMessageText(this)" title="Copy Response">
                        📋 Copy
                    </button>
                    <button class="msg-action-btn" onclick="speakText('${escapeSingleQuotes(responseObj.text)}')" title="Listen to Response">
                        🔊 Read Aloud
                    </button>
                    <span class="msg-timestamp">${timestamp}</span>
                </div>
            </div>
        </div>
    `;

    chatBox.innerHTML += botMsgHtml;
    scrollToBottom();

    // Auto speak if toggle enabled
    if (speechOutputEnabled) {
        speakText(responseObj.text);
    }

    // Save to history
    saveChatMessage("bot", responseObj.text, timestamp, responseObj.image, responseObj.file, responseObj.fileName);
}

// Markdown formatting helper
function formatMarkdown(text) {
    if (!text) return "";
    let safe = escapeHtml(text);

    // Bold **text**
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Bullet lines starting with • or -
    safe = safe.replace(/^(?:•|-)\s+(.*)$/gm, '<li style="margin-left: 1.25rem;">$1</li>');
    
    // Wrap lists if any
    safe = safe.replace(/(<li.*<\/li>)/s, '<ul style="margin: 0.5rem 0;">$1</ul>');

    // Line breaks
    safe = safe.replace(/\n/g, '<br>');

    return safe;
}

// Escape HTML utility
function escapeHtml(string) {
    if (!string) return "";
    return string
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeSingleQuotes(str) {
    if (!str) return "";
    return str.replace(/'/g, "\\'").replace(/\n/g, " ");
}

// Typing Indicator Controller
function showTyping(show) {
    const indicator = document.getElementById("typingIndicator");
    if (indicator) {
        indicator.style.display = show ? "flex" : "none";
        if (show) scrollToBottom();
    }
}

// Auto Scroll to bottom of chatbox
function scrollToBottom() {
    const chatBox = document.getElementById("chatBox");
    if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// Copy Message Content to Clipboard
function copyMessageText(btn) {
    const bubble = btn.closest(".message-bubble");
    if (!bubble) return;

    // Extract text content excluding timestamp and actions
    const clone = bubble.cloneNode(true);
    const actions = clone.querySelector(".message-actions");
    if (actions) actions.remove();
    
    const textToCopy = clone.innerText.trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = "✅ Copied!";
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 1800);
    }).catch(err => {
        showToast("Unable to copy to clipboard", "error");
    });
}

// Text-to-Speech Output
function speakText(text) {
    if (!('speechSynthesis' in window)) {
        showToast("Text-to-speech is not supported in this browser.", "info");
        return;
    }

    window.speechSynthesis.cancel(); // Stop any previous speech
    const cleanText = text.replace(/[*#•\-]/g, ' ').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

function toggleSpeechOutput() {
    speechOutputEnabled = !speechOutputEnabled;
    const btn = document.getElementById("speechToggleBtn");
    if (btn) {
        btn.textContent = speechOutputEnabled ? "🔊" : "🔇";
        btn.style.color = speechOutputEnabled ? "#38bdf8" : "#94a3b8";
    }
    showToast(`Voice read-aloud ${speechOutputEnabled ? "Activated" : "Muted"}`, "info");
}

// Speech Recognition (Voice Typing)
function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        const micBtn = document.getElementById("micBtn");
        if (micBtn) {
            micBtn.style.opacity = "0.5";
            micBtn.title = "Voice input not supported on this browser";
        }
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
        isListening = true;
        const micBtn = document.getElementById("micBtn");
        if (micBtn) micBtn.classList.add("listening");
        showToast("Listening... speak your question now", "info");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById("messageInput");
        if (input) {
            input.value = transcript;
            sendMessage();
        }
    };

    recognition.onerror = (event) => {
        isListening = false;
        const micBtn = document.getElementById("micBtn");
        if (micBtn) micBtn.classList.remove("listening");
        showToast("Voice recognition error: " + event.error, "error");
    };

    recognition.onend = () => {
        isListening = false;
        const micBtn = document.getElementById("micBtn");
        if (micBtn) micBtn.classList.remove("listening");
    };
}

function toggleSpeechRecognition() {
    if (!recognition) {
        showToast("Speech recognition is not available in your browser.", "info");
        return;
    }

    if (isListening) {
        recognition.stop();
    } else {
        try {
            recognition.start();
        } catch (e) {
            recognition.stop();
        }
    }
}

// Image Zoom Modal
function openImageModal(imgSrc) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    if (modal && modalImg) {
        modalImg.src = imgSrc;
        modal.style.display = "flex";
    }
}

function closeImageModal() {
    const modal = document.getElementById("imageModal");
    if (modal) modal.style.display = "none";
}

// Chat Persistence Helpers
function saveChatMessage(sender, text, timestamp, image = null, file = null, fileName = null) {
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem("studentChatHistory") || "[]");
    } catch (e) {
        history = [];
    }

    history.push({ sender, text, timestamp, image, file, fileName });
    if (history.length > 50) history.shift(); // Keep last 50
    localStorage.setItem("studentChatHistory", JSON.stringify(history));
}

function loadSavedChat() {
    try {
        const history = JSON.parse(localStorage.getItem("studentChatHistory") || "[]");
        if (history.length > 0) {
            const chatBox = document.getElementById("chatBox");
            // Clear default welcome if history exists
            chatBox.innerHTML = "";
            history.forEach(msg => {
                if (msg.sender === "user") {
                    chatBox.innerHTML += `
                        <div class="message-row user">
                            <div class="message-bubble">
                                ${escapeHtml(msg.text)}
                                <span class="msg-timestamp">${msg.timestamp || ""}</span>
                            </div>
                        </div>
                    `;
                } else {
                    renderBotResponse({
                        text: msg.text,
                        image: msg.image,
                        file: msg.file,
                        fileName: msg.fileName
                    });
                }
            });
            scrollToBottom();
        }
    } catch (e) {
        console.error("Error loading chat history:", e);
    }
}

function clearChatHistory() {
    if (confirm("Are you sure you want to clear your chat history?")) {
        localStorage.removeItem("studentChatHistory");
        const chatBox = document.getElementById("chatBox");
        if (chatBox) {
            chatBox.innerHTML = `
                <div class="message-row bot">
                    <img src="assets/bot-avatar.jpg" alt="Bot Avatar" class="msg-avatar">
                    <div class="message-bubble">
                        Chat reset! How can I help you today?
                        <span class="msg-timestamp">${getTimestamp()}</span>
                    </div>
                </div>
            `;
        }
        showToast("Chat history cleared.", "info");
    }
}

function exportChatTranscript() {
    try {
        const history = JSON.parse(localStorage.getItem("studentChatHistory") || "[]");
        if (history.length === 0) {
            showToast("No chat history to export yet.", "info");
            return;
        }

        let transcriptText = "APEX UNIVERSITY - CAMPUS CHATBOT TRANSCRIPT\n";
        transcriptText += "Exported on: " + new Date().toLocaleString() + "\n";
        transcriptText += "===================================================\n\n";

        history.forEach(item => {
            const speaker = item.sender === "user" ? "STUDENT" : "CAMPUSBOT";
            transcriptText += `[${item.timestamp || "Time"}] ${speaker}:\n${item.text}\n\n`;
        });

        const blob = new Blob([transcriptText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `CampusBot_Transcript_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast("Transcript downloaded successfully!", "success");
    } catch (e) {
        showToast("Failed to export transcript", "error");
    }
}