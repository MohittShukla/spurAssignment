import { useState, useEffect } from 'react';
import { MessageCircle, X, RotateCcw } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { MessageBubble } from './MessageBubble';
import { InputBar } from './InputBar';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, error, sendMessage, clearChat, dismissError } = useChat();
  const scrollRef = useAutoScroll<HTMLDivElement>([messages, isLoading]);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      setIsOpen(true);
      const customEvent = e as CustomEvent<{ message?: string }>;
      if (customEvent.detail?.message) {
        sendMessage(customEvent.detail.message);
      }
    };
    window.addEventListener('open-chat', handleOpen as EventListener);
    return () => window.removeEventListener('open-chat', handleOpen as EventListener);
  }, [sendMessage]);

  return (
    <div className="chat-container">
      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'chat-window--open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <span className="chat-header-name">Spark &amp; Co.</span>
            <span className="chat-header-status">
              <span className="online-dot" />
              Online
            </span>
          </div>
          <div className="chat-header-actions">
            <button
              onClick={clearChat}
              className="chat-header-btn"
              title="New chat"
              aria-label="New chat"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="chat-header-btn"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="chat-messages chat-scrollbar">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="typing-indicator">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="chat-error">
            <span>{error}</span>
            <button onClick={dismissError} aria-label="Dismiss error">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input */}
        <InputBar onSend={sendMessage} disabled={isLoading} />
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`chat-fab ${isOpen ? 'chat-fab--active' : ''}`}
        aria-label="Toggle chat"
      >
        <MessageCircle
          size={24}
          className={`chat-fab-icon ${isOpen ? 'chat-fab-icon--hidden' : ''}`}
        />
        <X
          size={24}
          className={`chat-fab-icon ${!isOpen ? 'chat-fab-icon--hidden' : ''}`}
        />
      </button>
    </div>
  );
}
