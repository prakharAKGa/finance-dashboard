import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';
import { Role } from '../services/mockDb';

const isAdmin = (req: Request) => req.user!.role === Role.ADMIN;

export const getSummary = catchAsync(async (req, res) => {
  const result = await dashboardService.getSummary(
    isAdmin(req) ? undefined : req.user!.userId
  );
  res.json(ApiResponse.success(result));
});

export const getCategories = catchAsync(async (req, res) => {
  const result = await dashboardService.getCategoryBreakdown(
    isAdmin(req) ? undefined : req.user!.userId
  );
  res.json(ApiResponse.success(result));
});

export const getTrends = catchAsync(async (req, res) => {
  const months = req.query.months ? parseInt(req.query.months as string, 10) : 6;
  const result = await dashboardService.getMonthlyTrend(
    isAdmin(req) ? undefined : req.user!.userId,
    months
  );
  res.json(ApiResponse.success(result));
});
