import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';


export interface AuthRequest extends Request {
  user?: any; }

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token;

  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      
      token = req.headers.authorization.split(' ')[1];

     
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as {
        id: string;
      };

     
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401).json({ status: 'fail', message: 'User not found' });
        return;
      }

      next(); 
    } catch (error) {
      res.status(401).json({
        status: 'fail',
        message: 'Not authorized, token failed or expired',
      });
      return;
    }
  }

  if (!token) {
    res.status(401).json({
      status: 'fail',
      message: 'Not authorized, no token provided',
    });
  }
};