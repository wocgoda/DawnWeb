'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatInterface from './chat-interface';

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 检测是否为移动端
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 640);
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !document.querySelector('.ai-chat-interface')?.contains(event.target as Node)
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
        // 移动端：居中，底部5rem
        setPosition({ x: window.innerWidth / 2, y: window.innerHeight - 80 });
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

  // 开始拖动
  const handleStartDrag = (e: React.MouseEvent) => {
    if (isMobile) return;
    setDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
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
        <div className="ai-chat-interface">
          <ChatInterface
            isMobile={isMobile}
            position={position}
            dragging={dragging}
            onClose={() => setOpen(false)}
            onStartDrag={handleStartDrag}
          />
        </div>
      )}
    </>
  );
} 