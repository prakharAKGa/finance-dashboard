const bcrypt = require('bcryptjs');
const { PrismaClient, Role } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const analystPassword = await bcrypt.hash('Analyst@1234', 12);

  await prisma.user.upsert({
    where: { email: 'admin@finance.com' },
    update: {
      name: 'Admin User',
      role: Role.ADMIN,
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: 'Admin User',
      email: 'admin@finance.com',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'analyst@finance.com' },
    update: {
      name: 'Analyst User',
      role: Role.ANALYST,
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: 'Analyst User',
      email: 'analyst@finance.com',
      password: analystPassword,
      role: Role.ANALYST,
      isActive: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
