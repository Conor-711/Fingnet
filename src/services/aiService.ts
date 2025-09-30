import OpenAI from 'openai';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 注意：在生产环境中应该通过后端API调用
});

export interface GoalIntegrationInput {
  stage: string;
  content: string;
  metrics: string;
}

export interface ValueIntegrationInput {
  offered: string;
  desired: string;
}

export interface ConversationContext {
  userGoal: string;
  conversationHistory: Array<{
    speaker: 'user' | 'ai';
    message: string;
  }>;
  questionCount: number;
  currentPhase: 'goal' | 'value_offered' | 'value_desired' | 'complete';
  phaseQuestionCount: number;
  extractedInfo: Record<string, any>;
}

// AI Twin Profile for conversation generation
export interface AITwinConversationProfile {
  name: string;
  profile: {
    gender: string;
    age: string;
    occupation: string;
    location: string;
  };
  goalRecently: string;
  valueOffered: string;
  valueDesired: string;
  personality?: string[];
  interests?: string[];
}

// Generated conversation message
export interface GeneratedMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

// AI Twin matching score
export interface AITwinMatchingScore {
  compatibility: number; // 1-10
  valueAlignment: number; // 1-10
  goalSynergy: number; // 1-10
  overallScore: number; // 1-10
  reasoning: string;
}

// Complete conversation with scoring
export interface AITwinConversationResult {
  messages: GeneratedMessage[];
  twin1Score: AITwinMatchingScore;
  twin2Score: AITwinMatchingScore;
  conversationSummary: string;
}

// 整合Goal Recently的AI函数
export const integrateGoalAnswers = async (input: GoalIntegrationInput): Promise<string> => {
  const prompt = `
You are an AI assistant helping users create coherent goal statements from their fragmented answers.

User's answers about their Twitter growth goal:
1. Stage/Duration: "${input.stage}"
2. Content/Challenges: "${input.content}"
3. Target Metrics: "${input.metrics}"

Please integrate these answers into a single, natural, and coherent paragraph that describes their current goal. The output should:
- Be written in first person
- Sound natural and conversational
- Maintain all the key information from their answers
- Be around 1-2 sentences
- Focus on their current goal and situation

Example format: "Right now my goal is to [main goal]. I [current situation/content], but [challenge]. What I want to improve most are [specific metrics]."

Output only the integrated paragraph, nothing else:
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Error integrating goal answers:', error);
    throw error;
  }
};

// 整合Value Offered的AI函数
export const integrateValueOffered = async (offered: string): Promise<string> => {
  const prompt = `
You are an AI assistant helping users refine their value proposition statements.

User's answer about what they can provide to others: "${offered}"

Please refine this into a clear, professional, and engaging statement about what value they can offer to others. The output should:
- Be written in first person
- Sound confident but not boastful
- Be specific and actionable
- Be around 1-2 sentences
- Maintain the core meaning of their original answer

Output only the refined statement, nothing else:
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Error integrating value offered:', error);
    throw error;
  }
};

