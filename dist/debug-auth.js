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
const User_1 = __importDefault(require("./models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
function debugAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Подключаемся к базе данных
            yield mongoose_1.default.connect('mongodb://localhost:27017/warehouse2');
            console.log("Connected to database");
            // Проверяем существующих пользователей
            const existingUsers = yield User_1.default.find().lean();
            console.log("Existing users:", JSON.stringify(existingUsers, null, 2));
            // Проверяем пользователя admin
            const adminUser = yield User_1.default.findOne({ username: "admin" }).lean();
            console.log("Admin user:", adminUser ? JSON.stringify(adminUser, null, 2) : "Not found");
            // Если admin пользователя нет или у него неправильные параметры, создаем нового
            if (!adminUser) {
                const passwordHash = yield bcrypt_1.default.hash("password123", 10);
                const newAdmin = new User_1.default({
                    username: "admin",
                    password: passwordHash,
                    name: "Administrator",
                    email: "admin@warehouse.com",
                    address: "123 Admin Street",
                    birthDate: new Date(1990, 0, 1),
                    contactNumber: "+1234567890",
                    levelOfAccess: "Administrator", // Изменено на Administrator
                    store: "Central Warehouse",
                    createdAt: new Date()
                });
                const savedAdmin = yield newAdmin.save();
                console.log("Created new admin user:", JSON.stringify(savedAdmin.toJSON(), null, 2));
            }
            else {
                // Обновляем уровень доступа для существующего пользователя
                if (adminUser.levelOfAccess !== "Administrator") {
                    const updatedAdmin = yield User_1.default.findByIdAndUpdate(adminUser._id, { levelOfAccess: "Administrator" }, { new: true });
                    console.log("Updated admin access level:", JSON.stringify(updatedAdmin === null || updatedAdmin === void 0 ? void 0 : updatedAdmin.toJSON(), null, 2));
                }
            }
            // Отключаемся от базы данных
            yield mongoose_1.default.disconnect();
            console.log("Disconnected from database");
        }
        catch (error) {
            console.error("Error:", error);
        }
    });
}
debugAuth();
