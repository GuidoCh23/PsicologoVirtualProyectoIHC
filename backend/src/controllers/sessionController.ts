import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest, CreateSessionDTO } from '../types';

export class SessionController {
  // Create a new session
  async createSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const sessionData: CreateSessionDTO = req.body;

      // Create session (map from DTO to Prisma enum format)
      const momentoDiaMap: Record<string, any> = {
        'manana': 'manana',
        'tarde': 'tarde',
        'noche': 'noche'
      };

      const evolucionMap: Record<string, any> = {
        'mejoro': 'mejoro',
        'empeoro': 'empeoro',
        'se_mantuvo': 'se_mantuvo'
      };

      const session = await prisma.session.create({
        data: {
          userId: req.user.id,
          momento_dia: momentoDiaMap[sessionData.momento_dia],
          duracion_minutos: sessionData.duracion_minutos,
          emocion_predominante: sessionData.emocion_predominante,
          intensidad_promedio: sessionData.intensidad_promedio,
          evolucion: evolucionMap[sessionData.evolucion],
          top_emociones: sessionData.top_emociones,
          ejercicios_realizados: sessionData.ejercicios_realizados,
          estado_emocional_final: sessionData.estado_emocional_final,
          calificacion_estrellas: sessionData.calificacion_estrellas,
          conversacion: sessionData.conversacion,
        },
      });

      // Create tasks if provided
      if (sessionData.tareas_asignadas && sessionData.tareas_asignadas.length > 0) {
        const tasks = await Promise.all(
          sessionData.tareas_asignadas.map((tarea) =>
            prisma.task.create({
              data: {
                userId: req.user!.id,
                sesion_origen: session.id,
                titulo: tarea.titulo,
                descripcion: tarea.descripcion,
                frecuencia: tarea.frecuencia,
                puntos: tarea.puntos,
                fecha_vencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              },
            })
          )
        );

        res.status(201).json({ session, tasks });
      } else {
        res.status(201).json({ session });
      }
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  }

  // Get all sessions for current user
  async getSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const sessions = await prisma.session.findMany({
        where: { userId: req.user.id },
        orderBy: { fecha_hora: 'desc' },
        include: {
          tasks: true,
        },
      });

      res.json(sessions);
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: 'Failed to get sessions' });
    }
  }

  // Get a specific session by ID
  async getSessionById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;

      const session = await prisma.session.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          tasks: true,
        },
      });

      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      res.json(session);
    } catch (error) {
      console.error('Get session by ID error:', error);
      res.status(500).json({ error: 'Failed to get session' });
    }
  }

  // Delete a session
  async deleteSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;

      // Verify session belongs to user
      const session = await prisma.session.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      // Delete session (cascade will delete related tasks)
      await prisma.session.delete({
        where: { id },
      });

      res.json({ message: 'Session deleted successfully' });
    } catch (error) {
      console.error('Delete session error:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }

  // Get session statistics
  async getSessionStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const sessions = await prisma.session.findMany({
        where: { userId: req.user.id },
        select: {
          emocion_predominante: true,
          intensidad_promedio: true,
          duracion_minutos: true,
          calificacion_estrellas: true,
        },
      });

      if (sessions.length === 0) {
        res.json({
          totalSessions: 0,
          averageDuration: 0,
          averageIntensity: 0,
          averageRating: 0,
          emotionDistribution: {},
        });
        return;
      }

      const totalSessions = sessions.length;
      const averageDuration =
        sessions.reduce((sum, s) => sum + s.duracion_minutos, 0) / totalSessions;
      const averageIntensity =
        sessions.reduce((sum, s) => sum + s.intensidad_promedio, 0) / totalSessions;
      const averageRating =
        sessions.reduce((sum, s) => sum + s.calificacion_estrellas, 0) / totalSessions;

      // Count emotions
      const emotionCount: Record<string, number> = {};
      sessions.forEach((session) => {
        const emotion = session.emocion_predominante;
        emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
      });

      res.json({
        totalSessions,
        averageDuration: Math.round(averageDuration),
        averageIntensity: Math.round(averageIntensity * 10) / 10,
        averageRating: Math.round(averageRating * 10) / 10,
        emotionDistribution: emotionCount,
      });
    } catch (error) {
      console.error('Get session stats error:', error);
      res.status(500).json({ error: 'Failed to get session statistics' });
    }
  }
}

export default new SessionController();
