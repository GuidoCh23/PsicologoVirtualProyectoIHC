import { Session, Task } from '../types';
import { Trophy, Flame, Gem, ArrowRight, Clock } from 'lucide-react';

interface DashboardViewProps {
  sessions: Session[];
  pendingTasks: Task[];
  totalPoints: number;
  currentStreak: number;
  onStartSession: () => void;
  onNavigateToTasks: () => void;
}

export function DashboardView({ 
  sessions, 
  pendingTasks, 
  totalPoints, 
  currentStreak,
  onStartSession,
  onNavigateToTasks
}: DashboardViewProps) {
  const lastSession = sessions[0];

  const getLevel = (points: number) => {
    if (points < 200) return 'Aprendiz';
    if (points < 500) return 'Practicante';
    if (points < 1000) return 'Avanzado';
    return 'Maestro';
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    return `Hace ${diffDays} días`;
  };

  const getEmotionEmoji = (emotion: string) => {
    const map: Record<string, string> = {
      'ansiedad': '😰',
      'calma': '😌',
      'tristeza': '😢',
      'alegría': '😊',
      'enojo': '😠',
      'frustración': '😤',
      'esperanza': '🙂',
      'miedo': '😨',
      'preocupación': '😟'
    };
    return map[emotion.toLowerCase()] || '😐';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl mb-2">Hola, bienvenido de vuelta 👋</h1>
        <p className="text-gray-600">¿Cómo te sientes hoy?</p>
      </div>

      {/* Progress Stats */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-lg mb-4 opacity-90">📊 TU PROGRESO</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Gem className="w-5 h-5" />
              <span className="text-sm opacity-90">Puntos</span>
            </div>
            <p className="text-2xl">{totalPoints}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5" />
              <span className="text-sm opacity-90">Racha</span>
            </div>
            <p className="text-2xl">{currentStreak} días</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5" />
              <span className="text-sm opacity-90">Nivel</span>
            </div>
            <p className="text-lg">{getLevel(totalPoints)}</p>
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">✅ TAREAS PENDIENTES</h2>
            <button
              onClick={onNavigateToTasks}
              className="text-purple-600 text-sm flex items-center gap-1 hover:gap-2 transition-all"
            >
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {pendingTasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                <div className="flex-1">
                  <p className="text-sm">{task.titulo}</p>
                </div>
                <span className="text-sm text-purple-600">⭐ {task.puntos} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Session */}
      {lastSession && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg mb-4">🗓 ÚLTIMA SESIÓN</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{formatTimeAgo(lastSession.fecha_hora)}</span>
            </div>
            {lastSession.analisis_emocional.emocion_predominante && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getEmotionEmoji(lastSession.analisis_emocional.emocion_predominante)}</span>
                <span className="capitalize">{lastSession.analisis_emocional.emocion_predominante}</span>
                <span className="mx-2">→</span>
                <span className="text-2xl">{lastSession.feedback_usuario.estado_emocional_final}</span>
                <span className="capitalize">
                  {lastSession.analisis_emocional.evolucion === 'mejoró' ? 'Mejoró' : 
                   lastSession.analisis_emocional.evolucion === 'empeoró' ? 'Empeoró' : 
                   'Se mantuvo'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start Session Button */}
      <button
        onClick={onStartSession}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 text-lg"
      >
        💬 Iniciar Nueva Sesión
      </button>
    </div>
  );
}
