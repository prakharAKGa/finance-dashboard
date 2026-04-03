import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export const listAll = catchAsync(async (req, res) => {
  const users = await userService.findAll();
  res.json(ApiResponse.success(users));
});

export const update = catchAsync(async (req, res) => {
  const user = await userService.update(req.params.id as string, req.body);
  res.json(ApiResponse.success(user, 'User updated successfully'));
});

export const remove = catchAsync(async (req, res) => {
  await userService.softDelete(req.params.id as string);
  res.json(ApiResponse.success(null, 'User deleted successfully'));
});
