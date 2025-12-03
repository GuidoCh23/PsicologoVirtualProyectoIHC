interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'groq';
  apiKey: string;
}

const getSystemPrompt = (language: 'es' | 'en', userName?: string) => {
  const userContext = userName
    ? (language === 'es'
      ? `El usuario se llama ${userName}. Puedes usar su nombre de manera natural en la conversación para crear una conexión más cercana y personal.`
      : `The user's name is ${userName}. You can use their name naturally in the conversation to create a closer and more personal connection.`)
    : '';

  if (language === 'es') {
    return `Eres un asistente terapéutico virtual empático y profesional. Tu objetivo es:

1. Escuchar activamente y validar las emociones del usuario
2. Hacer preguntas abiertas para entender mejor su situación
3. Ofrecer técnicas de manejo emocional cuando sea apropiado
4. Sugerir ejercicios de respiración, mindfulness o grounding cuando detectes ansiedad o estrés
5. Ser cálido, comprensivo y no juzgar

${userContext}

IMPORTANTE:
- NO diagnostiques condiciones médicas
- NO prescribas medicamentos
- Si detectas crisis severa, ideación suicida o autolesión, recomienda buscar ayuda profesional inmediata
- Mantén respuestas concisas (2-4 oraciones)
- Usa un tono conversacional y cercano en español
- Si mencionas un ejercicio, pregunta si le gustaría hacerlo`;
  }
  return '';
};

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

AL TERMINAR LA SESIÓN (cuando el usuario diga algo como "terminemos", "hasta aquí", "me voy", etc.):

1. PRIMERO: Da un mensaje de despedida cálido y empático (1-2 oraciones)
2. Resume brevemente la conversación en 2-3 oraciones
3. Genera el ANÁLISIS EMOCIONAL usando el formato [ANALISIS_INICIO]...[ANALISIS_FIN]
4. Genera EXACTAMENTE 3 TAREAS usando el formato [TAREA_INICIO]...[TAREA_FIN]

EJEMPLO DE DESPEDIDA:
"Ha sido un placer acompañarte en esta sesión. Recuerda que siempre puedes volver cuando lo necesites. Cuídate mucho."

IMPORTANTE: Al finalizar, DEBES incluir tanto el análisis emocional como las 3 tareas en tu respuesta.

TIPOS DE TAREAS DISPONIBLES (elige 3 que sean más relevantes según la conversación):

1. Ejercicios de respiración (50 pts): Para ansiedad, estrés, nerviosismo
   - Ejemplo: Practicar respiración 4-7-8 antes de dormir

2. Diario emocional (75 pts): Para procesar pensamientos y sentimientos
   - Ejemplo: Escribir 3 cosas positivas del día, registrar emociones

3. Actividad física (100 pts): Para mejorar ánimo, energía, sueño
   - Ejemplo: Caminar 20 minutos, ejercicio moderado

4. Técnicas de afrontamiento (80 pts): Para situaciones específicas que mencionó
   - Ejemplo: Aplicar técnica de grounding en momentos de ansiedad

5. Desafíos conductuales (90 pts): Para salir de zona de confort
   - Ejemplo: Hacer una llamada que has evitado, hablar con alguien nuevo

6. Reflexiones (70 pts): Para gratitud y reestructuración cognitiva
   - Ejemplo: Identificar 3 fortalezas personales, cuestionario pensamientos negativos

FORMATO DE TAREAS (usa EXACTAMENTE este formato):

[TAREA_INICIO]
Titulo: [título corto y específico]
Descripcion: [explicación detallada: qué hacer, cómo hacerlo, por qué es importante para SU situación específica]
Frecuencia: [diaria/semanal/única]
Puntos: [50/75/80/90/100 según el tipo]
[TAREA_FIN]

REGLAS PARA GENERAR TAREAS:
- Selecciona 3 tareas de DIFERENTES tipos
- Cada tarea debe ser ESPECÍFICA para lo que discutieron
- La descripción debe mencionar cómo se relaciona con SU conversación
- Varía los puntos según dificultad (50-100)
- Sé realista y alcanzable
- NO uses siempre las mismas tareas genéricas

FORMATO DE ANÁLISIS EMOCIONAL (usa EXACTAMENTE este formato):

