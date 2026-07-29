import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Check if authenticated user has the 'admin' role
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      status: 'fail',
      message: 'Access denied. Admin privileges required.',
    });
  }
};