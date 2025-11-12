import { useState, useEffect } from 'react';
import { Session } from '../types';
import { Calendar, Clock, TrendingUp, TrendingDown, Minus, Trash2, Headphones, FileText } from 'lucide-react';

interface HistoryViewProps {
  sessions: Session[];
  onDeleteSession: (sessionId: string) => void;
}

export function HistoryView({ sessions, onDeleteSession }: HistoryViewProps) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  useEffect(() => {
    // Stop playing when session changes
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, [selectedSession]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEvolutionIcon = (evolucion: string) => {
    switch (evolucion) {
      case 'mejoró': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'empeoró': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      'ansiedad': 'bg-orange-100 text-orange-600',
      'calma': 'bg-blue-100 text-blue-600',
      'tristeza': 'bg-indigo-100 text-indigo-600',
      'alegría': 'bg-yellow-100 text-yellow-600',
      'enojo': 'bg-red-100 text-red-600',
      'frustración': 'bg-pink-100 text-pink-600'
    };
    return colors[emotion.toLowerCase()] || 'bg-gray-100 text-gray-600';
  };

  const handlePlayConversation = () => {
    if (!selectedSession?.conversacion || selectedSession.conversacion.length === 0) {
      alert('No hay conversación disponible para esta sesión');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const conversacion = selectedSession.conversacion;
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
    if (!selectedSession?.conversacion || selectedSession.conversacion.length === 0) {
      alert('No hay transcripción disponible para esta sesión');
      return;
    }
    setShowTranscription(true);
  };

  if (selectedSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setSelectedSession(null)}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            ← Volver
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
              <h1 className="text-2xl mb-2">Sesión Detallada</h1>
              <div className="flex items-center gap-4 text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedSession.fecha_hora)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedSession.duracion_minutos} min</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Emotional Analysis */}
              <div>
                <h2 className="text-lg mb-4">😰 Análisis Emocional</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Estado predominante:</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm capitalize ${getEmotionColor(selectedSession.analisis_emocional.emocion_predominante)}`}>
                      {selectedSession.analisis_emocional.emocion_predominante}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Intensidad promedio:</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-full"
                          style={{ width: `${selectedSession.analisis_emocional.intensidad_promedio * 10}%` }}
                        />
                      </div>
                      <span className="text-sm">{selectedSession.analisis_emocional.intensidad_promedio}/10</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Evolución:</p>
                    <div className="flex items-center gap-2">
                      {getEvolutionIcon(selectedSession.analisis_emocional.evolucion)}
                      <span className="capitalize">{selectedSession.analisis_emocional.evolucion}</span>
                    </div>
                  </div>

                  {selectedSession.analisis_emocional.top_4_emociones.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Top emociones:</p>
                      <div className="space-y-2">
                        {selectedSession.analisis_emocional.top_4_emociones.map((emocion, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-sm w-4">{index + 1}.</span>
                            <span className="capitalize flex-1">{emocion.emocion}</span>
                            <span className="text-sm text-gray-600">({emocion.porcentaje}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Exercises */}
              {selectedSession.ejercicios_realizados.length > 0 && (
                <div>
                  <h2 className="text-lg mb-4">🧘 Ejercicios Realizados</h2>
                  <div className="space-y-2">
                    {selectedSession.ejercicios_realizados.map((ejercicio, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{ejercicio}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Feedback */}
              {selectedSession.feedback_usuario.calificacion_estrellas > 0 && (
                <div>
                  <h2 className="text-lg mb-4">💭 Tu Valoración</h2>
                  <div className="flex items-center gap-4">
                    {selectedSession.feedback_usuario.estado_emocional_final && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Estado final:</p>
                        <span className="text-3xl">{selectedSession.feedback_usuario.estado_emocional_final}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Calificación:</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            className={star <= selectedSession.feedback_usuario.calificacion_estrellas ? 'text-yellow-400' : 'text-gray-300'}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 border-t space-y-3">
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
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Transcripción</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Eliminar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <h3 className="text-xl mb-4">⚠ Eliminar Sesión</h3>
                <p className="text-gray-700 mb-6">
                  ¿Estás seguro de que quieres eliminar esta sesión? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      onDeleteSession(selectedSession.id);
                      setShowDeleteConfirm(false);
                      setSelectedSession(null);
                    }}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    ❌ Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transcription Modal */}
          {showTranscription && selectedSession?.conversacion && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b">
                  <h3 className="text-xl mb-2">📝 Transcripción de la Sesión</h3>
                  <p className="text-sm text-gray-600">{formatDate(selectedSession.fecha_hora)}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {selectedSession.conversacion.map((msg, index) => (
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

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl mb-2">📊 Historial de Sesiones</h1>
        <p className="text-gray-600 text-sm">
          {sessions.length} {sessions.length === 1 ? 'sesión registrada' : 'sesiones registradas'}
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-600 mb-2">No tienes sesiones registradas</p>
          <p className="text-sm text-gray-500">Inicia tu primera sesión para comenzar tu viaje de bienestar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div
              key={session.id}
              className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedSession(session)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(session.fecha_hora)}</span>
                    <span>•</span>
                    <Clock className="w-4 h-4" />
                    <span>{session.duracion_minutos} min</span>
                  </div>
                  {session.analisis_emocional.emocion_predominante && (
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm capitalize ${getEmotionColor(session.analisis_emocional.emocion_predominante)}`}>
                        {session.analisis_emocional.emocion_predominante}
                      </span>
                      <div className="flex items-center gap-1">
                        {getEvolutionIcon(session.analisis_emocional.evolucion)}
                        <span className="text-sm text-gray-600 capitalize">{session.analisis_emocional.evolucion}</span>
                      </div>
                    </div>
                  )}
                </div>
                {session.feedback_usuario.estado_emocional_final && (
                  <span className="text-3xl">{session.feedback_usuario.estado_emocional_final}</span>
                )}
              </div>
              <button className="text-sm text-purple-600 hover:underline">
                Ver detalles &gt;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}