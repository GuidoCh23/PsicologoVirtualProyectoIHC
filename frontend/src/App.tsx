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
import { sessionAPI, taskAPI, userAPI } from './services/apiService';

type View = 'dashboard' | 'tasks' | 'history' | 'settings' | 'session' | 'summary';

export default function App() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionToSummarize, setSessionToSummarize] = useState<Session | null>(null);

  useEffect(() => {
    // Check if first time user
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }

    // Load data from backend API if authenticated
    if (isAuthenticated) {
      loadDataFromAPI();
    }
  }, [isAuthenticated]);

  const loadDataFromAPI = async () => {
    try {
      // Load sessions
      const sessionsResponse = await sessionAPI.getSessions();
      setSessions(sessionsResponse.sessions || []);

      // Load tasks
      const tasksResponse = await taskAPI.getTasks();
      setTasks(tasksResponse.tasks || []);

      // Load user statistics
      const statsResponse = await userAPI.getStatistics();
      setTotalPoints(statsResponse.statistics?.totalPoints || 0);
      setCurrentStreak(statsResponse.statistics?.currentStreak || 0);
    } catch (error) {
      console.error('Error loading data from API:', error);
      // Keep empty state if API fails
    }
  };

  const handleDisclaimerAccept = () => {
    localStorage.setItem('hasSeenDisclaimer', 'true');
    setShowDisclaimer(false);
  };

  const handleStartSession = () => {
    const newSession: Session = {
      id: `S${Date.now()}`,
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
    try {
      // Map momento_dia to backend format
      const momentoDiaMap: Record<string, 'manana' | 'tarde' | 'noche'> = {
        'mañana': 'manana',
        'tarde': 'tarde',
        'noche': 'noche'
      };

      // Map evolucion to backend format
      const evolucionMap: Record<string, 'mejoro' | 'empeoro' | 'se_mantuvo'> = {
        'mejoró': 'mejoro',
        'empeoró': 'empeoro',
        'se mantuvo': 'se_mantuvo'
      };

      // Create session in backend
      const sessionData = {
        momento_dia: momentoDiaMap[session.momento_dia] || 'tarde',
        duracion_minutos: session.duracion_minutos,
        emocion_predominante: session.analisis_emocional.emocion_predominante,
        intensidad_promedio: session.analisis_emocional.intensidad_promedio,
        evolucion: evolucionMap[session.analisis_emocional.evolucion] || 'se_mantuvo',
        top_emociones: session.analisis_emocional.top_4_emociones,
        ejercicios_realizados: session.ejercicios_realizados,
        estado_emocional_final: session.feedback_usuario.estado_emocional_final,
        calificacion_estrellas: session.feedback_usuario.calificacion_estrellas,
        conversacion: session.conversacion || [],
        tareas_asignadas: session.tareas_asignadas?.map(t => ({
          titulo: t.titulo,
          descripcion: t.descripcion,
          frecuencia: t.frecuencia || 'única',
          puntos: t.puntos
        }))
      };

      const response = await sessionAPI.createSession(sessionData);

      // Reload data from API to get the new session and tasks
      await loadDataFromAPI();

      setSessionToSummarize(null);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error saving session:', error);
      // Fallback to local state update if API fails
      setSessions(prev => [session, ...prev]);
      setSessionToSummarize(null);
      setCurrentView('dashboard');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await taskAPI.completeTask(taskId);

      // Reload data from API to get updated tasks and points
      await loadDataFromAPI();
    } catch (error) {
      console.error('Error completing task:', error);
      // Fallback to local state update if API fails
      setTasks(prev => prev.map(task => {
        if (task.id === taskId && task.estado === 'pendiente') {
          setTotalPoints(p => p + task.puntos);
          return {
            ...task,
            estado: 'completada',
            fecha_completada: new Date().toISOString()
          };
        }
        return task;
      }));
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await sessionAPI.deleteSession(sessionId);

      // Reload data from API
      await loadDataFromAPI();
    } catch (error) {
      console.error('Error deleting session:', error);
      // Fallback to local state update if API fails
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setTasks(prev => prev.filter(t => t.sesion_origen !== sessionId));
    }
  };

  const getMomentOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'mañana';
    if (hour < 18) return 'tarde';
    return 'noche';
  };

  const pendingTasks = tasks.filter(t => t.estado === 'pendiente');
  const completedTasks = tasks.filter(t => t.estado === 'completada');

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
              onClearAllData={async () => {
                try {
                  // Delete all sessions (which cascades to tasks in backend)
                  const sessionsToDelete = [...sessions];
                  for (const session of sessionsToDelete) {
                    await sessionAPI.deleteSession(session.id);
                  }

                  // Clear local state
                  setSessions([]);
                  setTasks([]);
                  setTotalPoints(0);
                  setCurrentStreak(0);

                  // Reload from API to confirm
                  await loadDataFromAPI();
                } catch (error) {
                  console.error('Error clearing data:', error);
                  // Fallback to local clear
                  setSessions([]);
                  setTasks([]);
                  setTotalPoints(0);
                  setCurrentStreak(0);
                }
              }}
            />
          )}

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="flex items-center justify-around">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'dashboard' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'
                  }`}
                >
                  <Home className="w-6 h-6" />
                  <span className="text-xs">{t.nav.home}</span>
                </button>

                <button
                  onClick={() => setCurrentView('tasks')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative ${
                    currentView === 'tasks' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'
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
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'history' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'
                  }`}
                >
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-xs">{t.nav.history}</span>
                </button>

                <button
                  onClick={() => setCurrentView('settings')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'settings' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'
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
