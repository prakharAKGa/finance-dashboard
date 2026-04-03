const bcrypt = require('bcryptjs');
const { PrismaClient, Role, TransactionType } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const analystPassword = await bcrypt.hash('Analyst@1234', 12);

  const adminUser = await prisma.user.upsert({
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

  const analystUser = await prisma.user.upsert({
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

  const categoryTemplates = [
    { category: 'Salary', type: TransactionType.INCOME, min: 2500, max: 6000 },
    { category: 'Freelance', type: TransactionType.INCOME, min: 400, max: 2200 },
    { category: 'Investment', type: TransactionType.INCOME, min: 100, max: 1200 },
    { category: 'Food', type: TransactionType.EXPENSE, min: 8, max: 90 },
    { category: 'Transport', type: TransactionType.EXPENSE, min: 5, max: 70 },
    { category: 'Entertainment', type: TransactionType.EXPENSE, min: 12, max: 180 },
    { category: 'Utilities', type: TransactionType.EXPENSE, min: 40, max: 250 },
    { category: 'Rent', type: TransactionType.EXPENSE, min: 800, max: 2200 },
    { category: 'Healthcare', type: TransactionType.EXPENSE, min: 20, max: 300 },
    { category: 'Shopping', type: TransactionType.EXPENSE, min: 15, max: 260 },
    { category: 'Education', type: TransactionType.EXPENSE, min: 20, max: 400 },
  ];

  const seededUsers = [adminUser, analystUser];

  for (const user of seededUsers) {
    // Keep seed idempotent by removing previously inserted sample rows.
    await prisma.transaction.deleteMany({
      where: {
        userId: user.id,
        description: {
          startsWith: '[SEED]',
        },
      },
    });
  }

  const randomAmount = (min, max) =>
    Number((Math.random() * (max - min) + min).toFixed(2));

  const transactionsToSeed = [];
  const now = new Date();

  for (const user of seededUsers) {
    categoryTemplates.forEach((template, categoryIndex) => {
      for (let i = 0; i < 3; i++) {
        const daysAgo = categoryIndex * 3 + i;
        const txDate = new Date(now);
        txDate.setDate(now.getDate() - daysAgo);

        transactionsToSeed.push({
          userId: user.id,
          amount: randomAmount(template.min, template.max),
          type: template.type,
          category: template.category,
          description: `[SEED] ${template.category} sample #${i + 1}`,
          date: txDate,
        });
      }
    });
  }

  await prisma.transaction.createMany({
    data: transactionsToSeed,
  });

  console.log(`Seeded ${transactionsToSeed.length} sample transactions across categories.`);
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
