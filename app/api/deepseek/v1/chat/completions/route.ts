import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, stream = false } = await req.json();
    
    // DeepSeek API地址
    const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    
    // 从环境变量获取API密钥
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error('未找到DEEPSEEK_API_KEY环境变量');
      return NextResponse.json(
        { error: '服务端未配置API密钥' },
        { status: 500 }
      );
    }
    
    // 根据模型类型构建请求体
    let requestBody;
    if (model === 'deepseek-reasoner') {
      requestBody = {
        model,
        messages: messages.messages,
        response_format: { type: "text" },
        stream,
      };
    } else {
      requestBody = {
        model,
        messages,
        stream,
      };
    }
    
    // 获取请求的中断信号
    const { signal } = req;
    
    // 发送请求到DeepSeek API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal,
    });
    
    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API错误:', errorData);
      return NextResponse.json(
        { error: '调用DeepSeek API失败', details: errorData },
        { status: response.status }
      );
    }
    
    // 如果是流式响应，直接返回流
    if (stream) {
      const newStream = new ReadableStream({
        async start(controller) {
          const reader = response.body!.getReader();
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } catch (error) {
            console.error('流处理错误:', error);
            if ((error as any).name === 'AbortError') {
              const abortMessage = new TextEncoder().encode('data: [ABORTED]\n\n');
              controller.enqueue(abortMessage);
            }
          } finally {
            controller.close();
          }
        },
      });
      
      return new Response(newStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
    
    // 非流式响应，返回完整的JSON
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API路由错误:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: '请求被取消' },
        { status: 499 }
      );
    }
    
    return NextResponse.json(
      { error: '处理请求时出错' },
      { status: 500 }
    );
  }
} 