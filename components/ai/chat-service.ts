import { Message, ModelType, MODEL_CONFIGS } from './types';
import { processThoughtContent } from './message-processor';

// 处理API响应的接口
interface ApiResponseHandler {
  onStart: () => void;
  onContent: (content: string) => void;
  onThoughtContent: (thoughtPart: string) => void;
  onAnswerContent: (answerPart: string) => void;
  onComplete: (fullContent: string) => void;
  onError: (error: Error) => void;
}

// 发送消息到API
export const sendChatMessage = async (
  messages: Message[],
  currentModel: ModelType,
  handlers: ApiResponseHandler,
  abortController: AbortController
) => {
  try {
    handlers.onStart();

    const requestBody = {
      model: MODEL_CONFIGS[currentModel].name,
      messages: currentModel === 'chat' ? messages : {
        messages: messages,
        response_format: { type: "text" }
      },
      stream: true,
    };

    const response = await fetch('/api/deepseek/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error('API请求失败');
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let fullContent = '';

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]' || data === '[ABORTED]') break;
          
          try {
            // 数据验证和清理
            let jsonData = data.trim();
            // 检查并移除可能的 BOM 标记
            if (jsonData.charCodeAt(0) === 0xFEFF) {
              jsonData = jsonData.slice(1);
            }
            // 检查并处理可能的多行数据
            if (jsonData.includes('\n')) {
              jsonData = jsonData.split('\n').filter(Boolean)[0];
            }

            let parsed;
            try {
              parsed = JSON.parse(jsonData);
            } catch (parseError) {
              console.warn('JSON解析错误，原始数据:', jsonData);
              console.warn('错误详情:', parseError);
              continue; // 跳过这个数据块，继续处理下一个
            }

            if (!parsed || typeof parsed !== 'object') {
              console.warn('解析后的数据无效:', parsed);
              continue;
            }

            const content = 
              parsed.choices?.[0]?.delta?.content || 
              parsed.choices?.[0]?.message?.content || 
              '';
            
            if (content) {
              fullContent += content;
              handlers.onContent(fullContent);
              
              if (currentModel === 'reasoner') {
                const { thoughtPart, answerPart } = processThoughtContent(fullContent);
                
                // 优先检查是否包含【思考】标记
                const hasThoughtMark = fullContent.includes('【思考】');
                const hasAnswerMark = fullContent.includes('【回答】');
                
                // 如果有思考内容，触发思考内容处理
                if (hasThoughtMark || fullContent.trim().startsWith('【回答】')) {
                  if (fullContent.trim().startsWith('【回答】') && !thoughtPart) {
                    handlers.onThoughtContent('(未提供思考过程)');
                  } else if (thoughtPart) {
                    handlers.onThoughtContent(thoughtPart);
                  }
                  
                  // 如果有回答标记，触发回答内容处理
                  if (hasAnswerMark && answerPart) {
                    handlers.onAnswerContent(answerPart);
                  }
                }
              }
            }
          } catch (error) {
            console.error('处理数据块时出错:', error);
            continue;
          }
        }
      }
    }

    // 最终内容处理
    if (currentModel === 'reasoner') {
      const { thoughtPart, answerPart } = processThoughtContent(fullContent);
      
      // 如果直接以【回答】开头，添加默认思考过程提示
      if (fullContent.trim().startsWith('【回答】') && !thoughtPart) {
        handlers.onThoughtContent('(未提供思考过程)');
      } else if (thoughtPart) {
        handlers.onThoughtContent(thoughtPart);
      }
      
      handlers.onAnswerContent(answerPart || '');
    }

    handlers.onComplete(fullContent);
    return fullContent;
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      handlers.onError(error);
    }
    throw error;
  }
}; 