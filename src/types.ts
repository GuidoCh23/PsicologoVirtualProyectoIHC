export interface Session {
  id: string;
  fecha_hora: string;
  momento_dia: 'mañana' | 'tarde' | 'noche';
  duracion_minutos: number;
  analisis_emocional: {
    emocion_predominante: string;
    intensidad_promedio: number;
    evolucion: 'mejoró' | 'empeoró' | 'se mantuvo';
    top_4_emociones: Array<{
      emocion: string;
      porcentaje: number;
    }>;
  };
  ejercicios_realizados: string[];
  feedback_usuario: {
    estado_emocional_final: string;
    calificacion_estrellas: number;
  };
  tareas_asignadas?: Array<{
    titulo: string;
    descripcion: string;
    frecuencia?: string;
    puntos: number;
  }>;
  conversacion?: Array<{
    role: 'user' | 'assistant';
    text: string;
  }>;
}

export interface Task {
  id: string;
  sesion_origen: string;
  fecha_asignada: string;
  fecha_vencimiento: string;
  titulo: string;
  descripcion: string;
  frecuencia: string;
  puntos: number;
  estado: 'pendiente' | 'completada';
  fecha_completada: string | null;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  fecha_registro: string;
  foto_perfil?: string;
}
