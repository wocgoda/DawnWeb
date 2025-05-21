// 处理思考过程的函数
export const processThoughtContent = (content: string) => {
  // 检查是否包含思考标记和回答标记
  const hasThoughtMark = content.includes('【思考】');
  const hasAnswerMark = content.includes('【回答】');
  
  // 如果直接以【回答】开头且没有【思考】，则强制添加空的思考过程
  if (!hasThoughtMark && hasAnswerMark && content.trim().startsWith('【回答】')) {
    const answerMatch = content.match(/【回答】([\s\S]*?)$/);
    return {
      thoughtPart: '(未提供思考过程)',
      answerPart: answerMatch ? answerMatch[1].trim() : content.replace('【回答】', '').trim()
    };
  }
  
  if (!hasThoughtMark) {
    // 如果没有思考标记，整个内容作为回答
    return { thoughtPart: '', answerPart: content.trim() };
  }

  if (hasThoughtMark && !hasAnswerMark) {
    // 如果只有思考标记，提取思考内容
    const thoughtMatch = content.match(/【思考】([\s\S]*?)$/);
    return {
      thoughtPart: thoughtMatch ? thoughtMatch[1].trim() : '',
      answerPart: ''
    };
  }

  // 如果同时有思考和回答标记
  const thoughtMatch = content.match(/【思考】([\s\S]*?)(?=【回答】|$)/);
  const answerMatch = content.match(/【回答】([\s\S]*?)$/);

  return {
    thoughtPart: thoughtMatch ? thoughtMatch[1].trim() : '',
    answerPart: answerMatch ? answerMatch[1].trim() : ''
  };
}; 