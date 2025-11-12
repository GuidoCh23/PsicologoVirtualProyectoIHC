import { useState, useEffect } from 'react';
import { Wind, X } from 'lucide-react';

interface BreathingExerciseProps {
  onComplete: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest';

export function BreathingExercise({ onComplete }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<Phase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [cycle, setCycle] = useState(1);
  const [isActive, setIsActive] = useState(false);

  // Breathing pattern 4-7-8
  const phaseDurations: Record<Phase, number> = {
    inhale: 4,
    hold: 7,
    exhale: 8,
    rest: 2
  };

  const phaseMessages: Record<Phase, string> = {
    inhale: 'Inhala profundamente por la nariz',
    hold: 'Mantén el aire',
    exhale: 'Exhala lentamente por la boca',
    rest: 'Descansa'
  };

  const phaseColors: Record<Phase, string> = {
    inhale: 'from-blue-500 to-cyan-500',
    hold: 'from-purple-500 to-pink-500',
    exhale: 'from-green-500 to-emerald-500',
    rest: 'from-gray-400 to-gray-500'
  };

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Move to next phase
          const phases: Phase[] = ['inhale', 'hold', 'exhale', 'rest'];
          const currentIndex = phases.indexOf(phase);
          const nextPhase = phases[(currentIndex + 1) % phases.length];
          
          if (nextPhase === 'inhale') {
            setCycle(prev => prev + 1);
          }
          
          setPhase(nextPhase);
          return phaseDurations[nextPhase];
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  useEffect(() => {
    if (cycle > 3 && phase === 'rest') {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [cycle, phase]);

  const handleStart = () => {
    setIsActive(true);
    setCountdown(phaseDurations.inhale);
  };

  const handleSkip = () => {
    onComplete();
  };

  const getCircleScale = () => {
    const progress = (phaseDurations[phase] - countdown) / phaseDurations[phase];
    
    switch (phase) {
      case 'inhale':
        return 0.5 + (progress * 0.5); // Scale from 0.5 to 1
      case 'hold':
        return 1; // Stay at full size
      case 'exhale':
        return 1 - (progress * 0.5); // Scale from 1 to 0.5
      case 'rest':
        return 0.5; // Stay small
      default:
        return 0.5;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-6 relative">
      {/* Close button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
          <Wind className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl text-white mb-2">Respiración 4-7-8</h1>
        <p className="text-white/80 text-sm">
          {cycle <= 3 ? `Ciclo ${cycle} de 3` : '¡Completado!'}
        </p>
      </div>

      {/* Breathing Circle */}
      <div className="relative mb-12">
        <div 
          className={`w-64 h-64 rounded-full bg-gradient-to-br ${phaseColors[phase]} flex items-center justify-center transition-all duration-1000`}
          style={{
            transform: `scale(${getCircleScale()})`,
            boxShadow: `0 0 ${60 * getCircleScale()}px rgba(255, 255, 255, 0.3)`
          }}
        >
          <div className="text-center text-white">
            <div className="text-7xl mb-2">{countdown}</div>
            <div className="text-sm opacity-90">segundos</div>
          </div>
        </div>
      </div>

      {/* Phase Instruction */}
      <div className="text-center mb-8">
        <p className="text-2xl text-white mb-4 capitalize">{phaseMessages[phase]}</p>
        {!isActive && (
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-white text-purple-900 rounded-xl hover:bg-purple-50 transition-colors text-lg"
          >
            Comenzar Ejercicio
          </button>
        )}
      </div>

      {/* Progress */}
      {isActive && (
        <div className="w-full max-w-md">
          <div className="flex justify-between mb-2 text-white/60 text-sm">
            <span>Progreso</span>
            <span>{Math.min(cycle, 3)}/3 ciclos</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/60 transition-all duration-300"
              style={{ width: `${(Math.min(cycle - 1, 3) / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isActive && (
        <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
          <h3 className="mb-3">¿Cómo funciona?</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>🔵 <strong>Inhala</strong> por la nariz durante 4 segundos</li>
            <li>🟣 <strong>Mantén</strong> la respiración por 7 segundos</li>
            <li>🟢 <strong>Exhala</strong> por la boca durante 8 segundos</li>
            <li>⚪ <strong>Descansa</strong> 2 segundos antes del siguiente ciclo</li>
          </ul>
          <p className="text-xs text-white/60 mt-4">
            Este ejercicio ayuda a reducir la ansiedad y promover la relajación
          </p>
        </div>
      )}
    </div>
  );
}
