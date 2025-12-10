import { useState } from 'react';
import { Bot, Key, X } from 'lucide-react';

interface AIConfigModalProps {
  isOpen: boolean;
  onSave: (provider: string, apiKey: string) => void;
  onClose: () => void;
}

export function AIConfigModal({ isOpen, onSave, onClose }: AIConfigModalProps) {
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'gemini' | 'groq'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('Por favor ingresa una API Key válida');
      return;
    }
    onSave(provider, apiKey);
    onClose();
  };

  const providerInfo = {
    openai: {
      name: 'OpenAI (GPT-4o-mini)',
      link: 'https://platform.openai.com/api-keys',
      description: 'El más popular. Requiere tarjeta de crédito pero ofrece $5 gratis.',
      cost: '~$0.15 por 100 conversaciones'
    },
    anthropic: {
      name: 'Anthropic (Claude 3.5)',
      link: 'https://console.anthropic.com/settings/keys',
      description: 'Muy empático y natural. $5 gratis al registrarse.',
      cost: '~$0.30 por 100 conversaciones'
    },
    gemini: {
      name: 'Google Gemini',
      link: 'https://aistudio.google.com/app/apikey',
      description: '¡GRATIS! 1500 peticiones diarias sin costo.',
      cost: 'Gratis (recomendado para empezar)'
    },
    groq: {
      name: 'Groq (Llama 3.3)',
      link: 'https://console.groq.com/keys',
      description: '¡GRATIS! Muy rápido. Límite generoso diario.',
      cost: 'Gratis (más rápido que Gemini)'
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl">Configurar IA</h2>
              <p className="text-sm text-gray-600">Conecta tu asistente inteligente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block mb-3">Selecciona un proveedor de IA:</label>
            <div className="space-y-2">
              {(Object.keys(providerInfo) as Array<keyof typeof providerInfo>).map((key) => (
                <button
                  key={key}
                  onClick={() => setProvider(key)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    provider === key
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{providerInfo[key].name}</h3>
                        {(key === 'gemini' || key === 'groq') && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            GRATIS
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{providerInfo[key].description}</p>
                      <p className="text-xs text-gray-500">{providerInfo[key].cost}</p>
                    </div>
                    <input
                      type="radio"
                      checked={provider === key}
                      onChange={() => setProvider(key)}
                      className="mt-1"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className="block mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4" />
                <span>API Key de {providerInfo[provider].name}</span>
              </div>
            </label>
            
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingresa tu API Key aquí"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-20"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-purple-600 hover:text-purple-700"
              >
                {showKey ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            <a
              href={providerInfo[provider].link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mt-2"
            >
              → Obtener API Key de {providerInfo[provider].name.split('(')[0].trim()}
            </a>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 Cómo obtener tu API Key:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Haz clic en el enlace de arriba</li>
              <li>Crea una cuenta (si no tienes una)</li>
              <li>Ve a la sección de API Keys</li>
              <li>Crea una nueva API Key</li>
              <li>Cópiala y pégala aquí</li>
            </ol>
            <p className="text-xs text-blue-600 mt-3">
              💡 Recomendación: Usa Gemini o Groq si quieres empezar gratis
            </p>
          </div>

          {/* Privacy Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              🔒 <strong>Privacidad:</strong> Tu API Key se guarda solo en tu navegador (localStorage). 
              No se envía a ningún servidor externo, solo a la API del proveedor que elijas.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg"
          >
            Guardar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
