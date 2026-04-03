import { Prisma, TransactionType } from '@prisma/client';
import { prisma } from './prisma';

export class DashboardService {
  private buildWhere(userId?: string): Prisma.TransactionWhereInput {
    return {
      deletedAt: null,
      ...(userId ? { userId } : {}),
    };
  }

  async getSummary(userId?: string) {
    const where = this.buildWhere(userId);
    const [income, expense, recentTransactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.INCOME },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.EXPENSE },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);

    const totalIncome = income._sum.amount ?? 0;
    const totalExpense = expense._sum.amount ?? 0;

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      recentTransactions,
    };
  }

  async getCategoryBreakdown(userId?: string) {
    const rows = await prisma.transaction.groupBy({
      by: ['category', 'type'],
      where: this.buildWhere(userId),
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { category: 'asc' },
    });

    return rows.map((row) => ({
      category: row.category,
      type: row.type,
      total: row._sum.amount ?? 0,
      count: row._count._all,
    }));
  }

  async getMonthlyTrend(userId?: string, months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const data = await prisma.transaction.findMany({
      where: {
        ...this.buildWhere(userId),
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    const monthly: Record<string, { income: number; expense: number }> = {};
    data.forEach((tx) => {
      const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[key]) monthly[key] = { income: 0, expense: 0 };
      const amount = tx.amount;
      if (tx.type === TransactionType.INCOME) monthly[key].income += amount;
      else monthly[key].expense += amount;
    });

    return Object.entries(monthly).map(([month, values]) => ({
      month,
      ...values,
      net: values.income - values.expense,
    }));
  }

  async getRecentTransactions(userId?: string, take = 5) {
    return prisma.transaction.findMany({
      where: this.buildWhere(userId),
      orderBy: { date: 'desc' },
      take,
    });
  }
}

export const dashboardService = new DashboardService();
