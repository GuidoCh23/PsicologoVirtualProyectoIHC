import prisma from '../prisma.js';
export const getTasks = async (req, res) => {
    try {
        const userId = req.user.userId;
        const tasks = await prisma.task.findMany({
            where: { user_id: userId },
            orderBy: { assigned_date: 'desc' }
        });
        const mappedTasks = tasks.map(task => ({
            id: task.id,
            sesion_origen: task.session_id,
            fecha_asignada: task.assigned_date,
            fecha_vencimiento: task.due_date,
            titulo: task.title,
            descripcion: task.description,
            frecuencia: task.frequency,
            puntos: task.points,
            estado: task.status === 'pending' ? 'pendiente' : 'completada',
            fecha_completada: task.completed_date
        }));
        res.json(mappedTasks);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching tasks' });
    }
};
export const updateTaskStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { status } = req.body; // 'pending' | 'completed'
        if (!id) {
            return res.status(400).json({ message: 'Task ID required' });
        }
        const task = await prisma.task.findFirst({
            where: { id: id, user_id: userId }
        });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const updatedTask = await prisma.task.update({
            where: { id: id },
            data: {
                status,
                completed_date: status === 'completed' ? new Date() : null
            }
        });
        const mappedTask = {
            id: updatedTask.id,
            sesion_origen: updatedTask.session_id,
            fecha_asignada: updatedTask.assigned_date,
            fecha_vencimiento: updatedTask.due_date,
            titulo: updatedTask.title,
            descripcion: updatedTask.description,
            frecuencia: updatedTask.frequency,
            puntos: updatedTask.points,
            estado: updatedTask.status === 'pending' ? 'pendiente' : 'completada',
            fecha_completada: updatedTask.completed_date
        };
        res.json(mappedTask);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating task' });
    }
};
//# sourceMappingURL=taskController.js.map