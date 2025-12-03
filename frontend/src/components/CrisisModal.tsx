import { Phone, AlertTriangle, Heart } from 'lucide-react';
import { useTranslation } from '../TranslationContext';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  const { t, language } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl text-red-600">{t.crisis.title}</h2>
        </div>

        <p className="text-gray-700 mb-6">
          {t.crisis.description}
        </p>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 space-y-3">
          <p className="text-red-900">{language === 'es' ? 'Por favor, contacta a:' : 'Please contact:'}</p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-800">
              <Phone className="w-5 h-5" />
              <div>
                <p>{language === 'es' ? 'Emergencias: 105 / 106 / 107' : 'Emergencies: 105 / 106 / 107'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-red-800">
              <Phone className="w-5 h-5" />
              <div>
                <p>{t.crisis.emergencyLine}: 0800-00-959</p>
                <p className="text-sm">{t.crisis.lineDescription}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-red-800">
              <Heart className="w-5 h-5" />
              <p>{language === 'es' ? 'Centro de salud más cercano' : 'Nearest health center'}</p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-600 mb-6">
          {language === 'es' ? '💚 Tu bienestar es lo más importante' : '💚 Your well-being is the most important thing'}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {language === 'es' ? 'Continuar con cuidado' : 'Continue with care'}
          </button>
          <a
            href="tel:0800-00-959"
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center"
          >
            {language === 'es' ? 'Llamar Ahora' : 'Call Now'}
          </a>
        </div>
      </div>
    </div>
  );
}
