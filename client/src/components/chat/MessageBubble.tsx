import { format } from 'date-fns';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`message ${isUser ? 'message--user' : 'message--ai'}`}>
      <div className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--ai'}`}>
        {message.text}
      </div>
      <span className="message-time">
        {format(new Date(message.timestamp), 'h:mm a')}
      </span>
    </div>
  );
}
