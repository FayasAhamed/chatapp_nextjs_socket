import { PrismaClient } from '../app/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  // Check if system user already exists
  const existing = await prisma.user.findUnique({
    where: { email: 'system' },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        id: 'system',
        name: 'System',
        email: 'system',
      },
    });
    console.log('System user created.');
  } else {
    console.log('ℹSystem user already exists.');
  }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(() => prisma.$disconnect());
