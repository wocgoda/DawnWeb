// 定义模型类型
export type ModelType = 'chat' | 'reasoner';

// 定义思考过程的类型
export type ThoughtProcess = {
  type: 'thought' | 'content';
  text: string;
};

// 定义消息类型
export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// 模型配置
export const MODEL_CONFIGS = {
  chat: {
    name: 'deepseek-chat',
    displayName: '聊天模式',
    systemMessage: '你是一个有帮助的助手。'
  },
  reasoner: {
    name: 'deepseek-reasoner',
    displayName: '推理模式',
    systemMessage: '你是一个专注于逻辑推理和问题分析的助手。请先用【思考】标记开始你的思考过程，思考完成后用【回答】标记开始你的回答。请确保回答前一定有思考过程。'
  }
}; 