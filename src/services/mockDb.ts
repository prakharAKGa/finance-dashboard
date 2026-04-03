import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export enum Role {
  VIEWER = 'VIEWER',
  ANALYST = 'ANALYST',
  ADMIN = 'ADMIN',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  isActive: boolean;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string | null;
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class MockDatabase {
  private users: User[] = [];
  private transactions: Transaction[] = [];

  constructor() {
    this.seed();
  }

  async seed() {
    const adminPassword = await bcrypt.hash('Admin@1234', 12);
    const analystPassword = await bcrypt.hash('Analyst@1234', 12);

    const admin: User = {
      id: uuidv4(),
      email: 'admin@finance.com',
      password: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      isActive: true,
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const analyst: User = {
      id: uuidv4(),
      email: 'analyst@finance.com',
      password: analystPassword,
      name: 'Analyst User',
      role: Role.ANALYST,
      isActive: true,
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    this.users.push(admin, analyst);

    // Initial transactions
    const categories = ['Food', 'Transport', 'Salary', 'Entertainment', 'Utilities'];
    for (let i = 0; i < 20; i++) {
      this.transactions.push({
        id: uuidv4(),
        amount: Math.floor(Math.random() * 5000) + 100,
        type: i % 3 === 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
        category: categories[i % categories.length],
        description: `Sample transaction #${i + 1}`,
        date: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000),
        userId: i % 2 === 0 ? admin.id : analyst.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }
  }

  // Users
  async findUserByEmail(email: string) {
    return this.users.find(u => u.email === email && !u.deletedAt) || null;
  }

  async findUserById(id: string) {
    return this.users.find(u => u.id === id && !u.deletedAt) || null;
  }

  async createUser(data: Partial<User>) {
    const user: User = {
      id: uuidv4(),
      email: data.email!,
      password: data.password!,
      name: data.name!,
      role: data.role || Role.VIEWER,
      isActive: true,
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>) {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...data, updatedAt: new Date() };
    return this.users[index];
  }

  async getAllUsers() {
    return this.users.filter(u => !u.deletedAt);
  }

  // Transactions
  async createTransaction(data: Partial<Transaction>) {
    const tx: Transaction = {
      id: uuidv4(),
      amount: data.amount!,
      type: data.type!,
      category: data.category!,
      description: data.description || null,
      date: new Date(data.date!),
      userId: data.userId!,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    this.transactions.push(tx);
    return tx;
  }

  async findTransactionById(id: string) {
    return this.transactions.find(t => t.id === id && !t.deletedAt) || null;
  }

  async updateTransaction(id: string, data: Partial<Transaction>) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.transactions[index] = { ...this.transactions[index], ...data, updatedAt: new Date() };
    return this.transactions[index];
  }

  async deleteTransaction(id: string) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.transactions[index].deletedAt = new Date();
    return true;
  }

  async queryTransactions(filters: any) {
    let results = this.transactions.filter(t => !t.deletedAt);

    if (filters.userId) results = results.filter(t => t.userId === filters.userId);
    if (filters.type) results = results.filter(t => t.type === filters.type);
    if (filters.category) {
      const cat = filters.category.toLowerCase();
      results = results.filter(t => t.category.toLowerCase().includes(cat));
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(t => 
        (t.description && t.description.toLowerCase().includes(s)) ||
        t.category.toLowerCase().includes(s)
      );
    }
    if (filters.startDate) results = results.filter(t => t.date >= new Date(filters.startDate));
    if (filters.endDate) results = results.filter(t => t.date <= new Date(filters.endDate));

    // Sort
    const sortBy = filters.sortBy || 'date';
    const order = filters.order || 'desc';
    results.sort((a: any, b: any) => {
      if (a[sortBy] < b[sortBy]) return order === 'asc' ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return order === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const total = results.length;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const start = (page - 1) * limit;
    const paginatedItems = results.slice(start, start + limit);

    return { data: paginatedItems, total };
  }

  async getAggregates(filters: any) {
    const results = this.transactions.filter(t => 
      !t.deletedAt && (!filters.userId || t.userId === filters.userId)
    );

    const income = results.filter(t => t.type === TransactionType.INCOME);
    const expense = results.filter(t => t.type === TransactionType.EXPENSE);

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expense.reduce((sum, t) => sum + t.amount, 0);

    const recent = [...results].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    return {
      totalIncome,
      totalExpense,
      incomeCount: income.length,
      expenseCount: expense.length,
      recentTransactions: recent
    };
  }
}

export const mockDb = new MockDatabase();
