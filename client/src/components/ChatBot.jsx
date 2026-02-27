import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../Styles/ChatBot.css";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hi! How can I help you with your lab reports today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    const userText = inputValue.trim();
    const token = localStorage.getItem("token");

    console.log("Sending question:", userText);
    console.log("Using token:", token);

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/ask",
        { question: userText },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Full API Response:", response.data);

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: response.data.answer,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot Error FULL:", error);

      let errorText = "Server error occurred.";

      if (error.response) {
        console.log("Backend error response:", error.response.data);

        errorText =
          error.response.data?.message ||
          "Something went wrong on the server.";

        if (error.response.status === 401) {
          errorText = "Authentication required. Please login again.";
          localStorage.removeItem("token");
          window.location.href = "/login";
        }

        if (error.response.status === 403) {
          errorText = "Session expired. Please login again.";
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }

      const errorMessage = {
        id: Date.now() + 2,
        type: "bot",
        text: errorText,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <button
        className="chatbot-float-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Open Chat"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <h3>Quantera Assistant</h3>
              <p>Ask anything about your reports</p>
            </div>
            <button
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message ${message.type}`}
              >
                <div className="chatbot-message-content">
                  {message.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-message bot">
                <div className="chatbot-message-content">
                  Analyzing your reports...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Type your question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              className="chatbot-send-btn"
              onClick={handleSendMessage}
              disabled={isLoading}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}