import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    type: z.enum(['INCOME', 'EXPENSE']),
    category: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    date: z.string().datetime(),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    amount: z.number().positive().optional(),
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    date: z.string().datetime().optional(),
  }),
});

export const listTransactionSchema = z.object({
  query: z.object({
    page:     z.string().optional().default('1'),
    limit:    z.string().optional().default('10'),
    type:     z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().optional(),
    search:   z.string().optional(),
    startDate: z.string().optional(),
    endDate:   z.string().optional(),
    sortBy:   z.enum(['date', 'amount', 'createdAt']).optional().default('date'),
    order:    z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