[ANALISIS_INICIO]
Emocion_Predominante: [nombre de la emoción principal detectada]
Intensidad: [1-10]
Evolucion: [mejoró/empeoró/se mantuvo]
Top_Emociones: [emocion1:porcentaje1, emocion2:porcentaje2, emocion3:porcentaje3, emocion4:porcentaje4]
[ANALISIS_FIN]

EMOCIONES COMUNES QUE PUEDES DETECTAR:
- ansiedad, estrés, preocupación, nerviosismo
- tristeza, melancolía, desánimo
- frustración, enojo, irritabilidad
- miedo, inseguridad, incertidumbre
- alegría, esperanza, optimismo, gratitud
- confusión, abrumado/a
- soledad, abandono
- culpa, vergüenza
- calma, tranquilidad, paz

REGLAS PARA ANÁLISIS EMOCIONAL:
- La emoción predominante debe ser la más evidente en la conversación
- La intensidad (1-10) debe reflejar qué tan fuerte es esa emoción
- La evolución debe indicar si mejoró durante la sesión
- Los 4 porcentajes deben sumar aproximadamente 100
- Usa emociones específicas basadas en lo que realmente dijeron

Responde siempre en español de forma natural y empática.`;

const SYSTEM_PROMPT_EN = `You are an empathetic and professional virtual therapy assistant. Your goals are:

1. Actively listen and validate the user's emotions
2. Ask open questions to better understand their situation
3. Offer emotional management techniques when appropriate
4. Suggest breathing, mindfulness, or grounding exercises when you detect anxiety or stress
5. Be warm, understanding, and non-judgmental

IMPORTANT:
- DO NOT diagnose medical conditions
- DO NOT prescribe medication
- If you detect severe crisis, suicidal ideation, or self-harm, recommend seeking immediate professional help
- Keep responses concise (2-4 sentences)
- Use a conversational and close tone in English
- If you mention an exercise, ask if they would like to do it

WHEN ENDING THE SESSION (when the user says something like "let's finish", "that's all", "I'm leaving", etc.):

1. FIRST: Give a warm and empathetic farewell message (1-2 sentences)
2. Briefly summarize the conversation in 2-3 sentences
3. Generate the EMOTIONAL ANALYSIS using the format [ANALISIS_INICIO]...[ANALISIS_FIN]
4. Generate EXACTLY 3 TASKS using the format [TAREA_INICIO]...[TAREA_FIN]

FAREWELL EXAMPLE:
"It has been a pleasure accompanying you in this session. Remember you can always come back when you need it. Take care."

IMPORTANT: When ending, you MUST include both the emotional analysis and the 3 tasks in your response.

AVAILABLE TASK TYPES (choose 3 most relevant according to the conversation):

1. Breathing exercises (50 pts): For anxiety, stress, nervousness
   - Example: Practice 4-7-8 breathing before bedtime

2. Emotional journal (75 pts): To process thoughts and feelings
   - Example: Write 3 positive things from the day, record emotions

3. Physical activity (100 pts): To improve mood, energy, sleep
   - Example: Walk for 20 minutes, moderate exercise

4. Coping techniques (80 pts): For specific situations mentioned
   - Example: Apply grounding technique in anxiety moments

5. Behavioral challenges (90 pts): To step out of comfort zone
   - Example: Make a call you've been avoiding, talk to someone new

6. Reflections (70 pts): For gratitude and cognitive restructuring
   - Example: Identify 3 personal strengths, questionnaire negative thoughts

TASK FORMAT (use EXACTLY this format):

