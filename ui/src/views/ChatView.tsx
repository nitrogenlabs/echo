/**
 * Project Echo Dashboard – AI Chat View
 * -------------------------------------
 *
 * Main dashboard view for communicating with AI.
 * Features a modern, beautiful interface for prompt input and response display.
 */

import {useState, useRef, useEffect} from 'react';
import {Flux} from '@nlabs/arkhamjs';
import {sendPrompt} from '../services/api.js';
import {getEchoState} from '../store/index.js';
import './ChatView.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  error?: boolean;
}

export default function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if(textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendPrompt(userMessage.content);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response.text || response.response || JSON.stringify(response, null, 2),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch(err: any) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to get response from AI'}`,
        timestamp: Date.now(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError(err.message || 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if(e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const echoState = getEchoState();
  const hasActiveDevices = Object.values(echoState.devices).some(
    (device) => device.status !== 'offline'
  );
  const hasLoadedModels = Object.values(echoState.models).some(
    (model) => model.loaded
  );

  return (
    <div className="chat-view">
      <div className="chat-header">
        <div className="chat-header-content">
          <h2>AI Chat</h2>
          <p className="chat-subtitle">Communicate with your Echo AI system</p>
        </div>
        {messages.length > 0 && (
          <button className="clear-button" onClick={clearChat} type="button">
            Clear Chat
          </button>
        )}
      </div>

      {/* Status indicators */}
      <div className="chat-status">
        <div className={`status-indicator ${hasActiveDevices ? 'active' : 'inactive'}`}>
          <span className="status-dot"></span>
          <span>Devices: {hasActiveDevices ? 'Online' : 'Offline'}</span>
        </div>
        <div className={`status-indicator ${hasLoadedModels ? 'active' : 'inactive'}`}>
          <span className="status-dot"></span>
          <span>Models: {hasLoadedModels ? 'Loaded' : 'None'}</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <h3>Start a conversation</h3>
            <p>Type a message below to begin communicating with the AI</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message message-${message.role} ${message.error ? 'message-error' : ''}`}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  <div className="message-timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message message-assistant message-loading">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="loading-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <form className="chat-input-container" onSubmit={handleSubmit}>
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="send-button-spinner"></div>
            ) : (
              <svg
                width="20"
                height="20"
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
            )}
          </button>
        </div>
        {error && (
          <div className="error-message">
            <span>⚠️</span> {error}
          </div>
        )}
      </form>
    </div>
  );
}
