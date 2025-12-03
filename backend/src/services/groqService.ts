import { AIMessageDTO } from '../types';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class GroqService {
  async sendMessage(data: AIMessageDTO): Promise<string> {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const messages: GroqMessage[] = data.conversationHistory || [];
    messages.push({
      role: 'user',
      content: data.message,
    });

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: messages,
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const error: any = await response.json();
        throw new Error(error.error?.message || 'Error calling Groq API');
      }

      const result: any = await response.json();
      return result.choices[0].message.content;
    } catch (error: any) {
      console.error('Groq API Error:', error);
      throw error;
    }
  }
}

export default new GroqService();