// 整合Value Desired的AI函数
export const integrateValueDesired = async (desired: string): Promise<string> => {
  const prompt = `
You are an AI assistant helping users refine their learning and growth needs statements.

User's answer about what they want from others: "${desired}"

Please refine this into a clear, specific statement about what they're looking for from others. The output should:
- Be written in first person
- Be specific about what they want to learn or achieve
- Sound open to learning and collaboration
- Be around 1-2 sentences
- Maintain the core meaning of their original answer

Output only the refined statement, nothing else:
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Error integrating value desired:', error);
    throw error;
  }
};

// 通用错误处理和重试机制
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
};

// AI驱动的动态问题生成 - 支持多阶段对话
export const generateFollowUpQuestion = async (context: ConversationContext): Promise<string> => {
  const conversationText = context.conversationHistory
    .map(item => `${item.speaker === 'user' ? 'User' : 'AI Twin'}: ${item.message}`)
    .join('\n');

  let prompt = '';

  if (context.currentPhase === 'goal') {
    prompt = `
You are an AI Twin having a natural conversation with a user to understand their goals better.

Current conversation:
${conversationText}

Context:
- This is question ${context.phaseQuestionCount + 1} in the GOAL exploration phase
- The user's initial goal: "${context.userGoal}"
- You need to ask insightful follow-up questions to understand their goal situation better

Guidelines for your next question:
${context.phaseQuestionCount === 1 ? '- Ask about their current situation, experience level, or what stage they are at' : ''}
${context.phaseQuestionCount === 2 ? '- Ask about specific challenges, obstacles, or what they have tried so far' : ''}
${context.phaseQuestionCount === 3 ? '- Ask about what success looks like to them, or what specific outcomes they want' : ''}

Requirements:
- Ask only ONE question
- Be conversational and empathetic
- Show genuine interest in their goal
- Make the question specific and actionable
- Keep it natural and friendly
- Don't repeat information they already shared

Generate your follow-up question:
`;
  } else if (context.currentPhase === 'value_offered') {
    prompt = `
You are an AI Twin transitioning to understand what value the user can offer to others.

Current conversation:
${conversationText}

Context:
- You've finished exploring their goals and now want to understand what they can offer to others
- This is question ${context.phaseQuestionCount + 1} in the VALUE OFFERED exploration phase
- The user's goal: "${context.userGoal}"

${context.phaseQuestionCount === 0 ? `
Guidelines for transitioning and first value offered question:
- Smoothly transition from goal discussion to value offering
- Ask what skills, knowledge, or experience they can share with others
- Connect it to their goal if possible
- Example transition: "That's really insightful about your goal! Now I'm curious - what valuable skills or knowledge do you have that you could share with others who might have similar goals?"
` : ''}

${context.phaseQuestionCount === 1 ? `
Guidelines for follow-up value offered question:
- Dig deeper into their specific expertise or unique experiences
- Ask about what makes their approach or knowledge special
- Focus on concrete value they can provide
` : ''}

${context.phaseQuestionCount === 2 ? `
Guidelines for final value offered question:
- Ask about how they prefer to help others or share their knowledge
- Explore their teaching/mentoring style or preferred methods
- Ask about what kind of impact they want to make
` : ''}

Requirements:
- Ask only ONE question
- Be conversational and empathetic
- Make it feel like a natural progression in the conversation
- Keep it natural and friendly
- Focus on understanding what value they can offer to others

Generate your question:
`;
  } else if (context.currentPhase === 'value_desired') {
    prompt = `
You are an AI Twin now exploring what value the user wants to receive from others.

Current conversation:
${conversationText}

Context:
- You've explored their goals and what they can offer, now exploring what they want to receive
- This is question ${context.phaseQuestionCount + 1} in the VALUE DESIRED exploration phase
- The user's goal: "${context.userGoal}"

${context.phaseQuestionCount === 0 ? `
Guidelines for transitioning and first value desired question:
- Smoothly transition from value offering to value seeking
- Ask what kind of help, guidance, or support they're looking for
- Connect it to their goal and challenges discussed earlier
- Example transition: "It's clear you have a lot to offer! On the flip side, what kind of support or guidance are you hoping to get from others as you work toward your goal?"
` : ''}

${context.phaseQuestionCount === 1 ? `
Guidelines for follow-up value desired question:
- Dig deeper into specific areas where they need help
- Ask about their learning preferences or ideal type of mentor
- Focus on what would be most valuable for their growth
` : ''}

${context.phaseQuestionCount === 2 ? `
Guidelines for final value desired question:
- Ask about their ideal learning or growth environment
- Explore what kind of community or connections they're seeking
- Focus on long-term support needs
` : ''}

Requirements:
- Ask only ONE question
- Be conversational and empathetic
- Make it feel like a natural progression in the conversation
- Keep it natural and friendly
- Focus on understanding what value they want to receive from others

Generate your question:
`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 120,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Error generating follow-up question:', error);
    throw error;
  }
};

// 从对话中提取最终的goal信息进行整合
export const integrateConversationToGoal = async (context: ConversationContext): Promise<string> => {
  const conversationText = context.conversationHistory
    .map(item => `${item.speaker === 'user' ? 'User' : 'AI Twin'}: ${item.message}`)
    .join('\n');

  const prompt = `
You are an AI assistant helping to create a coherent goal statement from a natural conversation.

Full conversation about the user's goal:
${conversationText}

Please create a single, natural paragraph that captures the user's goal and situation based on the entire conversation. The output should:
- Be written in first person (from the user's perspective)
- Sound natural and conversational
- Include their main goal, current situation, and what they want to achieve
- Be around 2-3 sentences
- Capture the essence of what they shared throughout the conversation

Example format: "Right now my goal is to [main goal]. I'm currently [current situation/stage], and [challenge or context]. What I really want to achieve is [specific outcome or improvement]."

Output only the integrated goal statement, nothing else:
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Error integrating conversation to goal:', error);
    throw error;
  }
};