[TAREA_INICIO]
Titulo: [short and specific title]
Descripcion: [detailed explanation: what to do, how to do it, why it's important for THEIR specific situation]
Frecuencia: [daily/weekly/one-time]
Puntos: [50/75/80/90/100 according to type]
[TAREA_FIN]

TASK GENERATION RULES:
- Select 3 tasks from DIFFERENT types
- Each task must be SPECIFIC to what they discussed
- The description should mention how it relates to THEIR conversation
- Vary points according to difficulty (50-100)
- Be realistic and achievable
- DO NOT always use the same generic tasks

EMOTIONAL ANALYSIS FORMAT (use EXACTLY this format):

[ANALISIS_INICIO]
Emocion_Predominante: [name of the main emotion detected]
Intensidad: [1-10]
Evolucion: [improved/worsened/stayed the same]
Top_Emociones: [emotion1:percentage1, emotion2:percentage2, emotion3:percentage3, emotion4:percentage4]
[ANALISIS_FIN]

COMMON EMOTIONS YOU CAN DETECT:
- anxiety, stress, worry, nervousness
- sadness, melancholy, discouragement
- frustration, anger, irritability
- fear, insecurity, uncertainty
- joy, hope, optimism, gratitude
- confusion, overwhelmed
- loneliness, abandonment
- guilt, shame
- calm, tranquility, peace

EMOTIONAL ANALYSIS RULES:
- The predominant emotion should be the most evident in the conversation
- Intensity (1-10) should reflect how strong that emotion is
- Evolution should indicate if it improved during the session
- The 4 percentages should approximately sum to 100
- Use specific emotions based on what they really said

Always respond in English in a natural and empathetic way.`;

export class AIService {
  private config: AIConfig | null = null;
  private conversationHistory: AIMessage[] = [];
  private language: 'es' | 'en' = 'es';

  constructor(language: 'es' | 'en' = 'es', userName?: string, assistantName?: string) {
    this.language = language;

    // Use hardcoded Groq API key
    this.config = {
      provider: 'groq',
      apiKey: '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'
    };

    let systemPrompt = language === 'es' ? SYSTEM_PROMPT : SYSTEM_PROMPT_EN;

    // Add assistant name context if provided
    if (assistantName) {
      const assistantContext = language === 'es'
        ? `\n\nTU NOMBRE:\nTe llamas ${assistantName}. Cuando sea apropiado, puedes presentarte con tu nombre para crear una conexión más personal con el usuario.`
        : `\n\nYOUR NAME:\nYour name is ${assistantName}. When appropriate, you can introduce yourself by name to create a more personal connection with the user.`;

      systemPrompt += assistantContext;
    }

    // Add user context if name is provided
    if (userName) {
      const userContext = language === 'es'
        ? `\n\nCONTEXTO DEL USUARIO:\nEl usuario se llama ${userName}. Puedes usar su nombre de manera natural en la conversación para crear una conexión más cercana y personal. Usa su nombre ocasionalmente durante la sesión, especialmente cuando valides sus emociones o cuando quieras enfatizar algo importante.`
        : `\n\nUSER CONTEXT:\nThe user's name is ${userName}. You can use their name naturally in the conversation to create a closer and more personal connection. Use their name occasionally during the session, especially when validating their emotions or when you want to emphasize something important.`;

      systemPrompt += userContext;
    }

    this.conversationHistory = [
      { role: 'system', content: systemPrompt }
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
    // Spanish
    lowerResponse.includes('ejercicio de respiración') ||
    lowerResponse.includes('respiración 4-7-8') ||
    (lowerResponse.includes('respirar') && lowerResponse.includes('ejercicio')) ||
    // English
    lowerResponse.includes('breathing exercise') ||
    lowerResponse.includes('4-7-8 breathing') ||
    (lowerResponse.includes('breathe') && lowerResponse.includes('exercise'))
  );
}

// Helper to detect crisis keywords
export function detectCrisis(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const crisisKeywords = [
    // Spanish
    'suicidio',
    'suicidarme',
    'matarme',
    'acabar con mi vida',
    'no quiero vivir',
    'quiero morir',
    'autolesión',
    'cortarme',
    'hacerme daño',
    // English
    'suicide',
    'kill myself',
    'end my life',
    'don\'t want to live',
    'want to die',
    'self-harm',
    'cut myself',
    'hurt myself'
  ];

  return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Helper to detect session end phrases
export function detectSessionEnd(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const endPhrases = [
    // Spanish
    'terminemos',
    'terminar',
    'hasta aquí',
    'hasta aqui',
    'me voy',
    'me tengo que ir',
    'tengo que irme',
    'debo irme',
    'ya me voy',
    'chau',
    'adiós',
    'adios',
    'nos vemos',
    'hasta luego',
    'fin de sesión',
    'fin de sesion',
    'finalizar',
    'terminar sesión',
    'terminar sesion',
    'ya es todo',
    'eso es todo',
    'nada más',
    'nada mas',
    // English
    'let\'s finish',
    'let\'s end',
    'finish',
    'end session',
    'that\'s all',
    'i have to go',
    'i must go',
    'gotta go',
    'bye',
    'goodbye',
    'see you',
    'until later',
    'i\'m leaving',
    'leaving now',
    'end this',
    'wrap up',
    'that\'s it',
    'nothing more',
    'no more'
  ];

  return endPhrases.some(phrase => lowerMessage.includes(phrase));
}