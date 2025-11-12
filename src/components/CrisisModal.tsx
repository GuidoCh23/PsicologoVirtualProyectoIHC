import { Phone, AlertTriangle, Heart } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl text-red-600">🚨 AYUDA PROFESIONAL NECESARIA</h2>
        </div>

        <p className="text-gray-700 mb-6">
          He notado que podrías estar en una situación que requiere atención profesional inmediata.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 space-y-3">
          <p className="text-red-900">Por favor, contacta a:</p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-800">
              <Phone className="w-5 h-5" />
              <div>
                <p>Emergencias: 105 / 106 / 107</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-red-800">
              <Phone className="w-5 h-5" />
              <div>
                <p>Línea de Crisis: 0800-00-959</p>
                <p className="text-sm">(Prevención del Suicidio - Perú)</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-red-800">
              <Heart className="w-5 h-5" />
              <p>Centro de salud más cercano</p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-600 mb-6">
          💚 Tu bienestar es lo más importante
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continuar con cuidado
          </button>
          <a
            href="tel:0800-00-959"
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center"
          >
            Llamar Ahora
          </a>
        </div>
      </div>
    </div>
  );
}
