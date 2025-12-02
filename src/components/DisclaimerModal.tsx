import { AlertTriangle, Phone } from 'lucide-react';
import { useTranslation } from '../TranslationContext';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function DisclaimerModal({ isOpen, onAccept }: DisclaimerModalProps) {
  const { t, language } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl">{language === 'es' ? 'Información Importante' : 'Important Information'}</h2>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-700">
            {language === 'es'
              ? <>Este asistente <strong>NO es un psicólogo real</strong>. Es una herramienta de apoyo emocional para el bienestar general.</>
              : <>This assistant <strong>is NOT a real psychologist</strong>. It is an emotional support tool for general well-being.</>
            }
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900 mb-2">{language === 'es' ? '❌ NO proporciona:' : '❌ It does NOT provide:'}</p>
            <ul className="list-disc list-inside space-y-1 text-red-800 text-sm">
              <li>{language === 'es' ? 'Diagnósticos médicos' : 'Medical diagnoses'}</li>
              <li>{language === 'es' ? 'Tratamientos clínicos' : 'Clinical treatments'}</li>
              <li>{language === 'es' ? 'Prescripciones' : 'Prescriptions'}</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Phone className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-amber-900 mb-2">
                  {language === 'es' ? '⚠ Si experimentas crisis severa:' : '⚠ If you are experiencing a severe crisis:'}
                </p>
                <div className="space-y-1 text-amber-800 text-sm">
                  <p>{language === 'es' ? '📞 Línea de Prevención del Suicidio' : '📞 Suicide Prevention Hotline'}</p>
                  <p className="ml-6">{language === 'es' ? '(Perú): 0800-00-959' : '(Peru): 0800-00-959'}</p>
                  <p>{language === 'es' ? '📞 Emergencias: 105 / 106 / 107' : '📞 Emergencies: 105 / 106 / 107'}</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600">
            {language === 'es'
              ? 'Esta aplicación no está diseñada para recopilar información personal sensible (PII) ni para asegurar datos confidenciales.'
              : 'This application is not designed to collect sensitive personal information (PII) or to secure confidential data.'}
          </p>
        </div>

        <button
          onClick={onAccept}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:shadow-lg transition-all"
        >
          {t.disclaimer.understand}
        </button>
      </div>
    </div>
  );
}
