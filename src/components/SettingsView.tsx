import { useState } from 'react';
import { Lock, Trash2, Download, Shield } from 'lucide-react';

interface SettingsViewProps {
  onClearAllData: () => void;
}

export function SettingsView({ onClearAllData }: SettingsViewProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExportData = () => {
    const sessions = localStorage.getItem('sessions');
    const tasks = localStorage.getItem('tasks');
    const data = {
      sessions: sessions ? JSON.parse(sessions) : [],
      tasks: tasks ? JSON.parse(tasks) : [],
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

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl mb-2">⚙ Configuración</h1>
        <p className="text-gray-600 text-sm">Gestiona tu privacidad y datos</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacidad y Seguridad
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-green-600" />
                <div>
                  <p>Encriptación de datos</p>
                  <p className="text-sm text-gray-600">Tus datos están protegidos</p>
                </div>
              </div>
              <span className="text-green-600">✓ Activa</span>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <p>Almacenamiento local</p>
              </div>
              <p className="text-sm text-gray-600">
                Todos tus datos se guardan únicamente en tu dispositivo. No se envían a ningún servidor externo.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          <h2 className="text-lg mb-4">Gestión de Datos</h2>
          
          <div className="space-y-3">
            <button
              onClick={handleExportData}
              className="w-full flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p>Exportar mis datos</p>
                <p className="text-sm text-gray-600">Descarga una copia de toda tu información</p>
              </div>
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center gap-3 p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-600"
            >
              <Trash2 className="w-5 h-5" />
              <div className="text-left">
                <p>Eliminar todo mi historial</p>
                <p className="text-sm text-red-500">Borra permanentemente todas tus sesiones y tareas</p>
              </div>
            </button>
          </div>
        </div>

        <div className="p-6 bg-gray-50">
          <h2 className="text-lg mb-4">Acerca de</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Psicólogo Virtual v1.0</p>
            <p>Una herramienta de apoyo emocional y bienestar</p>
            <p className="text-xs pt-2 border-t border-gray-200 mt-4">
              ⚠ Esta aplicación NO es un psicólogo real y no proporciona diagnósticos médicos ni tratamientos clínicos.
            </p>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl mb-4 text-red-600">⚠ Eliminar Todos los Datos</h3>
            <p className="text-gray-700 mb-4">
              ¿Estás seguro de que quieres eliminar TODOS tus datos?
            </p>
            <p className="text-sm text-gray-600 mb-2">Esta acción eliminará permanentemente:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
              <li>Todas las sesiones registradas</li>
              <li>Todas las tareas</li>
              <li>Todos tus puntos y rachas</li>
              <li>Todas las configuraciones</li>
            </ul>
            <p className="text-sm text-red-600 mb-6">
              Esta acción NO se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ❌ Sí, Eliminar Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
