import { Role } from '@prisma/client';
import { Request } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

const isAdmin = (req: Request) => req.user!.role === Role.ADMIN;

export const getOverview = catchAsync(async (req, res) => {
  const result = await dashboardService.getSummary(
    isAdmin(req) ? undefined : req.user!.userId
  );
  res.json(ApiResponse.success(result));
});

export const getCategory = catchAsync(async (req, res) => {
  const result = await dashboardService.getCategoryBreakdown(
    isAdmin(req) ? undefined : req.user!.userId
  );
  res.json(ApiResponse.success(result));
});

export const getMonthly = catchAsync(async (req, res) => {
  const months = req.query.months ? parseInt(req.query.months as string, 10) : 6;
  const result = await dashboardService.getMonthlyTrend(
    isAdmin(req) ? undefined : req.user!.userId,
    months
  );
  res.json(ApiResponse.success(result));
});

export const getRecent = catchAsync(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
  const result = await dashboardService.getRecentTransactions(
    isAdmin(req) ? undefined : req.user!.userId,
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 5
  );
  res.json(ApiResponse.success(result));
});

export const getSummary = getOverview;
export const getCategories = getCategory;
export const getTrends = getMonthly;
