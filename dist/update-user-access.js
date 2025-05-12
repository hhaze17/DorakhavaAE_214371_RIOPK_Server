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
function updateUserAccess() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Подключаемся к базе данных
            yield mongoose_1.default.connect('mongodb://localhost:27017/warehouse2');
            console.log("Connected to database");
            // Обновляем уровни доступа для существующих пользователей
            const highToAdmin = yield User_1.default.updateMany({ levelOfAccess: "high" }, { $set: { levelOfAccess: "Administrator" } });
            const mediumToEmployee = yield User_1.default.updateMany({ levelOfAccess: "medium" }, { $set: { levelOfAccess: "Employee" } });
            // Обновляем пользователей со стороной магазина на уровень Client
            const storeUsersToClient = yield User_1.default.updateMany({ store: { $ne: "Central Warehouse" }, levelOfAccess: { $ne: "Client" } }, { $set: { levelOfAccess: "Client" } });
            console.log(`Updated ${highToAdmin.modifiedCount} administrators`);
            console.log(`Updated ${mediumToEmployee.modifiedCount} employees`);
            console.log(`Updated ${storeUsersToClient.modifiedCount} clients`);
            // Проверяем пользователей после обновления
            const users = yield User_1.default.find().lean();
            console.log("Updated users:");
            users.forEach(user => {
                console.log(`${user.username}: ${user.levelOfAccess} (store: ${user.store})`);
            });
            yield mongoose_1.default.disconnect();
            console.log("Disconnected from database");
        }
        catch (error) {
            console.error("Error:", error);
        }
    });
}
updateUserAccess();
