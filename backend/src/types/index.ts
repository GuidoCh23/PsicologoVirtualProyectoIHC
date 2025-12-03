import { Request } from 'express';
import type { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User;
}

// Re-export User type for convenience
export type { User } from '@prisma/client';

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface RegisterDTO {
  nombre: string;
  email: string;
  password: string;
  apodo?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateSessionDTO {
  momento_dia: 'manana' | 'tarde' | 'noche';
  duracion_minutos: number;
  emocion_predominante: string;
  intensidad_promedio: number;
  evolucion: 'mejoro' | 'empeoro' | 'se_mantuvo';
  top_emociones: Array<{
    emocion: string;
    porcentaje: number;
  }>;
  ejercicios_realizados: string[];
  estado_emocional_final: string;
  calificacion_estrellas: number;
  conversacion: Array<{
    role: 'user' | 'assistant';
    text: string;
  }>;
  tareas_asignadas?: Array<{
    titulo: string;
    descripcion: string;
    frecuencia: string;
    puntos: number;
  }>;
}

export interface CreateTaskDTO {
  sesion_origen: string;
  fecha_vencimiento: string;
  titulo: string;
  descripcion: string;
  frecuencia: string;
  puntos: number;
}

export interface UpdateUserDTO {
  nombre?: string;
  email?: string;
  apodo?: string;
  foto_perfil?: string;
  preferencia_nombre?: 'nombre' | 'apodo' | 'ninguno';
  nombre_asistente?: string;
}

export interface AIMessageDTO {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}
