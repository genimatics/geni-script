// Chat Widget Script
(function () {
  // Get current script tag
  const currentScript = document.currentScript;

  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap";
  document.head.appendChild(fontLink);

  // Configuration from script attributes or global config
  const config = {
    apiKey:
      currentScript.getAttribute("data-api-key") ||
      window.CHAT_WIDGET_CONFIG?.apiKey ||
      "default-api-key",
    apiUrl:
      currentScript.getAttribute("data-api-url") || "http://localhost:4000",
    iconColor: currentScript.getAttribute("data-icon-color") || "#222722",
  };

  // Store session ID temporarily
  let sessionId = null;

  // Create and append styles
  const styles = document.createElement("style");
  styles.textContent = `
  .chat-overlay{
  font-family: roboto;
    display: none;
  height: 100vh;
  position: fixed;
  top:0;
  left:0;
  width: 100vw;
  background-color: rgba(0,0,0,0.4);
  justify-content: center;
  align-items: center;
  
  }
  .chat-overlay.show{
  display: flex;
  
  }
        .chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            font-family: Arial, sans-serif;
        }

        .chat-icon {
            width: 60px;
            height: 60px;
            font-size: 25px;
            background: ${config.iconColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .chat-icon svg {
            width: 30px;
            height: 30px;
            fill: white;
        }

        .chat-window {
            display: none;
            width: 80%;
            min-height: 100px;
            height: fit-content;
            max-height: 500px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            flex-direction: column;
            opacity: 0;
            transform: scale(0.95);
            transition: opacity 0.3s, transform 0.3s;
        }

        .chat-window.show {
            display: flex;
            opacity: 1;
            // transform: scale(1);
        }

        .chat-header {
            display: flex;
            flex-direction: row;
            gap-x: 10px;
            align-items: center;
            font-size: 24px;
            padding: 20px 10px; 
            background: ${config.iconColor};
            color: white;
            border-radius: 10px 10px 0 0;
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
        }

        .message {
            margin-bottom: 10px;
            padding: 8px 12px;
            border-radius: 15px;
            max-width: 80%;
        }

        .user-message {
            background: #E3F2FD;
            margin-left: auto;
        }

        .bot-message {
            background: #F5F5F5;
        }

        .chat-input {
            padding: 15px;
            display: flex;
            flex-direction: row;
            gap-x: 10px;
            border-top: 1px solid #eee;
        }

        .chat-input input {
            width: 97%;
            padding: 12px 16px ;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
        }
             .chat-input button {
      background-color: ${config.iconColor};
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: 10px;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .chat-input button:hover {
      background-color: #0056b3;
    }

    .chat-input button:focus {
      outline: none;
    }
          .chat-input svg {
      width: 20px;
      height: 20px;
      fill: white;
    }
    `;
  document.head.appendChild(styles);
  // <img src="https://raw.githubusercontent.com/genimatics/geni-script/7ec5af75c9c5bed1f60d85ba8241d7f2b1ba5095/bg-logo.png" alt="AI" style="width: 50px; height: 50px;"/>

  // Create chat widget HTML
  const widgetHTML = `
   <div class="chat-widget">
            <div class="chat-icon">
            💬
               
            </div>
            
        </div>
  <div class="chat-overlay">

       
        <div class="chat-window">
                <div class="chat-header">
                <img src="https://raw.githubusercontent.com/genimatics/geni-script/7ec5af75c9c5bed1f60d85ba8241d7f2b1ba5095/bg-logo.png" alt="AI" 
                style="width: 50px; height: 50px; margin-right: 20px"/>
                Ask Geni
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input">
                    <input type="text" placeholder="Type a message...">
                    <button type="button" id="send-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
</svg>
</button>
                </div>
            </div>
        </div>
    `;

  // Append widget to body
  const div = document.createElement("div");
  div.innerHTML = widgetHTML;
  document.body.appendChild(div);

  // Get DOM elements
  const chatIcon = document.querySelector(".chat-icon");
  const chatWindow = document.querySelector(".chat-window");
  const chatOVerlayWindow = document.querySelector(".chat-overlay");
  const chatInput = document.querySelector(".chat-input input");
  const chatMessages = document.querySelector(".chat-messages");

  function setInputState(disabled) {
    chatInput.disabled = disabled;
    // Optionally add/remove a visual class
    if (disabled) {
      chatInput.classList.add('disabled');
    } else {
      chatInput.classList.remove('disabled');
    }
  }

  addMessage(
    "Hey there, I am Geni, you AI assistant, how can i help you today?",
    "bot"
  );

  // Toggle chat window
  chatIcon.addEventListener("click", () => {
    chatWindow.classList.toggle("show");
    chatOVerlayWindow.classList.toggle("show");
  });

  // Close chat window on outside click
  document.addEventListener("click", (e) => {
    if (!chatWindow.contains(e.target) && !chatIcon.contains(e.target)) {
      chatOVerlayWindow.classList.remove("show");
      chatWindow.classList.remove("show");
    }
  });

  async function handleChatMessage() {
    if (!chatInput.value.trim() || isProcessing) {
      return;
    }

    isProcessing = true;
    setInputState(true)

    // Add user message to chat
    addMessage(chatInput.value, "user");
    

    // Add typing indicator
    addMessage("Geni is typing...", "bot");
    const typingIndicator = chatMessages.lastChild;

    try {
      // Build the payload
      const payload = {
        website_id: config.apiKey,
        message: chatInput.value,
      };

      // Include session ID if available
      if (sessionId) {
        payload.sessionId = sessionId;
      }

      // Send message to API
      const response = await fetch(`${config.apiUrl}/chat/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Check response status
      if (!response.ok) {
        setInputState(false)
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Store session ID from response if provided
      if (data.sessionId) {
        sessionId = data.sessionId;
      }

      // Replace typing indicator with bot response
      typingIndicator.remove();

      if (data.response) {
        addMessage(data.response, "bot");
      } else {
        throw new Error("API response is empty or invalid");
      }
    } catch (error) {
      console.error("Error:", error);
      typingIndicator.remove();
      addMessage("Sorry, there was an error processing your message.", "bot");
    }

    // Clear input
    chatInput.value = "";
    isProcessing = false;
    setInputState(false)
  }

  // Handle sending messages
  let isProcessing = false;
  chatInput.addEventListener("keypress", async (e) => {
    if (e.key === "Enter") {
      await handleChatMessage();
    }
  });

  const sendButton = document.getElementById("send-button"); // Adjust ID as needed
  sendButton.addEventListener("click", handleChatMessage);

  // Helper function to add messages to the chat
  function addMessage(text, type) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.classList.add(`${type}-message`);
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
})();
