import { useState, useEffect } from 'react';
import { DashboardView } from './components/DashboardView';
import { SessionView } from './components/SessionView';
import { SessionSummary } from './components/SessionSummary';
import { TasksView } from './components/TasksView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { DisclaimerModal } from './components/DisclaimerModal';
import { LoginView } from './components/LoginView';
import { Home, CheckSquare, BarChart3, Settings, MessageCircle } from 'lucide-react';
import { Session, Task } from './types';
import { useTranslation } from './TranslationContext';
import { useAuth } from './AuthContext';
import { API_URL } from './config';

type View = 'dashboard' | 'tasks' | 'history' | 'settings' | 'session' | 'summary';

export default function App() {
  const { t } = useTranslation();
  const { isAuthenticated, user, token } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionToSummarize, setSessionToSummarize] = useState<Session | null>(null);

  // Load user-specific data when user changes
  useEffect(() => {
    if (!user || !token) {
      // Clear data when user logs out
      setSessions([]);
      setTasks([]);
      setTotalPoints(0);
      setCurrentStreak(0);
      return;
    }

    // Check if first time user
    const hasSeenDisclaimer = localStorage.getItem(`hasSeenDisclaimer_${user.id}`);
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }

    fetchData();
  }, [user, token]);

  const fetchData = async () => {
    if (!token) return;

    try {
      // Fetch sessions
      const sessionsRes = await fetch(`${API_URL}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData);
        calculateStreak(sessionsData);
      }

      // Fetch tasks
      const tasksRes = await fetch(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
        calculatePoints(tasksData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const calculatePoints = (tasksData: Task[]) => {
    const points = tasksData
      .filter(t => t.estado === 'completada')
      .reduce((acc, t) => acc + t.puntos, 0);
    setTotalPoints(points);
  };

  const calculateStreak = (sessionsData: Session[]) => {
    // Simple streak calculation: consecutive days with sessions
    // This is a simplified version
    if (sessionsData.length === 0) {
      setCurrentStreak(0);
      return;
    }

    // Sort sessions by date desc
    const sortedSessions = [...sessionsData].sort((a, b) =>
      new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastDate = today;

    // Check if there is a session today
    const hasSessionToday = sortedSessions.some(s => {
      const d = new Date(s.fecha_hora);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (!hasSessionToday) {
      // If no session today, check yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      lastDate = yesterday;
    }

    // Logic to calculate streak would go here
    // For now, just count total sessions as a placeholder or keep it 0 if complex
    // Let's just use total sessions for now as a proxy or 0
    setCurrentStreak(sessionsData.length);
  };

  const handleDisclaimerAccept = () => {
    if (user) {
      localStorage.setItem(`hasSeenDisclaimer_${user.id}`, 'true');
    }
    setShowDisclaimer(false);
  };

  const handleStartSession = () => {
    const newSession: Session = {
      id: `temp-${Date.now()}`, // Temporary ID
      fecha_hora: new Date().toISOString(),
      momento_dia: getMomentOfDay(),
      duracion_minutos: 0,
      analisis_emocional: {
        emocion_predominante: '',
        intensidad_promedio: 0,
        evolucion: 'se mantuvo',
        top_4_emociones: []
      },
      ejercicios_realizados: [],
      feedback_usuario: {
        estado_emocional_final: '',
        calificacion_estrellas: 0
      },
      tareas_asignadas: []
    };
    setActiveSession(newSession);
    setCurrentView('session');
  };

  const handleEndSession = (session: Session) => {
    setSessionToSummarize(session);
    setActiveSession(null);
    setCurrentView('summary');
  };

  const handleSaveSession = async (session: Session) => {
    if (!token) return;

    try {
      // Prepare payload matching backend expectation
      const payload = {
        start_time: session.fecha_hora,
        duration_minutes: session.duracion_minutos,
        moment_of_day: session.momento_dia,
        emotional_analysis: session.analisis_emocional,
        exercises_completed: session.ejercicios_realizados,
        user_feedback: session.feedback_usuario,
        conversation_log: session.conversacion,
        tasks: session.tareas_asignadas?.map(t => ({
          title: t.titulo,
          description: t.descripcion,
          frequency: t.frecuencia,
          points: t.puntos
        }))
      };

      const response = await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedSession = await response.json();
        // Refresh data
        fetchData();
        setSessionToSummarize(null);
        setCurrentView('dashboard');
      } else {
        console.error('Error saving session');
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (response.ok) {
        // Optimistic update or refetch
        setTasks(prev => prev.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              estado: 'completada',
              fecha_completada: new Date().toISOString()
            };
          }
          return task;
        }));
        // Update points locally for immediate feedback
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          setTotalPoints(p => p + task.puntos);
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        // Tasks associated with session should be deleted by backend, so refetch tasks
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const getMomentOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'mañana';
    if (hour < 18) return 'tarde';
    return 'noche';
  };

  const pendingTasks = tasks.filter(t => t.estado === 'pendiente');

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <DisclaimerModal
        isOpen={showDisclaimer}
        onAccept={handleDisclaimerAccept}
      />

      {currentView === 'session' && activeSession && (
        <SessionView
          session={activeSession}
          onEndSession={handleEndSession}
        />
      )}

      {currentView === 'summary' && sessionToSummarize && (
        <SessionSummary
          session={sessionToSummarize}
          onSave={handleSaveSession}
          onDelete={() => {
            setSessionToSummarize(null);
            setCurrentView('dashboard');
          }}
        />
      )}

      {currentView !== 'session' && currentView !== 'summary' && (
        <div className="max-w-6xl mx-auto pb-24">
          {currentView === 'dashboard' && (
            <DashboardView
              sessions={sessions}
              pendingTasks={pendingTasks}
              totalPoints={totalPoints}
              currentStreak={currentStreak}
              onStartSession={handleStartSession}
              onNavigateToTasks={() => setCurrentView('tasks')}
            />
          )}

          {currentView === 'tasks' && (
            <TasksView
              tasks={tasks}
              totalPoints={totalPoints}
              currentStreak={currentStreak}
              onCompleteTask={handleCompleteTask}
              sessions={sessions}
            />
          )}

          {currentView === 'history' && (
            <HistoryView
              sessions={sessions}
              onDeleteSession={handleDeleteSession}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              onClearAllData={() => {
                // Not implemented for backend yet, or could call a reset endpoint
                alert('Functionality not available with backend sync yet.');
              }}
            />
          )}

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="flex items-center justify-around">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${currentView === 'dashboard' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'
                    }`}
                >
                  <Home className="w-6 h-6" />
                  <span className="text-xs">{t.nav.home}</span>
                </button>

                <button
                  onClick={() => setCurrentView('tasks')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative ${currentView === 'tasks' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'
                    }`}
                >
                  <CheckSquare className="w-6 h-6" />
                  <span className="text-xs">{t.nav.tasks}</span>
                  {pendingTasks.length > 0 && (
                    <span className="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingTasks.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleStartSession}
                  className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 -mt-8"
                >
                  <MessageCircle className="w-8 h-8" />
                </button>

                <button
                  onClick={() => setCurrentView('history')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${currentView === 'history' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'
                    }`}
                >
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-xs">{t.nav.history}</span>
                </button>

                <button
                  onClick={() => setCurrentView('settings')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${currentView === 'settings' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'
                    }`}
                >
                  <Settings className="w-6 h-6" />
                  <span className="text-xs">{t.nav.settings}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
