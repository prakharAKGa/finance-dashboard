import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(ApiResponse.success(result, 'User registered'));
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(ApiResponse.success(result, 'Login successful'));
});

export const refresh = catchAsync(async (req, res) => {
  const tokens = await authService.refreshTokens(req.body.refreshToken);
  res.json(ApiResponse.success(tokens, 'Tokens refreshed'));
});

export const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user!.userId);
  res.json(ApiResponse.success(null, 'Logged out successfully'));
});

export const me = catchAsync(async (req, res) => {
  res.json(ApiResponse.success(req.user, 'Current user'));
});