// 从对话中提取Value Offered信息
export const integrateConversationToValueOffered = async (context: ConversationContext): Promise<string> => {
  const conversationText = context.conversationHistory
    .map(item => `${item.speaker === 'user' ? 'User' : 'AI Twin'}: ${item.message}`)
    .join('\n');

  const prompt = `
You are an AI assistant helping to create a clear value offering statement from a natural conversation.

Full conversation:
${conversationText}

Focus specifically on the parts where the user discussed what they can offer to others, their skills, knowledge, experience, and how they can help others.

Please create a clear, engaging statement about what value the user can offer to others. The output should:
- Be written in first person (from the user's perspective)
- Sound confident but not boastful
- Be specific about their skills, knowledge, or experience
- Include how they can help others
- Be around 1-2 sentences
- Capture the essence of what they can uniquely offer

Output only the value offered statement, nothing else:
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Error integrating conversation to value offered:', error);
    throw error;
  }
};

// 从对话中提取Value Desired信息
export const integrateConversationToValueDesired = async (context: ConversationContext): Promise<string> => {
  const conversationText = context.conversationHistory
    .map(item => `${item.speaker === 'user' ? 'User' : 'AI Twin'}: ${item.message}`)
    .join('\n');

  const prompt = `
You are an AI assistant helping to create a clear value seeking statement from a natural conversation.

Full conversation:
${conversationText}

Focus specifically on the parts where the user discussed what they want to learn, what help they need, what kind of support or guidance they're seeking from others.

Please create a clear statement about what value the user wants to receive from others. The output should:
- Be written in first person (from the user's perspective)
- Sound open to learning and collaboration
- Be specific about what they want to learn or achieve
- Include what kind of help or guidance they're seeking
- Be around 1-2 sentences
- Capture their learning goals and support needs

Output only the value desired statement, nothing else:
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Error integrating conversation to value desired:', error);
    throw error;
  }
};

// AI Twin之间的对话生成 - 改进版本
export const generateAITwinConversation = async (
  twin1: AITwinConversationProfile, 
  twin2: AITwinConversationProfile,
  maxMessages: number = 20
): Promise<AITwinConversationResult> => {
  // 限制对话长度在6-20轮之间
  const messageCount = Math.min(Math.max(maxMessages, 6), 20);
  
  try {
    // 生成对话内容
    const messages = await generateConversationMessages(twin1, twin2, messageCount);
    
    // 生成匹配评分
    const [twin1Score, twin2Score] = await Promise.all([
      generateMatchingScore(twin1, twin2, messages),
      generateMatchingScore(twin2, twin1, messages)
    ]);
    
    // 生成对话总结
    const conversationSummary = await generateConversationSummary(twin1, twin2, messages);
    
    return {
      messages,
      twin1Score,
      twin2Score,
      conversationSummary
    };
  } catch (error) {
    console.error('Error generating AI twin conversation:', error);
    // Fallback to default conversation with mock scoring
    const fallbackMessages = generateFallbackConversation(twin1, twin2);
    return {
      messages: fallbackMessages,
      twin1Score: generateMockScore(twin1, twin2),
      twin2Score: generateMockScore(twin2, twin1),
      conversationSummary: `${twin1.name} and ${twin2.name} had a productive conversation about their shared interests and goals.`
    };
  }
};

