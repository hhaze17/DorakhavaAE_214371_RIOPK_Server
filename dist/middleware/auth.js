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
exports.checkRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const User_1 = __importDefault(require("../models/User"));
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Отсутствует токен авторизации' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, index_1.SECRET_KEY);
        const user = yield User_1.default.findById(decoded.id).select('-password');
        if (!user) {
            throw new Error('Пользователь не найден с предоставленным токеном');
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ message: 'Неверный токен авторизации' });
    }
});
exports.authMiddleware = authMiddleware;
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Пользователь не авторизован' });
        }
        if (!roles.includes(req.user.levelOfAccess)) {
            return res.status(403).json({ message: 'У вас нет доступа к этому ресурсу' });
        }
        next();
    };
};
exports.checkRole = checkRole;
