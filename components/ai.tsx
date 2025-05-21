'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaPaperPlane } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';

// 显式类型声明的 code 渲染器
const MarkdownCode = ({
  node,
  inline,
  className,
  children,
  ...props
}: {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) => {
  const match = /language-(\w+)/.exec(className || '');
  return !inline && match ? (
    <SyntaxHighlighter
      style={oneDark}
      language={match[1]}
      PreTag="div"
      {...props}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'system', content: '你是一个有帮助的助手。' }]);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // 检测是否为移动端
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 640);
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        chatRef.current &&
        !chatRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // 拖动相关（仅桌面端）
  useEffect(() => {
    if (isMobile) return;
    function onMouseMove(e: MouseEvent) {
      if (!dragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    }
    function onMouseUp() {
      setDragging(false);
    }
    if (dragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, isMobile]);

  // 初始位置
  useEffect(() => {
    if (open && position === null) {
      if (isMobile) {
        // 移动端：居中，底部7rem
        setPosition({ x: window.innerWidth / 2, y: window.innerHeight - 112 });
      } else {
        // 桌面端：右下角，底部7rem
        const chatWidth = 320;
        const right = 20;
        const bottom = 85;
        const chatHeight = 570; // 估算高度
        setPosition({
          x: window.innerWidth - chatWidth - right,
          y: window.innerHeight - chatHeight - bottom
        });
      }
    }
    if (!open) setPosition(null);
  }, [open, isMobile]);

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

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 如果有正在进行的请求，先取消它
    if (abortController) {
      abortController.abort();
    }

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setLoading(true);
    setInput('');
    setStreamingContent('');

    // 创建新的AbortController
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch('/api/deepseek/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: newMessages,
          stream: true, // 启用流式输出
        }),
        signal: controller.signal, // 添加中断信号
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      // 处理流式响应
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullContent = '';

      // 先添加一个空的助手消息
      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        // 处理SSE格式的数据
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              break;
            }
            
            if (data === '[ABORTED]') {
              console.log('服务器确认请求已被中断');
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              // 检查是否有delta.content或message.content
              const content = 
                parsed.choices?.[0]?.delta?.content || 
                parsed.choices?.[0]?.message?.content || 
                '';
              
              if (content) {
                fullContent += content;
                setStreamingContent(fullContent);
                
                // 更新最后一条消息的内容
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = fullContent;
                  return newMessages;
                });
              }
            } catch (error) {
              console.error('解析流数据出错:', error, '原始数据:', data);
            }
          }
        }
      }
    } catch (error: any) {
      // 检查是否是中断错误
      if (error.name === 'AbortError') {
        console.log('请求被用户取消');
        return; // 已在cancelResponse中处理UI更新
      }
      
      console.error('发送消息出错:', error);
      setMessages([...newMessages, { role: 'assistant', content: '出现错误，请稍后再试。' }]);
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  return (
    <>
      {/* 按钮 */}
      <button
        ref={buttonRef}
        className="fixed bottom-[5.5rem] right-5 bg-white w-[3rem] h-[3rem] 
        bg-opacity-80 backdrop-blur-[0.5rem] border border-white 
        border-opacity-40 shadow-2xl rounded-full flex items-center 
        justify-center hover:scale-[1.15] active:scale-105 
        transition-all dark:bg-gray-950"
        onClick={() => setOpen(!open)}
      >
        💬
      </button>

      {/* 聊天框 */}
      {open && position && (
        <div
          ref={chatRef}
          className={`fixed z-50 min-h-[30rem] max-h-[60vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col p-0 ${isMobile ? 'w-[95vw] max-w-xs' : 'w-80'}`}
          style={
            isMobile
              ? {
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: 'auto',
                  bottom: '7rem',
                  right: 'auto',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
                  cursor: 'default',
                }
              : {
                  left: position.x,
                  top: position.y,
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
            onMouseDown={e => {
              if (isMobile) return;
              setDragging(true);
              const rect = chatRef.current?.getBoundingClientRect();
              dragOffset.current = {
                x: e.clientX - (rect?.left ?? 0),
                y: e.clientY - (rect?.top ?? 0),
              };
            }}
          >
            <span className="font-semibold text-blue-700 dark:text-blue-200 text-base select-none">AI 小助手</span>
            <button
              className="text-gray-400 hover:text-red-500 transition-colors text-lg"
              onClick={() => setOpen(false)}
              aria-label="关闭"
            >
              ❌
            </button>
          </div>
          {/* 聊天内容区 */}
          <div className="flex-1 overflow-y-auto space-y-2 px-4 py-3 text-sm scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent dark:scrollbar-thumb-gray-700" style={{scrollbarWidth:'thin'}}>
            {messages.slice(1).map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    msg.role === 'user'
                      ? "bg-blue-500 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[75%] shadow-md markdown-body"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[75%] shadow markdown-body"
                  }
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: MarkdownCode
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && !streamingContent && <p className="text-left text-gray-500">AI 正在思考...</p>}
          </div>
          {/* 输入区 */}
          <div className={`flex gap-2 px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 rounded-b-2xl ${isMobile ? 'pb-6' : ''}`}>
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
      )}
    </>
  );
}
