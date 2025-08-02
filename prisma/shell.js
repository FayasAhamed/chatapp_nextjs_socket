// shell.js
import repl from 'repl';
import { PrismaClient } from '../app/generated/prisma/index.js'

const prisma = new PrismaClient();

// Start the REPL and expose the prisma client
const r = repl.start('prisma > ');
r.context.prisma = prisma;

// Optional: Add a cleanup function for when the REPL exits
r.on('exit', async () => {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
});