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
dotenv_1.default.config();
const mongoUri = process.env.MONGODB_URL || "mongodb://localhost:27017/warehouse2";
// Определение схемы пользователя напрямую
const UserSchema = new mongoose_1.default.Schema({
    username: { type: String,  unique: true },
    password: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String,  unique: true },
    levelOfAccess: { type: String,  enum: ['Администратор', 'Сотрудник', 'Клиент'] },
    address: { type: String },
    birthDate: { type: Date },
    contactNumber: { type: String },
    store: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date }
}, {
    timestamps: true
});
// Создаем модель пользователя
const User = mongoose_1.default.model('User', UserSchema);
// Функция диагностики и исправления базы данных
const fixDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Connecting to database...");
        mongoose_1.default.set("strictQuery", false);
        yield mongoose_1.default.connect(mongoUri);
        console.log("MongoDB Connected Successfully");
        // Проверяем, какие коллекции есть в базе данных
        const collections = yield mongoose_1.default.connection.db.listCollections().toArray();
        console.log("Доступные коллекции:", collections.map(c => c.name));
        // Проверяем, есть ли коллекция пользователей
        const usersCollection = collections.find(c => c.name === 'users');
        if (usersCollection) {
            // Если коллекция существует, проверяем, есть ли администратор
            const users = yield mongoose_1.default.connection.db.collection('users').find({}).toArray();
            console.log("Найдено пользователей:", users.length);
            const admin = users.find(u => u.username === "admin");
            if (admin) {
                console.log("Администратор уже существует:", admin.username);
            }
            else {
                console.log("Администратора нет, создаем...");
                // Создаем нового администратора
                yield createAdmin();
            }
        }
        else {
            console.log("Коллекция пользователей не существует, создаем...");
            // Создаем администратора
            yield createAdmin();
        }
        console.log("Диагностика и исправление завершены");
        process.exit(0);
    }
    catch (error) {
        console.error("Ошибка при диагностике базы данных:", error);
        process.exit(1);
    }
});
// Функция создания администратора
const createAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Хешируем пароль
        const passwordHash = yield bcryptjs_1.default.hash("123456", 10);
        // Создаем пользователя-администратора
        const admin = yield User.create({
            username: "admin",
            password: passwordHash,
            firstName: "Администратор",
            lastName: "Системы",
            email: "admin@warehouse.com",
            levelOfAccess: "Администратор",
            address: "ул. Ленина 123, Минск",
            birthDate: new Date(1990, 0, 1),
            contactNumber: "+375291234567",
            store: "Центральный Склад",
            isActive: true
        });
        console.log("Администратор успешно создан:", admin.username);
        return admin;
    }
    catch (error) {
        console.error("Ошибка при создании администратора:", error);
        throw error;
    }
});
// Запуск функции диагностики
fixDatabase();
