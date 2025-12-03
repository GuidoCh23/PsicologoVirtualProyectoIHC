import { useState } from 'react';
import { Task, Session } from '../types';
import { Gem, Flame, ArrowLeft, Calendar, Award } from 'lucide-react';
import { useTranslation } from '../TranslationContext';

interface TasksViewProps {
  tasks: Task[];
  totalPoints: number;
  currentStreak: number;
  onCompleteTask: (taskId: string) => void;
  sessions: Session[];
}

export function TasksView({ tasks, totalPoints, currentStreak, onCompleteTask, sessions }: TasksViewProps) {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [completedPoints, setCompletedPoints] = useState(0);

  const pendingTasks = tasks.filter(t => t.estado === 'pendiente');
  const completedTasks = tasks.filter(t => t.estado === 'completada');

  const handleCompleteTask = (task: Task) => {
    setCompletedPoints(task.puntos);
    setShowCompletionAnimation(true);
    onCompleteTask(task.id);
    
    setTimeout(() => {
      setShowCompletionAnimation(false);
      setSelectedTask(null);
    }, 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const locale = language === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short'
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSessionById = (sessionId: string) => {
    return sessions.find(s => s.id === sessionId);
  };

  if (selectedTask) {
    const session = getSessionById(selectedTask.sesion_origen);
    const isCompleted = selectedTask.estado === 'completada';

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setSelectedTask(null)}
            className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{language === 'es' ? 'Volver' : 'Back'}</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start gap-3 mb-6">
              {isCompleted ? (
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600">✓</span>
                </div>
              ) : (
                <div className="w-8 h-8 border-2 border-gray-300 rounded flex-shrink-0"></div>
              )}
              <h1 className="text-xl flex-1">{selectedTask.titulo}</h1>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-sm text-gray-600 mb-2">📝 {language === 'es' ? 'Descripción' : 'Description'}:</h2>
                <p className="text-gray-800">{selectedTask.descripcion}</p>
              </div>

              <div>
                <h2 className="text-sm text-gray-600 mb-3">📊 {language === 'es' ? 'Información' : 'Information'}:</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>{language === 'es' ? 'Puntos' : 'Points'}: {selectedTask.puntos}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{language === 'es' ? 'Asignada' : 'Assigned'}: {formatDate(selectedTask.fecha_asignada)}</span>
                  </div>
                  {isCompleted ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{language === 'es' ? 'Completada' : 'Completed'}: {selectedTask.fecha_completada ? formatDate(selectedTask.fecha_completada) : (language === 'es' ? 'Hoy' : 'Today')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span>{language === 'es' ? 'Vence' : 'Due'}: {formatDate(selectedTask.fecha_vencimiento)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span>🔄</span>
                    <span className="capitalize">{t.tasks.frequency}: {
                      selectedTask.frecuencia === 'diaria' ? t.tasks.daily :
                      selectedTask.frecuencia === 'semanal' ? t.tasks.weekly :
                      t.tasks.oneTime
                    }</span>
                  </div>
                </div>
              </div>

              {session && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h2 className="text-sm text-gray-600 mb-2">🗓 {language === 'es' ? 'De la sesión' : 'From session'}:</h2>
                  <p className="text-sm">
                    {language === 'es' ? 'Sesión' : 'Session'} - {formatDate(session.fecha_hora)}
                  </p>
                </div>
              )}
            </div>

            {!isCompleted && (
              <button
                onClick={() => handleCompleteTask(selectedTask)}
                className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                ✅ {t.tasks.markComplete}
              </button>
            )}
          </div>
        </div>

        {/* Completion Animation */}
        {showCompletionAnimation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center animate-scale-in">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl mb-2">{language === 'es' ? '¡Completada!' : 'Completed!'}</h2>
              <p className="text-3xl text-purple-600">+{completedPoints} {language === 'es' ? 'PUNTOS' : 'POINTS'}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl mb-4">{t.tasks.title}</h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Gem className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-700">{language === 'es' ? 'Puntos totales' : 'Total points'}</span>
            </div>
            <p className="text-2xl text-purple-600">{totalPoints}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-700">{language === 'es' ? 'Racha' : 'Streak'}</span>
            </div>
            <p className="text-2xl text-orange-600">{currentStreak} {language === 'es' ? 'días' : 'days'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 rounded-lg transition-colors ${
              activeTab === 'pending'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t.tasks.pending} ({pendingTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 rounded-lg transition-colors ${
              activeTab === 'completed'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t.tasks.completed} ({completedTasks.length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg px-2">
          {activeTab === 'pending' ? t.tasks.pending.toUpperCase() : t.tasks.completed.toUpperCase()}
        </h2>

        {activeTab === 'pending' && pendingTasks.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-gray-600">{language === 'es' ? '¡No tienes tareas pendientes!' : 'No pending tasks!'}</p>
            <p className="text-sm text-gray-500 mt-2">{t.tasks.completeSessionFirst}</p>
          </div>
        )}

        {activeTab === 'completed' && completedTasks.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-600">{t.tasks.noTasksYet}</p>
            <p className="text-sm text-gray-500 mt-2">{language === 'es' ? '¡Empieza a completar tus tareas para ganar puntos!' : 'Start completing your tasks to earn points!'}</p>
          </div>
        )}

        {(activeTab === 'pending' ? pendingTasks : completedTasks).map(task => {
          const daysUntil = getDaysUntil(task.fecha_vencimiento);

          return (
            <div
              key={task.id}
              className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex items-start gap-3 mb-3">
                {task.estado === 'completada' ? (
                  <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded flex-shrink-0 mt-1"></div>
                )}
                <div className="flex-1">
                  <h3 className="mb-2">{task.titulo}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-purple-600">⭐ {task.puntos} {t.tasks.points}</span>
                    {task.estado === 'pendiente' && (
                      <span className={`${daysUntil <= 2 ? 'text-red-600' : 'text-gray-600'}`}>
                        📅 {language === 'es' ? `Vence en ${daysUntil} días` : `Due in ${daysUntil} days`}
                      </span>
                    )}
                    {task.estado === 'completada' && (
                      <span className="text-green-600">
                        ✓ {task.fecha_completada ? formatDate(task.fecha_completada) : (language === 'es' ? 'Completada' : 'Completed')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button className="text-sm text-purple-600 hover:underline">
                {language === 'es' ? 'Ver más' : 'View more'} &gt;
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}