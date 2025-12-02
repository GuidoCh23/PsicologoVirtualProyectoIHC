import { useState, useEffect } from 'react';
import { Session } from '../types';
import { Headphones, FileText, Trash2, Calendar, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslation } from '../TranslationContext';

interface SessionSummaryProps {
  session: Session;
  onSave: (session: Session) => void;
  onDelete: () => void;
}

const emotionEmojis = [
  { emoji: '😔', label: 'triste', labelEn: 'sad' },
  { emoji: '😟', label: 'preocupado', labelEn: 'worried' },
  { emoji: '😐', label: 'neutral', labelEn: 'neutral' },
  { emoji: '🙂', label: 'tranquilo', labelEn: 'calm' },
  { emoji: '😊', label: 'feliz', labelEn: 'happy' }
];

export function SessionSummary({ session, onSave, onDelete }: SessionSummaryProps) {
  const { t, language } = useTranslation();
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [rating, setRating] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTasksSuggestion, setShowTasksSuggestion] = useState(true);
  const [showTranscription, setShowTranscription] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup: stop speech synthesis when component unmounts
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSave = () => {
    const updatedSession = {
      ...session,
      feedback_usuario: {
        estado_emocional_final: selectedEmoji,
        calificacion_estrellas: rating
      }
    };
    onSave(updatedSession);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const locale = language === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEvolutionIcon = () => {
    switch (session.analisis_emocional.evolucion) {
      case 'mejoró': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'empeoró': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const handlePlayConversation = () => {
    if (!session?.conversacion || session.conversacion.length === 0) {
      alert(language === 'es' ? 'No hay conversación disponible para esta sesión' : 'No conversation available for this session');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const conversacion = session.conversacion;
    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= conversacion.length) {
        setIsPlaying(false);
        return;
      }

      const message = conversacion[currentIndex];
      const utterance = new SpeechSynthesisUtterance(message.text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = message.role === 'user' ? 1.1 : 1;

      utterance.onend = () => {
        currentIndex++;
        setTimeout(speakNext, 500);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const handleShowTranscription = () => {
    if (!session?.conversacion || session.conversacion.length === 0) {
      alert(language === 'es' ? 'No hay transcripción disponible para esta sesión' : 'No transcription available for this session');
      return;
    }
    setShowTranscription(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Tasks Suggestion (appears first) */}
        {showTasksSuggestion && session.tareas_asignadas && session.tareas_asignadas.length > 0 && (
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎙</span>
              </div>
              <div>
                <h3 className="mb-2">{language === 'es' ? 'Psicólogo Virtual' : 'Virtual Psychologist'}</h3>
                <p className="text-sm opacity-90 mb-4">
                  {language === 'es'
                    ? '"Antes de que nos despidamos, me gustaría sugerirte algunas tareas para esta semana que te pueden ayudar:"'
                    : '"Before we say goodbye, I would like to suggest some tasks for this week that can help you:"'}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {session.tareas_asignadas.map((tarea, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="mb-2">{index + 1}. {tarea.titulo}</p>
                  <p className="text-sm opacity-80">{tarea.descripcion}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">⭐ {tarea.puntos} {t.summary.points}</span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded capitalize">{tarea.frecuencia}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm opacity-90 mb-4">
              {language === 'es'
                ? '"Estas tareas las encontrarás en tu pestaña de Tareas. ¡Nos vemos pronto!"'
                : '"You will find these tasks in your Tasks tab. See you soon!"'}
            </p>

            <button
              onClick={() => setShowTasksSuggestion(false)}
              className="w-full bg-white text-purple-600 py-3 rounded-lg hover:bg-purple-50 transition-colors"
            >
              {language === 'es' ? 'Continuar →' : 'Continue →'}
            </button>
          </div>
        )}

        {!showTasksSuggestion && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
              <h1 className="text-2xl mb-2">{t.summary.title}</h1>
              <div className="flex items-center gap-4 text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(session.fecha_hora)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{session.duracion_minutos} {t.summary.minutes}</span>
                </div>
                <span className="capitalize">({session.momento_dia === 'mañana' ? t.common.morning : session.momento_dia === 'tarde' ? t.common.afternoon : t.common.evening})</span>
              </div>
            </div>

            {/* Emotional Analysis */}
            <div className="p-6 border-b">
              <h2 className="text-lg mb-4">😰 {language === 'es' ? 'ANÁLISIS EMOCIONAL' : 'EMOTIONAL ANALYSIS'}</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estado predominante:</p>
                  <p className="text-xl capitalize">{session.analisis_emocional.emocion_predominante}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Intensidad promedio:</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all"
                        style={{ width: `${session.analisis_emocional.intensidad_promedio * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {session.analisis_emocional.intensidad_promedio}/10
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Evolución:</p>
                  <div className="flex items-center gap-2">
                    {getEvolutionIcon()}
                    <span className="capitalize">{session.analisis_emocional.evolucion}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Top 4 emociones detectadas:</p>
                  <div className="space-y-2">
                    {session.analisis_emocional.top_4_emociones.map((emocion, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm w-4">{index + 1}.</span>
                        <span className="capitalize flex-1">{emocion.emocion}</span>
                        <span className="text-sm text-gray-600">({emocion.porcentaje}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Exercises */}
            <div className="p-6 border-b">
              <h2 className="text-lg mb-4">🧘 EJERCICIOS REALIZADOS</h2>
              <div className="space-y-2">
                {session.ejercicios_realizados.map((ejercicio, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{ejercicio}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks Assigned */}
            {session.tareas_asignadas && session.tareas_asignadas.length > 0 && (
              <div className="p-6 border-b bg-purple-50">
                <h2 className="text-lg mb-4">✅ TAREAS ASIGNADAS ({session.tareas_asignadas.length})</h2>
                <div className="space-y-2">
                  {session.tareas_asignadas.map((tarea, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm">• {tarea.titulo}</span>
                      <span className="text-sm text-purple-600">⭐ {tarea.puntos} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Feedback */}
            <div className="p-6 border-b bg-gray-50">
              <h2 className="text-lg mb-4">💭 TU VALORACIÓN</h2>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">¿Cómo te sientes ahora?</p>
                <div className="flex gap-3 justify-center">
                  {emotionEmojis.map(({ emoji, label }) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-4xl p-3 rounded-xl transition-all ${
                        selectedEmoji === emoji 
                          ? 'bg-purple-100 scale-110' 
                          : 'hover:bg-gray-100'
                      }`}
                      title={label}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">Califica esta sesión:</p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-all ${
                        star <= rating 
                          ? 'text-yellow-400 scale-110' 
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handlePlayConversation}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-lg transition-colors ${
                    isPlaying
                      ? 'border-purple-600 bg-purple-50 text-purple-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                  <span className="text-sm">{isPlaying ? 'Detener' : 'Escuchar'}</span>
                </button>
                <button
                  onClick={handleShowTranscription}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Ver</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Eliminar</span>
                </button>
              </div>

              <button
                onClick={handleSave}
                disabled={!selectedEmoji || rating === 0}
                className={`w-full py-4 rounded-lg transition-all ${
                  selectedEmoji && rating > 0
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                ✅ Guardar y Continuar
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl mb-4">⚠ Eliminar Sesión</h3>
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que quieres eliminar esta sesión?
              </p>
              <p className="text-sm text-gray-600 mb-2">Esta acción no se puede deshacer. Se eliminarán:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
                <li>Transcripción completa</li>
                <li>Audio de la sesión</li>
                <li>Todas las estadísticas</li>
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={onDelete}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  ❌ Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transcription Modal */}
        {showTranscription && session?.conversacion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b">
                <h3 className="text-xl mb-2">📝 Transcripción de la Sesión</h3>
                <p className="text-sm text-gray-600">{formatDate(session.fecha_hora)}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {session.conversacion.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[80%]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">
                          {msg.role === 'user' ? 'Tú' : 'Asistente'}
                        </span>
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t">
                <button
                  onClick={() => setShowTranscription(false)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
