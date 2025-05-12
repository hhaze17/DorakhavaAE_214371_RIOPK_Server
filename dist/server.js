"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
require("./index"); // Просто импортируем index.ts для выполнения его кода
dotenv_1.default.config();
// index.ts автоматически подключится к MongoDB и запустит сервер
// дополнительная логика не требуется
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
});
