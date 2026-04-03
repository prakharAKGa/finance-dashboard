import { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';
import { Role } from '../services/mockDb';

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
  const result = await transactionService.findAll({
    page: parseInt(q.page, 10),
    limit: Math.min(parseInt(q.limit, 10), 100),
    type: q.type,
    category: q.category,
    search: q.search,
    startDate: q.startDate,
    endDate: q.endDate,
    sortBy: q.sortBy,
    order: q.order,
    userId: isAdmin(req) ? undefined : req.user!.userId,
  });
  res.json(ApiResponse.success(result.data, 'Transactions fetched', result.pagination));
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
