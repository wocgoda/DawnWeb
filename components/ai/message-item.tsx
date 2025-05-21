import React from 'react';
import { Message, ModelType } from './types';
import { processThoughtContent } from './message-processor';
import MarkdownRenderer from './markdown-renderer';
import { BsLightbulb } from 'react-icons/bs';

interface MessageItemProps {
  message: Message;
  isUser: boolean;
  isLatest: boolean;
  currentModel: ModelType;
  isThinking: boolean;
  showingThought: boolean;
  readyForAnswer: boolean;
  thoughtContent: string;
  answerContent: string;
  tempContent: string;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isUser,
  isLatest,
  currentModel,
  isThinking,
  showingThought,
  readyForAnswer,
  thoughtContent,
  answerContent,
  tempContent
}) => {
  // 渲染消息内容
  const renderMessageContent = () => {
    if (message.role === 'assistant' && currentModel === 'reasoner' && isLatest) {
      // 使用状态值来渲染最新的消息
      return (
        <div className="flex flex-col">
          {(showingThought || isThinking) && (
            <div className="thought-block mb-2">
              <div className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400 text-sm mb-1">
                <BsLightbulb />
                <span>思考过程</span>
              </div>
              {isThinking ? (
                <p className="text-gray-500">正在思考中...</p>
              ) : (
                <MarkdownRenderer content={thoughtContent || '(未提供思考过程)'} />
              )}
            </div>
          )}
          {readyForAnswer && (
            <MarkdownRenderer content={answerContent || ''} />
          )}
        </div>
      );
    } else if (message.role === 'assistant' && currentModel === 'reasoner') {
      // 处理历史消息
      const { thoughtPart, answerPart } = processThoughtContent(message.content);
      const showThoughtBlock = thoughtPart || message.content.trim().startsWith('【回答】');
      
      return (
        <div className="flex flex-col">
          {showThoughtBlock && (
            <div className="thought-block mb-2">
              <div className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400 text-sm mb-1">
                <BsLightbulb />
                <span>思考过程</span>
              </div>
              <MarkdownRenderer content={thoughtPart || '(未提供思考过程)'} />
            </div>
          )}
          {(answerPart || !message.content.includes('【回答】')) && (
            <MarkdownRenderer 
              content={answerPart || (thoughtPart && !message.content.trim().startsWith('【回答】') ? thoughtPart : '')} 
            />
          )}
        </div>
      );
    }

    // 普通消息渲染
    return <MarkdownRenderer content={message.content} />;
  };

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "bg-blue-500 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[75%] shadow-md markdown-body"
            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[75%] shadow markdown-body"
        }
      >
        {renderMessageContent()}
      </div>
    </div>
  );
};

export default MessageItem; 