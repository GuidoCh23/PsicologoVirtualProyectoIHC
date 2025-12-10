import prisma from '../prisma.js';
import { Prisma } from '@prisma/client';
export const createSession = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { start_time, duration_minutes, moment_of_day, emotional_analysis, exercises_completed, user_feedback, conversation_log, tasks } = req.body;
        const sessionData = {
            user: { connect: { id: userId } },
            start_time: new Date(start_time),
            duration_minutes,
            moment_of_day,
            emotional_analysis: emotional_analysis ?? Prisma.JsonNull,
            exercises_completed: exercises_completed ?? Prisma.JsonNull,
            user_feedback: user_feedback ?? Prisma.JsonNull,
            conversation_log: conversation_log ?? Prisma.JsonNull,
        };
        if (tasks && Array.isArray(tasks) && tasks.length > 0) {
            sessionData.tasks = {
                create: tasks.map((task) => ({
                    user: { connect: { id: userId } },
                    title: task.title,
                    description: task.description,
                    frequency: task.frequency,
                    points: task.points,
                    status: 'pending',
                    assigned_date: new Date(),
                    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }))
            };
        }
        const session = await prisma.session.create({
            data: sessionData,
            include: {
                tasks: true
            }
        });
        res.status(201).json(session);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating session' });
    }
};
export const getSessions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const sessions = await prisma.session.findMany({
            where: { user_id: userId },
            orderBy: { start_time: 'desc' },
            include: { tasks: true }
        });
        const mappedSessions = sessions.map(session => ({
            id: session.id,
            fecha_hora: session.start_time,
            duracion_minutos: session.duration_minutes,
            momento_dia: session.moment_of_day === 'morning' ? 'mañana' :
                session.moment_of_day === 'afternoon' ? 'tarde' : 'noche',
            analisis_emocional: session.emotional_analysis,
            ejercicios_realizados: session.exercises_completed,
            feedback_usuario: session.user_feedback,
            conversacion: session.conversation_log,
            tareas_asignadas: session.tasks.map(task => ({
                titulo: task.title,
                descripcion: task.description,
                frecuencia: task.frequency,
                puntos: task.points
            }))
        }));
        res.json(mappedSessions);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching sessions' });
    }
};
export const deleteSession = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Session ID required' });
        }
        // Verify ownership
        const session = await prisma.session.findFirst({
            where: { id: id, user_id: userId }
        });
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        await prisma.task.deleteMany({
            where: { session_id: id }
        });
        await prisma.session.delete({
            where: { id: id }
        });
        res.json({ message: 'Session deleted' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting session' });
    }
};
//# sourceMappingURL=sessionController.js.map