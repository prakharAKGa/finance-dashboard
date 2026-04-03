import { mockDb, TransactionType } from './mockDb';

export class DashboardService {
  async getSummary(userId?: string) {
    const { totalIncome, totalExpense, recentTransactions } = await mockDb.getAggregates({ userId });

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      recentTransactions,
    };
  }

  async getCategoryBreakdown(userId?: string) {
    const { data } = await mockDb.queryTransactions({ userId, limit: 1000 });
    
    const breakdown: Record<string, { total: number, count: number, type: string }> = {};

    data.forEach(t => {
      const key = `${t.category}-${t.type}`;
      if (!breakdown[key]) {
        breakdown[key] = { total: 0, count: 0, type: t.type };
      }
      breakdown[key].total += t.amount;
      breakdown[key].count += 1;
    });

    return Object.entries(breakdown).map(([key, val]) => ({
      category: key.split('-')[0],
      type: val.type,
      total: val.total,
      count: val.count
    }));
  }

  async getMonthlyTrend(userId?: string, months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data } = await mockDb.queryTransactions({ userId, startDate, limit: 1000 });

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
}

export const dashboardService = new DashboardService();
