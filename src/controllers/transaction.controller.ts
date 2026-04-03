import { Role } from '@prisma/client';
import { Request } from 'express';
import { transactionService } from '../services/transaction.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

const isAdmin = (req: Request) => req.user!.role === Role.ADMIN;

export const create = catchAsync(async (req, res) => {
  const tx = await transactionService.create({
    ...req.body,
    userId: req.user!.userId,
  });
  res.status(201).json(ApiResponse.success(tx, 'Transaction created'));
});

export const list = catchAsync(async (req, res) => {
  const q = req.query as any;
  const page = Number.parseInt(q.page ?? '1', 10);
  const limit = Number.parseInt(q.limit ?? '10', 10);

  const result = await transactionService.findAll({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10,
    type: q.type,
    category: q.category,
    search: q.search,
    startDate: q.startDate,
    endDate: q.endDate,
    sortBy: q.sortBy || 'date',
    order: q.order || 'desc',
    userId: isAdmin(req) ? undefined : req.user!.userId,
  });
  res.json(ApiResponse.success(result.data, 'Transactions fetched', result.pagination));
});

export const exportData = catchAsync(async (req, res) => {
  const q = req.query as any;
  const csv = await transactionService.exportCsv({
    page: 1,
    limit: 100000,
    type: q.type,
    category: q.category,
    search: q.search,
    startDate: q.startDate,
    endDate: q.endDate,
    sortBy: q.sortBy || 'date',
    order: q.order || 'desc',
    userId: isAdmin(req) ? undefined : req.user!.userId,
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
  res.status(200).send(csv);
});

export const importData = catchAsync(async (req, res) => {
  const result = await transactionService.importBulk(
    req.body.transactions,
    req.user!.userId,
    isAdmin(req)
  );
  res.status(201).json(ApiResponse.success(result, 'Transactions imported'));
});

export const getOne = catchAsync(async (req, res) => {
  const tx = await transactionService.findById(
    req.params.id as string, req.user!.userId, isAdmin(req)
  );
  res.json(ApiResponse.success(tx));
});

export const update = catchAsync(async (req, res) => {
  const tx = await transactionService.update(
    req.params.id as string, req.body, req.user!.userId, isAdmin(req)
  );
  res.json(ApiResponse.success(tx, 'Transaction updated'));
});

export const remove = catchAsync(async (req, res) => {
  await transactionService.softDelete(
    req.params.id as string, req.user!.userId, isAdmin(req)
  );
  res.json(ApiResponse.success(null, 'Transaction deleted'));
});
