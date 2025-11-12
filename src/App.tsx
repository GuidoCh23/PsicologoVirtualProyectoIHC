import { useState, useEffect } from 'react';
import { DashboardView } from './components/DashboardView';
import { SessionView } from './components/SessionView';
import { SessionSummary } from './components/SessionSummary';
import { TasksView } from './components/TasksView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { DisclaimerModal } from './components/DisclaimerModal';
import { Home, CheckSquare, BarChart3, Settings, MessageCircle } from 'lucide-react';
import { Session, Task } from './types';

type View = 'dashboard' | 'tasks' | 'history' | 'settings' | 'session' | 'summary';

export default function App() {
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

    // Load saved data
    const savedSessions = localStorage.getItem('sessions');
    const savedTasks = localStorage.getItem('tasks');
    const savedPoints = localStorage.getItem('totalPoints');
    const savedStreak = localStorage.getItem('currentStreak');

    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedPoints) setTotalPoints(parseInt(savedPoints));
    if (savedStreak) setCurrentStreak(parseInt(savedStreak));
  }, []);

  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('totalPoints', totalPoints.toString());
  }, [totalPoints]);

  useEffect(() => {
    localStorage.setItem('currentStreak', currentStreak.toString());
  }, [currentStreak]);

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

  const handleSaveSession = (session: Session) => {
    setSessions(prev => [session, ...prev]);
    
    // Add tasks from session
    if (session.tareas_asignadas && session.tareas_asignadas.length > 0) {
      const newTasks: Task[] = session.tareas_asignadas.map((tarea, index) => ({
        id: `T${Date.now()}-${index}`,
        sesion_origen: session.id,
        fecha_asignada: new Date().toISOString(),
        fecha_vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        frecuencia: tarea.frecuencia || 'única',
        puntos: tarea.puntos,
        estado: 'pendiente',
        fecha_completada: null
      }));
      setTasks(prev => [...newTasks, ...prev]);
    }

    setSessionToSummarize(null);
    setCurrentView('dashboard');
  };

  const handleCompleteTask = (taskId: string) => {
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
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setTasks(prev => prev.filter(t => t.sesion_origen !== sessionId));
  };

  const getMomentOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'mañana';
    if (hour < 18) return 'tarde';
    return 'noche';
  };

  const pendingTasks = tasks.filter(t => t.estado === 'pendiente');
  const completedTasks = tasks.filter(t => t.estado === 'completada');

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
                setSessions([]);
                setTasks([]);
                setTotalPoints(0);
                setCurrentStreak(0);
                localStorage.clear();
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
                  <span className="text-xs">Inicio</span>
                </button>

                <button
                  onClick={() => setCurrentView('tasks')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative ${
                    currentView === 'tasks' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'
                  }`}
                >
                  <CheckSquare className="w-6 h-6" />
                  <span className="text-xs">Tareas</span>
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
                  <span className="text-xs">Historial</span>
                </button>

                <button
                  onClick={() => setCurrentView('settings')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'settings' ? 'text-purple-600 bg-purple-50' : 'text-gray-600'
                  }`}
                >
                  <Settings className="w-6 h-6" />
                  <span className="text-xs">Ajustes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
