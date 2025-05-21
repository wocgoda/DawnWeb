import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import { IoMdSwap } from 'react-icons/io';
import { Message, ModelType, MODEL_CONFIGS } from './types';
import MessageItem from './message-item';
import { sendChatMessage } from './chat-service';

interface ChatInterfaceProps {
  isMobile: boolean;
  position: { x: number; y: number } | null;
  dragging: boolean;
  onClose: () => void;
  onStartDrag: (e: React.MouseEvent) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  isMobile,
  position,
  dragging,
  onClose,
  onStartDrag
}) => {
  const [input, setInput] = useState('');
  const [currentModel, setCurrentModel] = useState<ModelType>('chat');
  const [messages, setMessages] = useState<Message[]>([{ 
    role: 'system', 
    content: MODEL_CONFIGS.chat.systemMessage 
  }]);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [thoughtContent, setThoughtContent] = useState('');
  const [answerContent, setAnswerContent] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [showingThought, setShowingThought] = useState(false);
  const [readyForAnswer, setReadyForAnswer] = useState(false);
  const [tempContent, setTempContent] = useState('');

  const chatRef = useRef<HTMLDivElement>(null);

  // 切换模型
  const toggleModel = () => {
    const newModel = currentModel === 'chat' ? 'reasoner' : 'chat';
    setCurrentModel(newModel);
    
    // 重置消息，使用新模型的系统消息
    setMessages([{ 
      role: 'system', 
      content: MODEL_CONFIGS[newModel].systemMessage 
    }]);
  };

  // 取消回答
  const cancelResponse = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
      
      // 如果已经有部分回答，保留它
      if (streamingContent) {
        setMessages(prev => {
          const newMessages = [...prev];
          // 在最后一条消息后添加取消说明
          if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
            newMessages[newMessages.length - 1].content += '\n\n*（回答已中断）*';
          }
          return newMessages;
        });
      } else {
        // 如果还没有内容，删除空的助手消息
        setMessages(prev => {
          if (prev.length > 0 && prev[prev.length - 1].role === 'assistant' && !prev[prev.length - 1].content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      }
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim()) return;

    if (abortController) {
      abortController.abort();
    }

    const userMessage: Message = { role: 'user', content: input };
    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    // 重置状态
    setStreamingContent('');
    setThoughtContent('');
    setAnswerContent('');
    setTempContent('');
    setShowingThought(false);
    setReadyForAnswer(false);
    setIsThinking(true);
    setLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    // 先添加一个空的助手消息
    const assistantMessage: Message = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMessage]);

    try {
      await sendChatMessage(
        newMessages,
        currentModel,
        {
          onStart: () => {},
          onContent: (fullContent) => {
            setTempContent(fullContent);
            
            // 更新最后一条消息的内容
            setMessages(prev => {
              const newMessages = [...prev];
              if (newMessages.length > 0) {
                newMessages[newMessages.length - 1].content = fullContent;
              }
              return newMessages;
            });
            
            if (currentModel === 'chat') {
              setStreamingContent(fullContent);
            }
          },
          onThoughtContent: (thoughtPart) => {
            setThoughtContent(thoughtPart);
            setShowingThought(true);
            setIsThinking(false);
          },
          onAnswerContent: (answerPart) => {
            setAnswerContent(answerPart);
            setReadyForAnswer(true);
          },
          onComplete: () => {
            setLoading(false);
            setIsThinking(false);
            setAbortController(null);
          },
          onError: (error) => {
            console.error('发送消息出错:', error);
            const errorMessage: Message = { role: 'assistant', content: '出现错误，请稍后再试。' };
            setMessages([...newMessages, errorMessage]);
            setLoading(false);
            setIsThinking(false);
            setAbortController(null);
          }
        },
        controller
      );
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('请求被用户取消');
      }
    } finally {
      setLoading(false);
      setAbortController(null);
      setIsThinking(false);
    }
  };

  return (
    <div
      ref={chatRef}
      className={`fixed z-50 ${isMobile ? 'min-h-[22rem] max-h-[50vh]' : 'min-h-[30rem] max-h-[60vh]'} bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col p-0 ${isMobile ? 'w-[95vw] max-w-xs' : 'w-80'}`}
      style={
        isMobile
          ? {
              left: '50%',
              transform: 'translateX(-50%)',
              top: 'auto',
              bottom: '5rem',
              right: 'auto',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
              cursor: 'default',
            }
          : {
              left: position?.x,
              top: position?.y,
              right: 'auto',
              bottom: 'auto',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
              cursor: dragging ? 'move' : 'default',
            }
      }
    >
      {/* 头部 */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-100/60 via-white/80 to-blue-50/60 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-t-2xl select-none ${isMobile ? '' : 'cursor-move'}`}
        onMouseDown={onStartDrag}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-700 dark:text-blue-200 text-base select-none">
            AI 小助手
          </span>
          <button
            onClick={toggleModel}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            <IoMdSwap className="text-sm" />
            {MODEL_CONFIGS[currentModel].displayName}
          </button>
        </div>
        <button
          className="text-gray-400 hover:text-red-500 transition-colors text-lg"
          onClick={onClose}
          aria-label="关闭"
        >
          ❌
        </button>
      </div>

      {/* 聊天内容区 */}
      <div className="flex-1 overflow-y-auto space-y-2 px-4 py-3 text-sm scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent dark:scrollbar-thumb-gray-700">
        <style jsx global>{`
          .thought-block {
            background: rgba(255, 251, 235, 0.1);
            border-left: 3px solid #fbbf24;
            padding: 0.5rem;
            border-radius: 0.375rem;
            margin-bottom: 0.5rem;
          }
          .dark .thought-block {
            background: rgba(255, 251, 235, 0.05);
          }
        `}</style>
        
        {messages.slice(1).map((msg, i, arr) => (
          <MessageItem
            key={i}
            message={msg}
            isUser={msg.role === 'user'}
            isLatest={i === arr.length - 1 && msg.role === 'assistant'}
            currentModel={currentModel}
            isThinking={isThinking}
            showingThought={showingThought}
            readyForAnswer={readyForAnswer}
            thoughtContent={thoughtContent}
            answerContent={answerContent}
            tempContent={tempContent}
          />
        ))}
        
        {loading && !thoughtContent && !answerContent && (
          <p className="text-left text-gray-500">AI 正在思考...</p>
        )}
      </div>

      {/* 输入区 */}
      <div className={`flex gap-2 px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 rounded-b-2xl ${isMobile ? 'pb-4' : ''}`}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="说点什么..."
          className={`flex-1 border border-gray-300 dark:border-gray-700 rounded-full px-3 ${isMobile ? 'py-3 text-base' : 'py-1 text-sm'} dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition`}
          disabled={loading}
        />
        {loading ? (
          <button
            onClick={cancelResponse}
            className={`flex items-center justify-center bg-red-600 hover:bg-red-700 transition text-white rounded-full ${isMobile ? 'w-12 h-12 text-xl' : 'w-9 h-9 text-lg'} shadow`}
            aria-label="取消"
          >
            <MdCancel />
          </button>
        ) : (
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className={`flex items-center justify-center bg-blue-600 hover:bg-blue-700 transition text-white rounded-full ${isMobile ? 'w-12 h-12 text-xl' : 'w-9 h-9 text-lg'} shadow disabled:opacity-50 disabled:bg-blue-400`}
            aria-label="发送"
          >
            <FaPaperPlane />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInterface; 