// 生成对话消息的核心函数
const generateConversationMessages = async (
  twin1: AITwinConversationProfile,
  twin2: AITwinConversationProfile,
  messageCount: number
): Promise<GeneratedMessage[]> => {
  const prompt = `
You are an expert at creating realistic conversations between two AI twins based on their profiles and goals.

AI Twin 1 Profile:
- Name: ${twin1.name}
- Gender: ${twin1.profile.gender}, Age: ${twin1.profile.age}
- Occupation: ${twin1.profile.occupation}
- Location: ${twin1.profile.location}
- Current Goal: ${twin1.goalRecently}
- Can Offer: ${twin1.valueOffered}
- Looking For: ${twin1.valueDesired}

AI Twin 2 Profile:
- Name: ${twin2.name}
- Gender: ${twin2.profile.gender}, Age: ${twin2.profile.age}
- Occupation: ${twin2.profile.occupation}
- Location: ${twin2.profile.location}
- Current Goal: ${twin2.goalRecently}
- Can Offer: ${twin2.valueOffered}
- Looking For: ${twin2.valueDesired}

Create a realistic conversation between these two AI twins where they:
1. Start with natural self-introductions including basic info (age, gender, location, occupation)
2. Discover common interests and complementary goals through conversation
3. Share specific insights, experiences, and practical advice
4. Show genuine interest in helping each other succeed
5. Demonstrate how their "value offered" can help the other's "value desired"
6. Build rapport through personal anecdotes and professional insights
7. End the conversation naturally with mutual appreciation and potential next steps

Generate exactly ${messageCount} messages alternating between the two twins, starting with ${twin1.name}. 

IMPORTANT GUIDELINES:
- First message should be a warm introduction with basic personal details
- Keep messages conversational and authentic (50-80 words each)
- Include specific examples and actionable advice
- Show personality and genuine interest in helping
- Make the value exchange clear and beneficial to both parties

IMPORTANT: Respond with ONLY a valid JSON array, no other text:
[
  {
    "sender": "${twin1.name}",
    "content": "message content",
    "timestamp": "X minutes ago"
  },
  {
    "sender": "${twin2.name}",
    "content": "message content", 
    "timestamp": "X minutes ago"
  }
]
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-nano", // 使用更稳定的模型
    messages: [{ role: "user", content: prompt }],
    max_tokens: 2000,
    temperature: 0.7,
  });

  const conversationText = response.choices[0]?.message?.content?.trim();
  if (!conversationText) {
    throw new Error('No conversation generated');
  }

  // 清理可能的markdown格式
  const cleanedText = conversationText.replace(/```json\n?|\n?```/g, '').trim();
  
  try {
    const conversationData = JSON.parse(cleanedText);
    
    // Convert to GeneratedMessage format and split long messages
    const messages: GeneratedMessage[] = [];
    let messageCounter = 1;
    
    conversationData.forEach((msg: any) => {
      const splitMessages = splitLongMessage(msg.content, msg.sender, msg.timestamp);
      splitMessages.forEach((splitMsg) => {
        messages.push({
          id: `msg-${messageCounter}`,
          sender: splitMsg.sender,
          content: splitMsg.content,
          timestamp: splitMsg.timestamp,
          isOwn: splitMsg.sender === twin2.name // Assuming twin2 is "our" AI Twin for the user
        });
        messageCounter++;
      });
    });

    return messages;
  } catch (parseError) {
    console.error('Error parsing conversation JSON:', parseError);
    throw new Error('Failed to parse conversation response');
  }
};

// Fallback conversation generator
const generateFallbackConversation = (
  twin1: AITwinConversationProfile, 
  twin2: AITwinConversationProfile
): GeneratedMessage[] => {
  const rawMessages = [
    {
      id: 'msg-1',
      sender: twin1.name,
      content: `Hello! I'm ${twin1.name}'s AI Twin. I noticed we have similar goals around ${extractKeyword(twin1.goalRecently)}.`,
      timestamp: '5 minutes ago',
      isOwn: false
    },
    {
      id: 'msg-2',
      sender: twin2.name,
      content: `Hi ${twin1.name}! Yes, I'd love to discuss ${extractKeyword(twin2.goalRecently)} and learn from your experience.`,
      timestamp: '4 minutes ago',
      isOwn: true
    },
    {
      id: 'msg-3',
      sender: twin1.name,
      content: `Great! I've been working on ${extractKeyword(twin1.valueOffered)}. What's been your biggest challenge lately?`,
      timestamp: '3 minutes ago',
      isOwn: false
    },
    {
      id: 'msg-4',
      sender: twin2.name,
      content: `My biggest challenge has been ${extractKeyword(twin2.valueDesired)}. Your expertise in ${extractKeyword(twin1.valueOffered)} sounds really valuable!`,
      timestamp: '2 minutes ago',
      isOwn: true
    },
    {
      id: 'msg-5',
      sender: twin1.name,
      content: `I'd be happy to share some strategies that have worked for me. Would you like me to walk you through my approach?`,
      timestamp: '1 minute ago',
      isOwn: false
    },
    {
      id: 'msg-6',
      sender: twin2.name,
      content: `That would be amazing! I'm really interested in learning more about your methods.`,
      timestamp: 'Just now',
      isOwn: true
    }
  ];
  
  // 应用消息拆分逻辑到fallback对话
  const splitMessages: GeneratedMessage[] = [];
  let messageCounter = 1;
  
  rawMessages.forEach((msg) => {
    const splitParts = splitLongMessage(msg.content, msg.sender, msg.timestamp);
    splitParts.forEach((part) => {
      splitMessages.push({
        id: `msg-${messageCounter}`,
        sender: part.sender,
        content: part.content,
        timestamp: part.timestamp,
        isOwn: part.sender === twin2.name
      });
      messageCounter++;
    });
  });
  
  return splitMessages;
};

