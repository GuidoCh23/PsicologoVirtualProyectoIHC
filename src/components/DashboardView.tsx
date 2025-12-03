import { Session, Task } from '../types';
import { Trophy, Flame, Gem, ArrowRight, Clock } from 'lucide-react';
import { useTranslation } from '../TranslationContext';
import { useAuth } from '../AuthContext';

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
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const lastSession = sessions[0];

  const getLevel = (points: number) => {
    if (language === 'es') {
      if (points < 200) return 'Aprendiz';
      if (points < 500) return 'Practicante';
      if (points < 1000) return 'Avanzado';
      return 'Maestro';
    } else {
      if (points < 200) return 'Apprentice';
      if (points < 500) return 'Practitioner';
      if (points < 1000) return 'Advanced';
      return 'Master';
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (language === 'es') {
      if (diffMins < 60) return `Hace ${diffMins} minutos`;
      if (diffHours < 24) return `Hace ${diffHours} horas`;
      return `Hace ${diffDays} días`;
    } else {
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      return `${diffDays} days ago`;
    }
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

  // Get user's display name based on preference
  const getUserDisplayName = () => {
    if (user?.preferencia_nombre === 'nombre') {
      return user.nombre;
    } else if (user?.preferencia_nombre === 'apodo' && user.apodo) {
      return user.apodo;
    }
    return ''; // Don't show name if preference is 'ninguno'
  };

  const displayName = getUserDisplayName();
  const welcomeMessage = displayName
    ? (language === 'es' ? `👋 Bienvenido ${displayName}` : `👋 Welcome ${displayName}`)
    : t.dashboard.title;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl mb-2">{welcomeMessage}</h1>
        <p className="text-gray-600">{t.dashboard.subtitle}</p>
      </div>

      {/* Progress Stats */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-lg mb-4 opacity-90">📊 {language === 'es' ? 'TU PROGRESO' : 'YOUR PROGRESS'}</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Gem className="w-5 h-5" />
              <span className="text-sm opacity-90">{t.dashboard.stats.totalPoints}</span>
            </div>
            <p className="text-2xl">{totalPoints}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5" />
              <span className="text-sm opacity-90">{t.dashboard.stats.currentStreak}</span>
            </div>
            <p className="text-2xl">{currentStreak} {t.dashboard.stats.days}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5" />
              <span className="text-sm opacity-90">{language === 'es' ? 'Nivel' : 'Level'}</span>
            </div>
            <p className="text-lg">{getLevel(totalPoints)}</p>
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">✅ {t.dashboard.pendingTasks}</h2>
            <button
              onClick={onNavigateToTasks}
              className="text-purple-600 text-sm flex items-center gap-1 hover:gap-2 transition-all"
            >
              {t.dashboard.viewAllTasks}
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
                <span className="text-sm text-purple-600">⭐ {task.puntos} {t.tasks.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Session */}
      {lastSession && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg mb-4">🗓 {t.dashboard.recentSessions}</h2>
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
                  {lastSession.analisis_emocional.evolucion === 'mejoró' ? t.history.improved :
                   lastSession.analisis_emocional.evolucion === 'empeoró' ? t.history.worsened :
                   t.history.stayedSame}
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
        💬 {t.nav.startSession}
      </button>
    </div>
  );
}
