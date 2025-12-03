import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest, UpdateUserDTO } from '../types';

export class UserController {
  // Update user profile
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const updates: UpdateUserDTO = req.body;

      // Don't allow updating certain fields
      const allowedFields: (keyof UpdateUserDTO)[] = [
        'nombre',
        'apodo',
        'foto_perfil',
        'preferencia_nombre',
        'nombre_asistente',
      ];

      const filteredUpdates: any = {};
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: filteredUpdates,
      });

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // Get user statistics
  async getStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const [totalSessions, totalTasks, completedTasks] = await Promise.all([
        prisma.session.count({
          where: { userId: req.user.id },
        }),
        prisma.task.count({
          where: { userId: req.user.id },
        }),
        prisma.task.count({
          where: {
            userId: req.user.id,
            estado: 'completada',
          },
        }),
      ]);

      // Calculate total points
      const tasks = await prisma.task.findMany({
        where: {
          userId: req.user.id,
          estado: 'completada',
        },
        select: {
          puntos: true,
        },
      });

      const totalPoints = tasks.reduce((sum, task) => sum + task.puntos, 0);

      // Calculate current streak (simplified - consecutive days with completed tasks)
      const completedTasksWithDates = await prisma.task.findMany({
        where: {
          userId: req.user.id,
          estado: 'completada',
          fecha_completada: { not: null },
        },
        orderBy: {
          fecha_completada: 'desc',
        },
        select: {
          fecha_completada: true,
        },
      });

      let currentStreak = 0;
      if (completedTasksWithDates.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < completedTasksWithDates.length; i++) {
          const taskDate = new Date(completedTasksWithDates[i].fecha_completada!);
          taskDate.setHours(0, 0, 0, 0);

          const expectedDate = new Date(today);
          expectedDate.setDate(today.getDate() - i);

          if (taskDate.getTime() === expectedDate.getTime()) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      res.json({
        totalSessions,
        totalTasks,
        completedTasks,
        totalPoints,
        currentStreak,
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  }

  // Delete user account
  async deleteAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      // Delete user (cascade will delete sessions and tasks)
      await prisma.user.delete({
        where: { id: req.user.id },
      });

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  }
}

export default new UserController();