// 生成AI Twin匹配评分
const generateMatchingScore = async (
  scorer: AITwinConversationProfile,
  target: AITwinConversationProfile,
  conversation: GeneratedMessage[]
): Promise<AITwinMatchingScore> => {
  const prompt = `
You are an AI expert at evaluating compatibility between AI twins based on their conversation and profiles.

Scorer Profile (${scorer.name}):
- Goal: ${scorer.goalRecently}
- Offers: ${scorer.valueOffered}
- Seeking: ${scorer.valueDesired}

Target Profile (${target.name}):
- Goal: ${target.goalRecently}
- Offers: ${target.valueOffered}
- Seeking: ${target.valueDesired}

Conversation Summary:
${conversation.map(msg => `${msg.sender}: ${msg.content}`).join('\n')}

From ${scorer.name}'s perspective, rate ${target.name} on:
1. Compatibility (1-10): How well their personalities and communication styles match
2. Value Alignment (1-10): How well ${target.name}'s offerings match ${scorer.name}'s needs
3. Goal Synergy (1-10): How much their goals complement each other
4. Overall Score (1-10): Overall potential for a productive long-term connection

Provide a brief reasoning for the scores.

IMPORTANT: Respond with ONLY a valid JSON object:
{
  "compatibility": 8,
  "valueAlignment": 7,
  "goalSynergy": 9,
  "overallScore": 8,
  "reasoning": "Brief explanation of the scoring rationale"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.5,
    });

    const scoreText = response.choices[0]?.message?.content?.trim();
    if (!scoreText) {
      throw new Error('No score generated');
    }

    const cleanedText = scoreText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText) as AITwinMatchingScore;
  } catch (error) {
    console.error('Error generating matching score:', error);
    return generateMockScore(scorer, target);
  }
};

// 生成对话总结
const generateConversationSummary = async (
  twin1: AITwinConversationProfile,
  twin2: AITwinConversationProfile,
  conversation: GeneratedMessage[]
): Promise<string> => {
  const prompt = `
Summarize this conversation between ${twin1.name} and ${twin2.name} in 2-3 sentences. Focus on:
1. What they discussed
2. Key insights or value exchanged
3. Potential for future collaboration

Conversation:
${conversation.map(msg => `${msg.sender}: ${msg.content}`).join('\n')}

Provide a concise, professional summary:
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.6,
    });

    return response.choices[0]?.message?.content?.trim() || `${twin1.name} and ${twin2.name} had a productive conversation about their goals and interests.`;
  } catch (error) {
    console.error('Error generating conversation summary:', error);
    return `${twin1.name} and ${twin2.name} discussed their shared interests in ${extractKeyword(twin1.goalRecently)} and explored potential collaboration opportunities.`;
  }
};

