import React, { useState, useEffect } from 'react';
import { Lock, Trash2, Download, Upload, Shield, Mic, Globe, MessageSquare, LogOut } from 'lucide-react';
import { useTranslation } from '../TranslationContext';
import { useAuth } from '../AuthContext';

interface SettingsViewProps {
  onClearAllData: () => void;
}

interface Settings {
  voiceGender: 'male' | 'female';
  appLanguage: 'es' | 'en';
  assistantLanguage: 'es' | 'en';
}

export function SettingsView({ onClearAllData }: SettingsViewProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { t, setLanguage, language } = useTranslation();
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    voiceGender: 'male',
    appLanguage: 'es',
    assistantLanguage: 'es'
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));

    // If changing app language, update translation context
    if (key === 'appLanguage') {
      setLanguage(value as 'es' | 'en');
    }
  };

  const handleExportData = () => {
    const sessions = localStorage.getItem('sessions');
    const tasks = localStorage.getItem('tasks');
    const totalPoints = localStorage.getItem('totalPoints');
    const currentStreak = localStorage.getItem('currentStreak');
    const data = {
      sessions: sessions ? JSON.parse(sessions) : [],
      tasks: tasks ? JSON.parse(tasks) : [],
      totalPoints: totalPoints ? parseInt(totalPoints) : 0,
      currentStreak: currentStreak ? parseInt(currentStreak) : 0,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psicologo-virtual-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          // Validate data structure
          if (!data.sessions || !data.tasks) {
            alert('Archivo inválido. Asegúrate de importar un archivo exportado desde esta aplicación.');
            return;
          }

          // Import data to localStorage
          localStorage.setItem('sessions', JSON.stringify(data.sessions));
          localStorage.setItem('tasks', JSON.stringify(data.tasks));

          if (data.totalPoints !== undefined) {
            localStorage.setItem('totalPoints', data.totalPoints.toString());
          }

          if (data.currentStreak !== undefined) {
            localStorage.setItem('currentStreak', data.currentStreak.toString());
          }

          alert('¡Datos importados exitosamente! Recarga la página para ver los cambios.');
          window.location.reload();
        } catch (error) {
          alert('Error al importar el archivo. Asegúrate de que sea un archivo JSON válido.');
          console.error('Import error:', error);
        }
      };

      reader.readAsText(file);
    };

    input.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl mb-2">{t.settings.title}</h1>
        <p className="text-gray-600 text-sm">{t.settings.subtitle}</p>
      </div>

      {/* User Account Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg mb-4">{language === 'es' ? 'Mi Cuenta' : 'My Account'}</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xl">
                  {user?.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user?.nombre}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span>{language === 'es' ? 'Cerrar Sesión' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t.settings.privacySecurity}
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-green-600" />
                <div>
                  <p>{t.settings.dataEncryption}</p>
                  <p className="text-sm text-gray-600">{t.settings.dataProtected}</p>
                </div>
              </div>
              <span className="text-green-600">✓ {t.settings.active}</span>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <p>{t.settings.secureStorage}</p>
              </div>
              <p className="text-sm text-gray-600">
                {t.settings.storageDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          <h2 className="text-lg mb-4">{t.settings.dataManagement}</h2>

          <div className="space-y-3">
            <button
              onClick={handleExportData}
              className="w-full flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p>{t.settings.exportData}</p>
                <p className="text-sm text-gray-600">{t.settings.exportDescription}</p>
              </div>
            </button>

            <button
              onClick={handleImportData}
              className="w-full flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p>{t.settings.importData}</p>
                <p className="text-sm text-gray-600">{t.settings.importDescription}</p>
              </div>
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center gap-3 p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-600"
            >
              <Trash2 className="w-5 h-5" />
              <div className="text-left">
                <p>{t.settings.deleteAllHistory}</p>
                <p className="text-sm text-red-500">{t.settings.deleteDescription}</p>
              </div>
            </button>
          </div>
        </div>

        <div className="p-6 border-b">
          <h2 className="text-lg mb-4">{t.settings.assistantConfig}</h2>

          <div className="space-y-4">
            {/* Voice Gender */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Mic className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">{t.settings.voiceGender}</p>
                  <p className="text-sm text-gray-600">{t.settings.voiceGenderDescription}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSetting('voiceGender', 'male')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    settings.voiceGender === 'male'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👨 {t.settings.male}
                </button>
                <button
                  onClick={() => updateSetting('voiceGender', 'female')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    settings.voiceGender === 'female'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👩 {t.settings.female}
                </button>
              </div>
            </div>

            {/* App Language */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">{t.settings.appLanguage}</p>
                  <p className="text-sm text-gray-600">{t.settings.appLanguageDescription}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSetting('appLanguage', 'es')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    settings.appLanguage === 'es'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇪🇸 {t.settings.spanish}
                </button>
                <button
                  onClick={() => updateSetting('appLanguage', 'en')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    settings.appLanguage === 'en'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇺🇸 {t.settings.english}
                </button>
              </div>
            </div>

            {/* Assistant Language */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">{t.settings.assistantLanguage}</p>
                  <p className="text-sm text-gray-600">{t.settings.assistantLanguageDescription}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSetting('assistantLanguage', 'es')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    settings.assistantLanguage === 'es'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇪🇸 {t.settings.spanish}
                </button>
                <button
                  onClick={() => updateSetting('assistantLanguage', 'en')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    settings.assistantLanguage === 'en'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇺🇸 {t.settings.english}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50">
          <h2 className="text-lg mb-4">{t.settings.about}</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>{t.settings.appVersion}</p>
            <p>{t.settings.appDescription}</p>
            <p className="text-xs pt-2 border-t border-gray-200 mt-4">
              {t.settings.disclaimer}
            </p>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl mb-4 text-red-600">{t.settings.clearConfirm.title}</h3>
            <p className="text-gray-700 mb-4">
              {t.settings.clearConfirm.question}
            </p>
            <p className="text-sm text-gray-600 mb-2">{t.settings.clearConfirm.willDelete}</p>
            <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
              <li>{t.settings.clearConfirm.allSessions}</li>
              <li>{t.settings.clearConfirm.allTasks}</li>
              <li>{t.settings.clearConfirm.allPoints}</li>
              <li>{t.settings.clearConfirm.allSettings}</li>
            </ul>
            <p className="text-sm text-red-600 mb-6">
              {t.settings.clearConfirm.cannotUndo}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t.settings.clearConfirm.cancel}
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t.settings.clearConfirm.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
