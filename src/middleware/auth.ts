import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { SECRET_KEY } from '../index';
import { AuthRequest, UserInterface } from "../types";
import UserModel from "../models/User";

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserInterface;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const userId = req.header('X-User-ID');

  // If neither token nor user ID is present, return unauthorized
  if (!token && !userId) {
    return res.status(401).json({ message: 'Отсутствует токен авторизации или ID пользователя' });
  }

  try {
    if (token) {
      // Normal JWT authentication
      const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
      const user = await UserModel.findById(decoded.id).select('-password');

      if (!user) {
        throw new Error('Пользователь не найден с предоставленным токеном');
      }

      (req as AuthRequest).user = user;
    } else if (userId) {
      // Fallback to user ID from header
      const user = await UserModel.findById(userId).select('-password');
      
      if (!user) {
        throw new Error('Пользователь не найден с предоставленным ID');
      }

      (req as AuthRequest).user = user;
      console.log(`Authenticated user ${user.username} using X-User-ID header`);
    }
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    
    // If token verification failed but we have a user ID header, try to use it
    if (userId && !req.user) {
      try {
        const user = await UserModel.findById(userId).select('-password');
        if (user) {
          (req as AuthRequest).user = user;
          console.log(`Recovered authentication using X-User-ID header for user ${user.username}`);
          return next();
        }
      } catch (headerError) {
        console.error("Header auth recovery failed:", headerError);
      }
    }
    
    res.status(401).json({ message: 'Неверный токен авторизации' });
  }
};

export const checkRole = (roles: Array<'Администратор' | 'Сотрудник' | 'Клиент'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Пользователь не авторизован' });
    }

    if (!roles.includes(req.user.levelOfAccess as any)) {
      return res.status(403).json({ message: 'У вас нет доступа к этому ресурсу' });
    }
    next();
  };
}; 