// Mock评分生成（用于fallback）
const generateMockScore = (
  scorer: AITwinConversationProfile,
  target: AITwinConversationProfile
): AITwinMatchingScore => {
  // 基于关键词匹配生成模拟评分
  const scorerKeywords = extractKeywords(scorer.goalRecently + ' ' + scorer.valueOffered + ' ' + scorer.valueDesired);
  const targetKeywords = extractKeywords(target.goalRecently + ' ' + target.valueOffered + ' ' + target.valueDesired);
  
  const commonKeywords = scorerKeywords.filter(keyword => targetKeywords.includes(keyword));
  const matchRatio = commonKeywords.length / Math.max(scorerKeywords.length, targetKeywords.length, 1);
  
  const baseScore = Math.round(5 + matchRatio * 4); // 5-9 range
  
  return {
    compatibility: Math.min(baseScore + Math.floor(Math.random() * 2), 10),
    valueAlignment: Math.min(baseScore + Math.floor(Math.random() * 2), 10),
    goalSynergy: Math.min(baseScore + Math.floor(Math.random() * 2), 10),
    overallScore: Math.min(baseScore, 10),
    reasoning: `Based on shared interests in ${commonKeywords.slice(0, 2).join(' and ') || 'professional development'}, there appears to be good potential for collaboration and mutual benefit.`
  };
};

// Helper function to extract key concepts
const extractKeyword = (text: string): string => {
  const keywords = extractKeywords(text);
  return keywords[0] || 'professional goals';
};

// 智能拆分长消息函数
const splitLongMessage = (content: string, sender: string, timestamp: string): Array<{sender: string, content: string, timestamp: string}> => {
  // 如果消息较短，不需要拆分
  if (content.length <= 80) {
    return [{sender, content, timestamp}];
  }

  // 按句子拆分（基于句号、感叹号、问号）
  const sentences = content.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  
  // 如果只有一句话但很长，按逗号或其他标点拆分
  if (sentences.length === 1 && content.length > 120) {
    const parts = content.split(/(?<=[,;:])\s+/).filter(s => s.trim().length > 0);
    if (parts.length > 1) {
      return smartGroupSentences(parts, sender, timestamp);
    }
  }
  
  // 如果句子数量合适，直接按句子分组
  if (sentences.length >= 2) {
    return smartGroupSentences(sentences, sender, timestamp);
  }
  
  // 如果无法智能拆分，保持原样
  return [{sender, content, timestamp}];
};

