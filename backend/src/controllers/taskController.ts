import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest, CreateTaskDTO } from '../types';

export class TaskController {
  // Create a new task
  async createTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const taskData: CreateTaskDTO = req.body;

      const task = await prisma.task.create({
        data: {
          userId: req.user.id,
          sesion_origen: taskData.sesion_origen,
          titulo: taskData.titulo,
          descripcion: taskData.descripcion,
          frecuencia: taskData.frecuencia,
          puntos: taskData.puntos,
          fecha_vencimiento: new Date(taskData.fecha_vencimiento),
        },
      });

      res.status(201).json(task);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  // Get all tasks for current user
  async getTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { status } = req.query;

      const where: any = { userId: req.user.id };
      if (status === 'pending' || status === 'completed') {
        where.estado = status === 'pending' ? 'pendiente' : 'completada';
      }

      const tasks = await prisma.task.findMany({
        where,
        orderBy: { fecha_asignada: 'desc' },
        include: {
          session: {
            select: {
              fecha_hora: true,
              emocion_predominante: true,
            },
          },
        },
      });

      res.json(tasks);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }

  // Get a specific task by ID
  async getTaskById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;

      const task = await prisma.task.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
        include: {
          session: true,
        },
      });

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.json(task);
    } catch (error) {
      console.error('Get task by ID error:', error);
      res.status(500).json({ error: 'Failed to get task' });
    }
  }

  // Complete a task
  async completeTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;

      // Verify task belongs to user and is pending
      const task = await prisma.task.findFirst({
        where: {
          id,
          userId: req.user.id,
          estado: 'pendiente',
        },
      });

      if (!task) {
        res.status(404).json({ error: 'Task not found or already completed' });
        return;
      }

      // Mark task as completed
      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          estado: 'completada',
          fecha_completada: new Date(),
        },
      });

      res.json(updatedTask);
    } catch (error) {
      console.error('Complete task error:', error);
      res.status(500).json({ error: 'Failed to complete task' });
    }
  }

  // Delete a task
  async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;

      // Verify task belongs to user
      const task = await prisma.task.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      await prisma.task.delete({
        where: { id },
      });

      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }

  // Get pending tasks count
  async getPendingCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const count = await prisma.task.count({
        where: {
          userId: req.user.id,
          estado: 'pendiente',
        },
      });

      res.json({ count });
    } catch (error) {
      console.error('Get pending count error:', error);
      res.status(500).json({ error: 'Failed to get pending count' });
    }
  }
}

export default new TaskController();
