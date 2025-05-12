"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const middleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            const decoded = jsonwebtoken_1.default.verify(token, index_1.SECRET_KEY);
            console.log("Middleware: Token verified successfully", decoded);
            // Проверка наличия необходимых полей в токене
            if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
                console.error("Middleware: Malformed token payload", decoded);
                return res.status(401).json({ message: "Некорректный токен" });
            }
            // Установка decoded в req.user и req.body.decoded для совместимости
            req.token = decoded;
            req.body.decoded = decoded;
            next();
        }
        catch (jwtError) {
            console.error("Middleware: JWT verification error:", jwtError);
            if (jwtError instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return res.status(401).json({ message: "Токен истек" });
            }
            if (jwtError instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.status(401).json({ message: "Неверный токен" });
            }
            throw jwtError;
        }
    }
    catch (err) {
        console.error("Middleware: General error:", err);
        return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
});
exports.default = middleware;
