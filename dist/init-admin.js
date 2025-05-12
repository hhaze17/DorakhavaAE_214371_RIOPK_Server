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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("./models/User"));
dotenv_1.default.config();
// Функция для инициализации базы данных с администратором
const initAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Connecting to database...");
        const mongoUri = process.env.MONGODB_URL || "mongodb://localhost:27017/warehouse2";
        mongoose_1.default.set("strictQuery", false);
        yield mongoose_1.default.connect(mongoUri);
        console.log("MongoDB Connected Successfully");
        // Проверка наличия администратора
        const adminExists = yield User_1.default.findOne({ username: "admin" });
        if (adminExists) {
            console.log("Администратор уже существует в базе данных.");
        }
        else {
            // Хешируем пароль
            const passwordHash = yield bcryptjs_1.default.hash("123456", 10);
            // Создаем пользователя-администратора
            const admin = yield User_1.default.create({
                username: "admin",
                password: passwordHash,
                firstName: "Администратор",
                lastName: "Системы",
                email: "admin@warehouse.com",
                levelOfAccess: "Administrator",
                address: "ул. Ленина 123, Минск",
                birthDate: new Date(1990, 0, 1),
                contactNumber: "+375291234567",
                store: "Центральный Склад",
                isActive: true
            });
            console.log("Администратор успешно создан:", admin.username);
        }
        console.log("Инициализация завершена");
        process.exit(0);
    }
    catch (error) {
        console.error("Ошибка при инициализации базы данных:", error);
        process.exit(1);
    }
});
// Запуск функции инициализации
initAdmin();
