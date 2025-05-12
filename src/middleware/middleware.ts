import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { SECRET_KEY } from "../index";
import { AuthRequest } from "../types";

const middleware = async (req: Request, res: Response, next: NextFunction) => {
  console.log("Middleware: Starting token validation");
  try {
    const authHeader = req.header("Authorization");
    console.log("Middleware: Auth header:", authHeader ? "Present" : "Missing");
    
    if (!authHeader) {
      console.log("Middleware: No auth header");
      return res.status(401).json({ message: "Отсутствует токен авторизации" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("Middleware: Invalid token format");
      return res.status(401).json({ message: "Неверный формат токена" });
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Middleware: Token extracted");

    if (!token) {
      console.log("Middleware: Empty token");
      return res.status(401).json({ message: "Отсутствует токен авторизации" });
    }

    try {
      console.log("Middleware: Verifying token");
      const decoded = jwt.verify(token, SECRET_KEY);
      console.log("Middleware: Token verified successfully", decoded);
      
      // Проверка наличия необходимых полей в токене
      if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
        console.error("Middleware: Malformed token payload", decoded);
        return res.status(401).json({ message: "Некорректный токен" });
      }
      
      // Установка decoded в req.user и req.body.decoded для совместимости
      (req as AuthRequest).token = decoded;
      req.body.decoded = decoded;
      next();
    } catch (jwtError) {
      console.error("Middleware: JWT verification error:", jwtError);
      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Токен истек" });
      }
      if (jwtError instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: "Неверный токен" });
      }
      throw jwtError;
    }
  } catch (err) {
    console.error("Middleware: General error:", err);
    return res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};

export default middleware;
