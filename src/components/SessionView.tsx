import { useState, useEffect, useRef } from 'react';
import { Session } from '../types';
import { Mic, Square, Volume2 } from 'lucide-react';
import { CrisisModal } from './CrisisModal';
import { BreathingExercise } from './BreathingExercise';
import { AIService, detectBreathingExerciseSuggestion, detectCrisis } from '../services/aiService';

interface SessionViewProps {
  session: Session;
  onEndSession: (session: Session) => void;
}

export function SessionView({ session, onEndSession }: SessionViewProps) {
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
  const recognitionRef = useRef<any>(null);
  const aiServiceRef = useRef<AIService | null>(null);

  useEffect(() => {
    // Initialize AI Service (already configured with hardcoded key)
    aiServiceRef.current = new AIService();

    // Start with greeting
    setTimeout(() => {
      const greeting = '👋 Hola, ¿cómo te sientes hoy? Estoy aquí para escucharte.';
      setMessages([{
        role: 'assistant',
        text: greeting
      }]);
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

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Split long text into chunks to avoid browser limitations
      const maxLength = 200; // Maximum characters per chunk
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let chunks: string[] = [];

      let currentChunk = '';
      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk += sentence;
        }
      }
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
      }

      // If no sentences were found, split by length
      if (chunks.length === 0) {
        for (let i = 0; i < text.length; i += maxLength) {
          chunks.push(text.substring(i, i + maxLength));
        }
      }

      // Speak each chunk sequentially
      let currentIndex = 0;
      const speakChunk = () => {
        if (currentIndex >= chunks.length) return;

        const utterance = new SpeechSynthesisUtterance(chunks[currentIndex]);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onend = () => {
          currentIndex++;
          if (currentIndex < chunks.length) {
            // Small pause between chunks
            setTimeout(speakChunk, 100);
          }
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
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
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessages(prev => [...prev, {
        role: 'user',
        text: transcript
      }]);
      
      setTimeout(() => {
        processUserMessage(transcript);
      }, 500);
    };

    recognition.onerror = (event: any) => {
      console.error('Error en el reconocimiento de voz:', event.error);
      
      if (event.error === 'not-allowed') {
        setMicAvailable(false);
        setIsListening(false);
        return;
      } else if (event.error === 'no-speech') {
        // Don't show alert for no-speech, just allow retry
        setIsListening(false);
        return;
      } else if (event.error === 'audio-capture') {
        setMicAvailable(false);
      } else if (event.error === 'aborted') {
        // User cancelled, just reset
        setIsListening(false);
        return;
      }
      
      setIsListening(false);
    };

    recognition.onend = () => {
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

  const processUserMessage = async (userText: string) => {
    // Check for crisis keywords
    if (detectCrisis(userText)) {
      setShowCrisisModal(true);
      return;
    }

    setIsProcessing(true);

    try {
      // Use AI Service to generate response
      const response = await aiServiceRef.current!.sendMessage(userText);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: response
      }]);
      
      speak(response);

      // Check if AI suggested breathing exercise
      if (detectBreathingExerciseSuggestion(response)) {
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
    speak(response);
  };

  const handleEndSession = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Generate session data
    const completedSession: Session = {
      ...session,
      duracion_minutos: sessionDuration,
      analisis_emocional: {
        emocion_predominante: 'ansiedad',
        intensidad_promedio: 7,
        evolucion: 'mejoró',
        top_4_emociones: [
          { emocion: 'ansiedad', porcentaje: 60 },
          { emocion: 'preocupación', porcentaje: 25 },
          { emocion: 'frustración', porcentaje: 10 },
          { emocion: 'esperanza', porcentaje: 5 }
        ]
      },
      ejercicios_realizados: exercisesCompleted.length > 0 ? exercisesCompleted : [
        'Conversación terapéutica'
      ],
      conversacion: messages,
      tareas_asignadas: [
        {
          titulo: 'Practicar respiración 4-7-8',
          descripcion: 'Cada noche antes de acostarte, realiza 3 ciclos de la respiración 4-7-8 que practicamos. Esto te ayudará a reducir la ansiedad nocturna y mejorar tu sueño.',
          frecuencia: 'diaria',
          puntos: 50
        },
        {
          titulo: 'Escribir 3 cosas positivas del día',
          descripcion: 'Al final de cada día, escribe tres cosas positivas que te hayan pasado, por pequeñas que sean. Esto ayuda a entrenar tu mente para enfocarse en lo bueno.',
          frecuencia: 'diaria',
          puntos: 75
        },
        {
          titulo: 'Salir a caminar 20 minutos',
          descripcion: 'Sal a caminar al menos 20 minutos, 3 veces esta semana. El ejercicio moderado ayuda a reducir la ansiedad y mejora el estado de ánimo.',
          frecuencia: 'semanal',
          puntos: 100
        }
      ]
    };

    onEndSession(completedSession);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex flex-col">
      <CrisisModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />

      {/* Header */}
      <div className="p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl">Sesión en Curso</h1>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
          >
            Terminar Sesión
          </button>
        </div>
        <p className="text-sm opacity-90">
          ⏱ Duración: {sessionDuration} minutos
        </p>
      </div>

      {/* Emotion Visualization */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {emotionColors.map((color, i) => (
            <div
              key={i}
              className="absolute rounded-full blur-3xl opacity-40 transition-all duration-3000"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                backgroundColor: color,
                animation: `pulse ${3 + i}s ease-in-out infinite`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className={`w-32 h-32 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${isListening ? 'animate-pulse' : ''}`}>
              {isListening ? (
                <Volume2 className="w-16 h-16 text-white animate-pulse" />
              ) : (
                <Mic className="w-16 h-16 text-white" />
              )}
            </div>
          </div>

          {isListening ? (
            <p className="text-white text-lg">Escuchando...</p>
          ) : (
            <p className="text-white text-lg">Toca el micrófono para hablar</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-t-3xl p-6 max-h-96 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 border-t space-y-3">
        <button
          onClick={handleStartListening}
          disabled={isListening}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
            isListening
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
          }`}
        >
          {isListening ? (
            <>
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span>Escuchando...</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Presiona para hablar</span>
            </>
          )}
        </button>

        <form onSubmit={handleTextSubmit} className="w-full">
          <div className="flex items-center">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Escribe tu mensaje aquí"
              className="w-full py-3 px-4 rounded-xl bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="ml-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-colors"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}