import { useState, useEffect, useRef } from 'react';
import { Session } from '../types';
import { Mic, Square, Volume2 } from 'lucide-react';
import { CrisisModal } from './CrisisModal';
import { BreathingExercise } from './BreathingExercise';
import { AIService, detectBreathingExerciseSuggestion, detectCrisis, detectSessionEnd } from '../services/aiService';
import { useTranslation } from '../TranslationContext';
import { useAuth } from '../AuthContext';

interface SessionViewProps {
  session: Session;
  onEndSession: (session: Session) => void;
}

export function SessionView({ session, onEndSession }: SessionViewProps) {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [emotionColors, setEmotionColors] = useState(['#9333ea', '#ec4899', '#8b5cf6']);
  const [showBreathing, setShowBreathing] = useState(false);
  const [exercisesCompleted, setExercisesCompleted] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const [micAvailable, setMicAvailable] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [shouldEndSession, setShouldEndSession] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');
  const [assistantLanguage, setAssistantLanguage] = useState<'es' | 'en'>('es');
  const recognitionRef = useRef<any>(null);
  const aiServiceRef = useRef<AIService | null>(null);
  const prevIsSpeakingRef = useRef<boolean>(false);

  // Generate personalized greeting based on user preferences
  const getPersonalizedGreeting = (lang: 'es' | 'en'): string => {
    let userName = '';

    if (user?.preferencia_nombre === 'nombre') {
      userName = user.nombre;
    } else if (user?.preferencia_nombre === 'apodo' && user.apodo) {
      userName = user.apodo;
    }

    if (lang === 'es') {
      const greetings = [
        userName ? `¡Hola ${userName}! ¿Qué tal? ¿Qué podrías contarme sobre tu día?` : '¡Hola! ¿Qué tal? ¿Qué podrías contarme sobre tu día?',
        userName ? `¡Hola ${userName}! ¿Cómo te sientes hoy? Estoy aquí para escucharte.` : '¡Hola! ¿Cómo te sientes hoy? Estoy aquí para escucharte.',
        userName ? `Hola ${userName}, ¿cómo ha sido tu día? Cuéntame lo que quieras.` : 'Hola, ¿cómo ha sido tu día? Cuéntame lo que quieras.',
        userName ? `¡Qué bueno verte ${userName}! ¿Hay algo especial que quieras compartir hoy?` : '¡Qué bueno verte! ¿Hay algo especial que quieras compartir hoy?',
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    } else {
      const greetings = [
        userName ? `Hi ${userName}! How are you? What could you tell me about your day?` : 'Hi! How are you? What could you tell me about your day?',
        userName ? `Hello ${userName}! How are you feeling today? I'm here to listen.` : 'Hello! How are you feeling today? I\'m here to listen.',
        userName ? `Hi ${userName}, how has your day been? Tell me whatever you'd like.` : 'Hi, how has your day been? Tell me whatever you\'d like.',
        userName ? `Great to see you ${userName}! Is there anything special you'd like to share today?` : 'Great to see you! Is there anything special you\'d like to share today?',
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
  };

  useEffect(() => {
    // Load settings from localStorage first
    const savedSettings = localStorage.getItem('appSettings');
    let loadedLanguage = 'es';
    let loadedGender: 'male' | 'female' = 'male';

    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.voiceGender) {
        setVoiceGender(settings.voiceGender);
        loadedGender = settings.voiceGender;
      }
      if (settings.assistantLanguage) {
        setAssistantLanguage(settings.assistantLanguage);
        loadedLanguage = settings.assistantLanguage;
      }
    }

    // Get user name based on preference
    let userName: string | undefined = undefined;
    if (user?.preferencia_nombre === 'nombre') {
      userName = user.nombre;
    } else if (user?.preferencia_nombre === 'apodo' && user.apodo) {
      userName = user.apodo;
    }

    // Get assistant name if provided
    const assistantName = user?.nombre_asistente;

    // Initialize AI Service with the loaded language, user name, and assistant name
    aiServiceRef.current = new AIService(loadedLanguage, userName, assistantName);

    // Start with personalized greeting
    setTimeout(() => {
      const greeting = getPersonalizedGreeting(loadedLanguage);
      setMessages([{
        role: 'assistant',
        text: greeting
      }]);
      setCurrentMessage(greeting);
      speak(greeting);
    }, 500);

    // Session duration timer
    const timer = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Animate emotion colors
    const interval = setInterval(() => {
      setEmotionColors([
        `hsl(${Math.random() * 360}, 70%, 60%)`,
        `hsl(${Math.random() * 360}, 70%, 60%)`,
        `hsl(${Math.random() * 360}, 70%, 60%)`
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Auto-end session when assistant finishes speaking farewell
  useEffect(() => {
    // Only trigger when isSpeaking changes from true to false
    const wasSpeaking = prevIsSpeakingRef.current;
    const justFinishedSpeaking = wasSpeaking && !isSpeaking;

    // Update the ref for next render
    prevIsSpeakingRef.current = isSpeaking;

    if (justFinishedSpeaking && shouldEndSession) {
      // Wait a bit for the user to process the complete message
      const timeout = setTimeout(() => {
        handleEndSession();
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [isSpeaking, shouldEndSession]);

  // Function to clean text before speaking - removes analysis and task markers
  const cleanTextForSpeech = (text: string): string => {
    let cleanedText = text;

    // Remove everything from "Resumiendo" onwards (session ending summary)
    const summaryKeywords = [
      'Resumiendo',
      'En resumen',
      'Para resumir',
      'Resumo nuestra',
      'Resumen de'
    ];

    for (const keyword of summaryKeywords) {
      const index = cleanedText.indexOf(keyword);
      if (index !== -1) {
        cleanedText = cleanedText.substring(0, index).trim();
        break;
      }
    }

    // Remove everything between [ANALISIS_INICIO] and [ANALISIS_FIN]
    cleanedText = cleanedText.replace(/\[ANALISIS_INICIO\][\s\S]*?\[ANALISIS_FIN\]/g, '');

    // Remove everything between [TAREA_INICIO] and [TAREA_FIN] (multiple occurrences)
    cleanedText = cleanedText.replace(/\[TAREA_INICIO\][\s\S]*?\[TAREA_FIN\]/g, '');

    // Remove any remaining markers if they appear without closing tags
    cleanedText = cleanedText.replace(/\[ANALISIS_INICIO\][\s\S]*/g, '');
    cleanedText = cleanedText.replace(/\[TAREA_INICIO\][\s\S]*/g, '');

    // Clean up any extra whitespace or newlines left behind
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n').trim();

    return cleanedText;
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Clean text before speaking (remove analysis and task markers)
      const cleanedText = cleanTextForSpeech(text);

      // If there's nothing left to speak after cleaning, just finish
      if (!cleanedText.trim()) {
        setIsSpeaking(false);
        return;
      }

      setIsSpeaking(true);

      // Split text into smaller chunks (200 chars is safer for most browsers)
      const maxLength = 200;
      const chunks: string[] = [];

      // Try to split by sentences first
      const sentences = cleanedText.match(/[^.!?]+[.!?]+/g) || [cleanedText];

      for (const sentence of sentences) {
        if (sentence.length <= maxLength) {
          chunks.push(sentence.trim());
        } else {
          // If sentence is too long, split by commas or spaces
          const parts = sentence.split(/[,;]/);
          let currentChunk = '';

          for (const part of parts) {
            if ((currentChunk + part).length > maxLength && currentChunk.length > 0) {
              chunks.push(currentChunk.trim());
              currentChunk = part;
            } else {
              currentChunk += part;
            }
          }

          if (currentChunk.trim().length > 0) {
            // If still too long, force split by words
            if (currentChunk.length > maxLength) {
              const words = currentChunk.split(' ');
              let wordChunk = '';

              for (const word of words) {
                if ((wordChunk + ' ' + word).length > maxLength && wordChunk.length > 0) {
                  chunks.push(wordChunk.trim());
                  wordChunk = word;
                } else {
                  wordChunk += (wordChunk ? ' ' : '') + word;
                }
              }

              if (wordChunk.trim().length > 0) {
                chunks.push(wordChunk.trim());
              }
            } else {
              chunks.push(currentChunk.trim());
            }
          }
        }
      }

      console.log('Speaking in', chunks.length, 'chunks:', chunks);

      // Speak each chunk sequentially with improved error handling
      let currentIndex = 0;
      let timeoutId: NodeJS.Timeout;

      const speakChunk = () => {
        if (currentIndex >= chunks.length) {
          setIsSpeaking(false);
          return;
        }

        // Resume synthesis in case it was paused
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(chunks[currentIndex]);
        utterance.lang = assistantLanguage === 'es' ? 'es-ES' : 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Select voice based on gender setting
        const voices = window.speechSynthesis.getVoices();
        const langPrefix = assistantLanguage === 'es' ? 'es' : 'en';

        const preferredVoice = voices.find(voice => {
          const isCorrectLang = voice.lang.startsWith(langPrefix);
          const matchesGender = voiceGender === 'female'
            ? voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('mujer') || !voice.name.toLowerCase().includes('male')
            : voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('hombre');
          return isCorrectLang && matchesGender;
        });

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // Keep the synthesis active to prevent timeout
        const keepAlive = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            clearInterval(keepAlive);
          } else {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000); // Every 10 seconds

        utterance.onstart = () => {
          console.log('Speaking chunk', currentIndex + 1, 'of', chunks.length);
        };

        utterance.onend = () => {
          clearInterval(keepAlive);
          console.log('Finished chunk', currentIndex + 1);
          currentIndex++;

          if (currentIndex < chunks.length) {
            // Pause between chunks for natural flow
            timeoutId = setTimeout(speakChunk, 300);
          } else {
            setIsSpeaking(false);
            console.log('Finished speaking all chunks');
          }
        };

        utterance.onerror = (event) => {
          clearInterval(keepAlive);
          console.error('Speech synthesis error:', event.error, 'at chunk', currentIndex);

          // Try to continue with next chunk if error isn't critical
          if (event.error !== 'canceled') {
            currentIndex++;
            if (currentIndex < chunks.length) {
              timeoutId = setTimeout(speakChunk, 500);
            } else {
              setIsSpeaking(false);
            }
          } else {
            setIsSpeaking(false);
          }
        };

        window.speechSynthesis.speak(utterance);
      };

      speakChunk();
    }
  };

  const handleStartListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setMicAvailable(false);
      return;
    }

    // Start speech recognition directly - it will request permissions automatically
    startSpeechRecognition();
  };

  const startSpeechRecognition = () => {
    setIsListening(true);
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    // Enable continuous listening and interim results for better UX
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = assistantLanguage === 'es' ? 'es-ES' : 'en-US';
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    let finalTranscript = '';
    let interimTranscript = '';

    recognition.onresult = (event: any) => {
      interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Show interim results while speaking
      const currentText = (finalTranscript + interimTranscript).trim();
      if (currentText) {
        setCurrentMessage(currentText);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Error en el reconocimiento de voz:', event.error);

      if (event.error === 'not-allowed') {
        setMicAvailable(false);
        setIsListening(false);
        return;
      } else if (event.error === 'no-speech') {
        // Keep listening, don't stop
        console.log('No speech detected, but continuing to listen...');
        return;
      } else if (event.error === 'audio-capture') {
        setMicAvailable(false);
        setIsListening(false);
      } else if (event.error === 'aborted') {
        // User cancelled, just reset
        setIsListening(false);
        return;
      }
    };

    recognition.onend = () => {
      // Only process if we have a transcript and user stopped intentionally
      if (finalTranscript.trim() && !isListening) {
        setMessages(prev => [...prev, {
          role: 'user',
          text: finalTranscript.trim()
        }]);

        setTimeout(() => {
          processUserMessage(finalTranscript.trim());
        }, 500);
      }
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Error al iniciar reconocimiento:', error);
      setMicAvailable(false);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const processUserMessage = async (userText: string) => {
    // Check for crisis keywords
    if (detectCrisis(userText)) {
      setShowCrisisModal(true);
      return;
    }

    // Check if user wants to end session
    const userWantsToEnd = detectSessionEnd(userText);
    if (userWantsToEnd) {
      setShouldEndSession(true);
    }

    setIsProcessing(true);

    try {
      // Use AI Service to generate response
      const response = await aiServiceRef.current!.sendMessage(userText);

      // Clean the response text to remove analysis and task markers for display
      const cleanedResponse = cleanTextForSpeech(response);

      // Add cleaned message to display (without analysis/tasks markers)
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: cleanedResponse
      }]);

      setCurrentMessage(cleanedResponse);
      speak(response); // speak() already cleans internally

      // Check if AI suggested breathing exercise (only if not ending session)
      if (!userWantsToEnd && detectBreathingExerciseSuggestion(response)) {
        setTimeout(() => {
          setShowBreathing(true);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error al procesar mensaje:', error);

      // Fallback response
      const fallbackResponse = 'Te escucho y entiendo lo que compartes conmigo. ¿Puedes contarme más sobre eso?';

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: fallbackResponse
      }]);

      setCurrentMessage(fallbackResponse);
      speak(fallbackResponse);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBreathingComplete = () => {
    setShowBreathing(false);
    setExercisesCompleted(prev => [...prev, 'Respiración 4-7-8']);

    const response = '¡Muy bien! Has completado el ejercicio de respiración. ¿Cómo te sientes ahora? ¿Notas algún cambio en tu cuerpo o tu mente?';
    setMessages(prev => [...prev, {
      role: 'assistant',
      text: response
    }]);
    setCurrentMessage(response);
    speak(response);
  };

  const extractTasksFromMessages = () => {
    // Busca tareas en los mensajes del asistente (especialmente el último)
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    if (assistantMessages.length === 0) return [];

    const tasks: Array<{
      titulo: string;
      descripcion: string;
      frecuencia: string;
      puntos: number;
    }> = [];

    // Buscar en todos los mensajes del asistente, pero priorizar los últimos
    for (let i = assistantMessages.length - 1; i >= 0; i--) {
      const messageText = assistantMessages[i].text;

      // Regex para encontrar tareas con el formato [TAREA_INICIO]...[TAREA_FIN]
      const taskRegex = /\[TAREA_INICIO\]([\s\S]*?)\[TAREA_FIN\]/gi;
      const matches = [...messageText.matchAll(taskRegex)];

      for (const match of matches) {
        const taskContent = match[1];

        // Extraer campos de la tarea
        const tituloMatch = taskContent.match(/Titulo:\s*(.+?)(?:\n|$)/i);
        const descripcionMatch = taskContent.match(/Descripcion:\s*(.+?)(?:\n|Frecuencia)/is);
        const frecuenciaMatch = taskContent.match(/Frecuencia:\s*(.+?)(?:\n|$)/i);
        const puntosMatch = taskContent.match(/Puntos:\s*(\d+)/i);

        if (tituloMatch && descripcionMatch) {
          tasks.push({
            titulo: tituloMatch[1].trim(),
            descripcion: descripcionMatch[1].trim(),
            frecuencia: frecuenciaMatch ? frecuenciaMatch[1].trim() : 'única',
            puntos: puntosMatch ? parseInt(puntosMatch[1]) : 50
          });
        }
      }

      // Si ya encontramos tareas, no seguir buscando
      if (tasks.length > 0) break;
    }

    return tasks;
  };

  const extractEmotionalAnalysis = () => {
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    if (assistantMessages.length === 0) return null;

    // Buscar en los últimos mensajes del asistente
    for (let i = assistantMessages.length - 1; i >= 0; i--) {
      const messageText = assistantMessages[i].text;

      // Regex para encontrar análisis emocional
      const analysisRegex = /\[ANALISIS_INICIO\]([\s\S]*?)\[ANALISIS_FIN\]/i;
      const match = messageText.match(analysisRegex);

      if (match) {
        const analysisContent = match[1];

        // Extraer campos
        const emocionMatch = analysisContent.match(/Emocion_Predominante:\s*(.+?)(?:\n|$)/i);
        const intensidadMatch = analysisContent.match(/Intensidad:\s*(\d+)/i);
        const evolucionMatch = analysisContent.match(/Evolucion:\s*(.+?)(?:\n|$)/i);
        const topEmocionesMatch = analysisContent.match(/Top_Emociones:\s*(.+?)(?:\n|$)/i);

        if (emocionMatch && intensidadMatch) {
          const topEmociones: Array<{ emocion: string; porcentaje: number }> = [];

          if (topEmocionesMatch) {
            // Parse formato: emocion1:porcentaje1, emocion2:porcentaje2, ...
            const emocionesStr = topEmocionesMatch[1];
            const emocionPairs = emocionesStr.split(',');

            for (const pair of emocionPairs) {
              const [emocion, porcentaje] = pair.split(':').map(s => s.trim());
              if (emocion && porcentaje) {
                topEmociones.push({
                  emocion,
                  porcentaje: parseInt(porcentaje) || 0
                });
              }
            }
          }

          // Si no se extrajeron emociones, usar la predominante como única
          if (topEmociones.length === 0) {
            topEmociones.push({
              emocion: emocionMatch[1].trim(),
              porcentaje: 100
            });
          }

          const evolucion = evolucionMatch ? evolucionMatch[1].trim().toLowerCase() : 'se mantuvo';
          const evolucionValid = evolucion === 'mejoró' || evolucion === 'empeoró' ? evolucion : 'se mantuvo';

          return {
            emocion_predominante: emocionMatch[1].trim(),
            intensidad_promedio: parseInt(intensidadMatch[1]),
            evolucion: evolucionValid as 'mejoró' | 'empeoró' | 'se mantuvo',
            top_4_emociones: topEmociones.slice(0, 4)
          };
        }
      }
    }

    return null;
  };

  const handleEndSession = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Extraer tareas del mensaje de la IA
    let extractedTasks = extractTasksFromMessages();

    // Extraer análisis emocional del mensaje de la IA
    let extractedAnalysis = extractEmotionalAnalysis();

    // Si no hay tareas ni análisis (sesión terminada manualmente), pedirle al AI que los genere
    if ((!extractedTasks || extractedTasks.length === 0) && !extractedAnalysis && messages.length > 0) {
      try {
        setIsProcessing(true);

        // Enviar mensaje al AI pidiendo análisis y tareas basadas en la conversación
        const endingPrompt = "El usuario ha terminado la sesión. Por favor genera el análisis emocional y las 3 tareas basándote en nuestra conversación.";
        const response = await aiServiceRef.current!.sendMessage(endingPrompt);

        // Intentar extraer tareas y análisis de la nueva respuesta
        const tempMessages = [...messages, { role: 'assistant' as const, text: response }];

        // Extraer del último mensaje
        const lastMessage = tempMessages[tempMessages.length - 1];
        if (lastMessage.role === 'assistant') {
          // Extraer tareas
          const taskMatches = lastMessage.text.matchAll(/\[TAREA_INICIO\]([\s\S]*?)\[TAREA_FIN\]/g);
          const tasks = [];
          for (const match of taskMatches) {
            const taskContent = match[1];
            const tituloMatch = taskContent.match(/Titulo:\s*(.+)/);
            const descripcionMatch = taskContent.match(/Descripcion:\s*(.+)/);
            const frecuenciaMatch = taskContent.match(/Frecuencia:\s*(.+)/);
            const puntosMatch = taskContent.match(/Puntos:\s*(\d+)/);

            if (tituloMatch && descripcionMatch && puntosMatch) {
              tasks.push({
                titulo: tituloMatch[1].trim(),
                descripcion: descripcionMatch[1].trim(),
                frecuencia: frecuenciaMatch ? frecuenciaMatch[1].trim() : 'única',
                puntos: parseInt(puntosMatch[1])
              });
            }
          }

          if (tasks.length > 0) {
            extractedTasks = tasks;
          }

          // Extraer análisis emocional
          const analisisMatch = lastMessage.text.match(/\[ANALISIS_INICIO\]([\s\S]*?)\[ANALISIS_FIN\]/);
          if (analisisMatch) {
            const analisisContent = analisisMatch[1];
            const emocionMatch = analisisContent.match(/Emocion_Predominante:\s*(.+)/);
            const intensidadMatch = analisisContent.match(/Intensidad:\s*(\d+)/);
            const evolucionMatch = analisisContent.match(/Evolucion:\s*(.+)/);
            const topEmocionesMatch = analisisContent.match(/Top_Emociones:\s*(.+)/);

            if (emocionMatch && intensidadMatch && evolucionMatch && topEmocionesMatch) {
              const topEmocionesStr = topEmocionesMatch[1];
              const emocionesParts = topEmocionesStr.split(',').map(e => e.trim());
              const topEmociones = emocionesParts.map(part => {
                const [emocion, porcentaje] = part.split(':').map(s => s.trim());
                return {
                  emocion: emocion,
                  porcentaje: parseInt(porcentaje) || 0
                };
              });

              const evolucion = evolucionMatch[1].trim();
              const evolucionValid = evolucion === 'mejoró' || evolucion === 'empeoró' ? evolucion : 'se mantuvo';

              extractedAnalysis = {
                emocion_predominante: emocionMatch[1].trim(),
                intensidad_promedio: parseInt(intensidadMatch[1]),
                evolucion: evolucionValid as 'mejoró' | 'empeoró' | 'se mantuvo',
                top_4_emociones: topEmociones.slice(0, 4)
              };
            }
          }
        }

        setIsProcessing(false);
      } catch (error) {
        console.error('Error al generar análisis final:', error);
        setIsProcessing(false);
      }
    }

    // Si no se pudieron extraer tareas, usar tareas por defecto
    const defaultTasks = [
      {
        titulo: 'Practicar respiración consciente',
        descripcion: 'Dedica 5 minutos cada día a practicar respiración profunda. Esto te ayudará a manejar el estrés y la ansiedad.',
        frecuencia: 'diaria',
        puntos: 50
      },
      {
        titulo: 'Registrar emociones diarias',
        descripcion: 'Al final del día, escribe cómo te sentiste y qué situaciones influyeron en tus emociones.',
        frecuencia: 'diaria',
        puntos: 75
      },
      {
        titulo: 'Actividad física regular',
        descripcion: 'Realiza al menos 20 minutos de actividad física que disfrutes, 3 veces esta semana.',
        frecuencia: 'semanal',
        puntos: 100
      }
    ];

    // Análisis emocional por defecto si no se pudo extraer
    const defaultAnalysis = {
      emocion_predominante: 'neutral',
      intensidad_promedio: 5,
      evolucion: 'se mantuvo' as 'mejoró' | 'empeoró' | 'se mantuvo',
      top_4_emociones: [
        { emocion: 'neutral', porcentaje: 100 }
      ]
    };

    // Generate session data
    const completedSession: Session = {
      ...session,
      duracion_minutos: sessionDuration,
      analisis_emocional: extractedAnalysis || defaultAnalysis,
      ejercicios_realizados: exercisesCompleted.length > 0 ? exercisesCompleted : [
        'Conversación terapéutica'
      ],
      conversacion: messages,
      tareas_asignadas: extractedTasks.length > 0 ? extractedTasks : defaultTasks
    };

    console.log('Análisis emocional extraído:', extractedAnalysis);
    console.log('Tareas extraídas:', extractedTasks);
    console.log('Sesión completa:', completedSession);

    onEndSession(completedSession);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setCurrentMessage(textInput);
    setMessages(prev => [...prev, {
      role: 'user',
      text: textInput
    }]);

    processUserMessage(textInput);
    setTextInput('');
  };

  if (showBreathing) {
    return <BreathingExercise onComplete={handleBreathingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex flex-col relative overflow-hidden">
      <CrisisModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />

      {/* Background ambient circles */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {emotionColors.map((color, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-3xl opacity-30 transition-all duration-[3000ms]"
            style={{
              width: `${300 + i * 150}px`,
              height: `${300 + i * 150}px`,
              backgroundColor: color,
              animation: `float ${4 + i * 2}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{language === 'es' ? 'Sesión en Curso' : 'Session in Progress'}</h1>
            <p className="text-sm opacity-80 mt-1">
              ⏱ {sessionDuration} {sessionDuration === 1 ? (language === 'es' ? 'minuto' : 'minute') : (language === 'es' ? 'minutos' : 'minutes')}
            </p>
          </div>
          <button
            onClick={handleEndSession}
            className="px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all font-medium"
          >
            {language === 'es' ? 'Terminar' : 'End'}
          </button>
        </div>
      </div>

      {/* Main conversation area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        {/* Animated circle avatar */}
        <div className="relative mb-8">
          {/* Outer rings that pulse when speaking */}
          {isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
            </>
          )}

          {/* Main circle */}
          <div
            className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
              isSpeaking
                ? 'bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 shadow-2xl shadow-pink-500/50 scale-110'
                : isListening
                ? 'bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 shadow-2xl shadow-blue-500/50 scale-105'
                : 'bg-white/20 backdrop-blur-md shadow-xl'
            }`}
            style={{
              animation: isSpeaking ? 'breathe 1.2s ease-in-out infinite' : 'none'
            }}
          >
            {/* Icon */}
            <div className="relative">
              {isListening ? (
                <Volume2 className="w-20 h-20 text-white drop-shadow-lg animate-pulse" />
              ) : isSpeaking ? (
                <div className="flex gap-2">
                  <div className="w-2 h-16 bg-white rounded-full animate-wave" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-16 bg-white rounded-full animate-wave" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-16 bg-white rounded-full animate-wave" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-16 bg-white rounded-full animate-wave" style={{ animationDelay: '0.3s' }} />
                  <div className="w-2 h-16 bg-white rounded-full animate-wave" style={{ animationDelay: '0.4s' }} />
                </div>
              ) : (
                <Mic className="w-20 h-20 text-white drop-shadow-lg" />
              )}
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className="text-center space-y-3 max-w-2xl px-6">
          {isProcessing ? (
            <p className="text-white text-lg font-medium animate-pulse">{t.session.processing}</p>
          ) : isListening ? (
            <p className="text-white text-lg font-medium">{t.session.listening}</p>
          ) : isSpeaking ? (
            <p className="text-white text-lg font-medium">{language === 'es' ? 'Hablando...' : 'Speaking...'}</p>
          ) : (
            <p className="text-white text-lg font-medium">{language === 'es' ? 'Toca el botón para hablar' : 'Tap the button to speak'}</p>
          )}

          {/* Current message display */}
          {currentMessage && (
            <p className="text-white/90 text-base leading-relaxed mt-4 animate-fade-in">
              {currentMessage}
            </p>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 p-6 space-y-3">
        {/* Voice button - changes between start and stop */}
        {isListening ? (
          <button
            onClick={handleStopListening}
            className="w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-semibold text-lg transition-all transform bg-red-500 text-white hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:bg-red-600"
          >
            <Square className="w-6 h-6" />
            <span>{language === 'es' ? 'Detener' : 'Stop'}</span>
          </button>
        ) : (
          <button
            onClick={handleStartListening}
            disabled={isSpeaking || isProcessing}
            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-semibold text-lg transition-all transform ${
              isSpeaking || isProcessing
                ? 'bg-white/20 cursor-not-allowed backdrop-blur-sm'
                : 'bg-white text-purple-700 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] shadow-xl'
            }`}
          >
            {isSpeaking ? (
              <>
                <Volume2 className="w-6 h-6" />
                <span>{language === 'es' ? 'Hablando...' : 'Speaking...'}</span>
              </>
            ) : isProcessing ? (
              <>
                <Volume2 className="w-6 h-6 animate-pulse" />
                <span>{t.session.processing}</span>
              </>
            ) : (
              <>
                <Mic className="w-6 h-6" />
                <span>{language === 'es' ? 'Presiona para hablar' : 'Press to speak'}</span>
              </>
            )}
          </button>
        )}

        {/* Text input fallback */}
        {!micAvailable && (
          <form onSubmit={handleTextSubmit} className="w-full">
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={t.session.typeMessage}
                className="flex-1 py-4 px-5 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white font-medium"
                disabled={isProcessing || isSpeaking}
              />
              <button
                type="submit"
                disabled={isProcessing || isSpeaking || !textInput.trim()}
                className="px-6 py-4 rounded-2xl bg-white text-purple-700 font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.session.send}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -30px) scale(1.05);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.95);
          }
          75% {
            transform: translate(-30px, -20px) scale(1.02);
          }
        }

        @keyframes breathe {
          0%, 100% {
            transform: scale(1.1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: scaleY(0.5);
          }
          50% {
            transform: scaleY(1);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-wave {
          animation: wave 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}