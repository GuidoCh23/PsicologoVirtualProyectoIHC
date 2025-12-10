import prisma from './src/prisma.js';
async function main() {
    console.log('--- Users ---');
    const users = await prisma.user.findMany();
    console.dir(users, { depth: null });
    console.log('\n--- Sessions ---');
    const sessions = await prisma.session.findMany({
        include: { tasks: true }
    });
    console.dir(sessions, { depth: null });
    console.log('\n--- Tasks ---');
    const tasks = await prisma.task.findMany();
    console.dir(tasks, { depth: null });
}
main()
    .catch(e => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=check_db.js.map