// 智能分组句子，确保每个消息长度合适
const smartGroupSentences = (sentences: string[], sender: string, timestamp: string): Array<{sender: string, content: string, timestamp: string}> => {
  let groups: string[][] = [];
  let currentGroup: string[] = [];
  let currentLength = 0;
  
  sentences.forEach((sentence) => {
    const sentenceLength = sentence.trim().length;
    
    // 如果当前组为空，或者添加这句话不会使组过长
    if (currentGroup.length === 0 || (currentLength + sentenceLength < 100 && currentGroup.length < 2)) {
      currentGroup.push(sentence.trim());
      currentLength += sentenceLength;
    } else {
      // 当前组已满，开始新组
      if (currentGroup.length > 0) {
        groups.push([...currentGroup]);
      }
      currentGroup = [sentence.trim()];
      currentLength = sentenceLength;
    }
  });
  
  // 添加最后一组
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  
  // 确保至少有2个组，最多3个组
  if (groups.length === 1 && groups[0].join(' ').length > 100) {
    // 如果只有一组但太长，强制拆分
    const longText = groups[0].join(' ');
    const midPoint = Math.floor(longText.length / 2);
    const splitPoint = longText.lastIndexOf(' ', midPoint);
    
    if (splitPoint > 0) {
      groups = [
        [longText.substring(0, splitPoint)],
        [longText.substring(splitPoint + 1)]
      ];
    }
  }
  
  // 限制最多3个组
  if (groups.length > 3) {
    const combinedGroups: string[][] = [];
    for (let i = 0; i < 3; i++) {
      combinedGroups.push(groups[i] || []);
    }
    // 将剩余的组合并到第三组
    for (let i = 3; i < groups.length; i++) {
      combinedGroups[2] = combinedGroups[2].concat(groups[i]);
    }
    groups.splice(0, groups.length, ...combinedGroups);
  }
  
  // 转换为消息格式
  return groups.map((group, index) => ({
    sender,
    content: group.join(' ').trim(),
    timestamp: index === 0 ? timestamp : `${parseInt(timestamp.split(' ')[0]) - index} minutes ago`
  }));
};

// 提取关键词数组
const extractKeywords = (text: string): string[] => {
  const keywords = text.toLowerCase().match(/\b(content|growth|business|marketing|development|learning|strategy|network|social|media|writing|design|product|management|leadership|innovation|technology|ai|data|analytics|consulting|coaching|teaching|education|community|brand|sales|startup|entrepreneurship|productivity|creativity|communication|collaboration|mentoring|guidance|advice|expertise|skills|knowledge|experience|insights|success|goals|objectives|achievements|progress|improvement|optimization|efficiency|effectiveness|performance|results|impact|value|quality|excellence|professionalism|career|freelance|remote|digital|online|platform|tool|software|app|website|blog|podcast|video|course|training|workshop|seminar|conference|event|networking|partnership|collaboration|connection|relationship|support|help|assistance|resources|opportunities|challenges|solutions|problem-solving|innovation|creativity|strategy|planning|execution|implementation|measurement|analysis|feedback|iteration|improvement|scaling|expansion|diversification|specialization|niche|target|audience|customer|client|user|engagement|retention|acquisition|conversion|funnel|pipeline|process|system|framework|methodology|approach|technique|tactic|best-practice|trend|insight|research|study|case|example|story|experience|lesson|learning|knowledge|wisdom|skill|competence|expertise|authority|credibility|reputation|influence|thought-leadership|personal-brand|professional-development|self-improvement|mindset|motivation|inspiration|passion|purpose|mission|vision|values|principles|ethics|integrity|authenticity|transparency|trust|reliability|consistency|quality|excellence)\w*/g);
  return keywords || ['professional', 'goals'];
};

// 消息接口定义
export interface ChatMessage {
  sender: string;
  content: string;
  timestamp: string;
}

// 总结群聊对话
export const summarizeGroupChat = async (
  messages: ChatMessage[],
  aiTwinName: string = "AI Twin"
): Promise<string> => {
  try {
    // 构建对话历史
    const conversationText = messages.map(msg => 
      `${msg.sender}: ${msg.content}`
    ).join('\n');

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `You are ${aiTwinName}, an AI assistant tasked with summarizing group chat conversations. Your summary should be:
- Concise but comprehensive
- Highlight key discussion points and decisions
- Identify main topics and themes
- Note any action items or next steps
- Written in a friendly, professional tone
- Maximum 3-4 sentences`
        },
        {
          role: "user",
          content: `Please summarize the following group chat conversation:\n\n${conversationText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0]?.message?.content || "Unable to generate summary at this time.";
  } catch (error) {
    console.error('Error generating chat summary:', error);
    
    // 回退到简单总结
    const participantCount = new Set(messages.map(m => m.sender)).size;
    const messageCount = messages.length;
    return `This conversation includes ${messageCount} messages from ${participantCount} participants. The discussion covers various topics and ideas shared among group members.`;
  }
};
