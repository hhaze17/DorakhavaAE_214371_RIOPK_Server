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
exports.SECRET_KEY = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Define and export JWT secret
exports.SECRET_KEY = process.env.JWT_SECRET || "warehouse_secret_key_20";
// MongoDB connection
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/warehouse2";
const PORT = process.env.PORT || 5000;
// Connect to MongoDB
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(MONGODB_URL);
        console.log("MongoDB подключена успешно ✅");
        return true;
    }
    catch (error) {
        console.error("Ошибка подключения к MongoDB:", error);
        return false;
    }
});
// Start the server only after database connection
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    // Initialize all models before importing app
    // This ensures models are registered before they are used
    require("./models/User");
    require("./models/ResetToken");
    require("./models/CreatePasswordToken");
    require("./models/Product");
    require("./models/Zone");
    require("./models/ProductMovement");
    require("./models/OnlineOrder");
    require("./models/Batch");
    require("./models/StoreInventory");
    require("./models/StoreIncomingProduct");
    require("./models/Sale");
    require("./models/ReturnedItem");
    require("./models/Purchase");
    require("./models/OutgoingProduct");
    require("./models/OrderProduct");
    require("./models/IncomingProduct");
    require("./models/Gallery");
    require("./models/DailyAttendance");
    require("./models/BarcodeGenerator");
    // Now import app after models are loaded
    const app = require("./app").default;
    app.listen(PORT, () => {
        console.log(`Сервер запущен на порту ${PORT} 🚀`);
    });
});
// Main execution
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connected = yield connectDB();
        if (connected) {
            yield startServer();
        }
        else {
            console.error("Не удалось запустить сервер из-за ошибки подключения к базе данных");
            process.exit(1);
        }
    }
    catch (error) {
        console.error("Непредвиденная ошибка при запуске:", error);
        process.exit(1);
    }
}))();
// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error("Необработанная ошибка:", err);
});
// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("Необработанное исключение:", err);
});
