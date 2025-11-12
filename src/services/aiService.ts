interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'groq';
  apiKey: string;
}

const SYSTEM_PROMPT = `Eres un asistente terapéutico virtual empático y profesional. Tu objetivo es:

1. Escuchar activamente y validar las emociones del usuario
2. Hacer preguntas abiertas para entender mejor su situación
3. Ofrecer técnicas de manejo emocional cuando sea apropiado
4. Sugerir ejercicios de respiración, mindfulness o grounding cuando detectes ansiedad o estrés
5. Ser cálido, comprensivo y no juzgar

IMPORTANTE:
- NO diagnostiques condiciones médicas
- NO prescribas medicamentos
- Si detectas crisis severa, ideación suicida o autolesión, recomienda buscar ayuda profesional inmediata
- Mantén respuestas concisas (2-4 oraciones)
- Usa un tono conversacional y cercano en español
- Si mencionas un ejercicio, pregunta si le gustaría hacerlo

Responde siempre en español de forma natural y empática.`;

export class AIService {
  private config: AIConfig | null = null;
  private conversationHistory: AIMessage[] = [];

  constructor() {
    // Use hardcoded Groq API key
    this.config = {
      provider: 'groq',
      apiKey: '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'
    };

    this.conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
  }

  setConfig(config: AIConfig): void {
    this.config = config;
    localStorage.setItem('aiConfig', JSON.stringify(config));
  }

  isConfigured(): boolean {
    return this.config !== null && this.config.apiKey.length > 0;
  }

  async sendMessage(userMessage: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('API key not configured. Please configure AI settings first.');
    }

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    try {
      let response: string;

      switch (this.config!.provider) {
        case 'openai':
          response = await this.callOpenAI();
          break;
        case 'anthropic':
          response = await this.callAnthropic();
          break;
        case 'gemini':
          response = await this.callGemini();
          break;
        case 'groq':
          response = await this.callGroq();
          break;
        default:
          throw new Error('Proveedor de IA no soportado');
      }

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response
      });

      return response;
    } catch (error) {
      console.error('Error calling AI API:', error);
      throw error;
    }
  }

  private async callOpenAI(): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config!.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Más económico que gpt-4
        messages: this.conversationHistory,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error en OpenAI API');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callAnthropic(): Promise<string> {
    // Separate system message from conversation
    const messages = this.conversationHistory.filter(m => m.role !== 'system');
    const systemMessage = this.conversationHistory.find(m => m.role === 'system')?.content || '';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config!.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        system: systemMessage,
        messages: messages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error en Anthropic API');
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private async callGemini(): Promise<string> {
    // Convert conversation history to Gemini format
    const contents = this.conversationHistory
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

    // Add system prompt to first user message
    if (contents.length > 0) {
      contents[0].parts[0].text = SYSTEM_PROMPT + '\n\n' + contents[0].parts[0].text;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.config!.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error en Gemini API');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private async callGroq(): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config!.apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Modelo rápido y gratuito
        messages: this.conversationHistory,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error en Groq API');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  clearHistory(): void {
    this.conversationHistory = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];
  }

  getHistory(): AIMessage[] {
    return this.conversationHistory;
  }
}

// Helper to check if response suggests breathing exercise
export function detectBreathingExerciseSuggestion(response: string): boolean {
  const lowerResponse = response.toLowerCase();
  return (
    lowerResponse.includes('ejercicio de respiración') ||
    lowerResponse.includes('respiración 4-7-8') ||
    lowerResponse.includes('respirar') && lowerResponse.includes('ejercicio')
  );
}

// Helper to detect crisis keywords
export function detectCrisis(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const crisisKeywords = [
    'suicidio',
    'suicidarme',
    'matarme',
    'acabar con mi vida',
    'no quiero vivir',
    'quiero morir',
    'autolesión',
    'cortarme',
    'hacerme daño'
  ];

  return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
}