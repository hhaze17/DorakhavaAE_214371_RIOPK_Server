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
exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Генерация JWT токена
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};
// Регистрация пользователя
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, firstName, lastName, email, phone, levelOfAccess } = req.body;
        // Проверка существования пользователя
        const userExists = yield User_1.User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).json({ message: 'Пользователь уже существует' });
        }
        // Хеширование пароля
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Создание пользователя
        const user = yield User_1.User.create({
            username,
            password: hashedPassword,
            firstName,
            lastName,
            email,
            phone,
            levelOfAccess,
            isActive: true
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                levelOfAccess: user.levelOfAccess,
                token: generateToken(user._id)
            });
        }
        else {
            res.status(400).json({ message: 'Неверные данные пользователя' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.register = register;
// Вход в систему
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Поиск пользователя
        const user = yield User_1.User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }
        // Проверка пароля
        if (!user.password) {
            return res.status(401).json({ message: 'Учетная запись без пароля' });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }
        // Проверка активности пользователя
        if (!user.isActive) {
            return res.status(401).json({ message: 'Пользователь деактивирован' });
        }
        // Обновление времени последнего входа
        user.lastLogin = new Date();
        yield user.save();
        res.json({
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            levelOfAccess: user.levelOfAccess,
            token: generateToken(user._id)
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.login = login;
// Получение профиля пользователя
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.getProfile = getProfile;
// Обновление профиля пользователя
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        if (req.body.password) {
            const salt = yield bcryptjs_1.default.genSalt(10);
            user.password = yield bcryptjs_1.default.hash(req.body.password, salt);
        }
        const updatedUser = yield user.save();
        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            levelOfAccess: updatedUser.levelOfAccess,
            token: generateToken(updatedUser._id)
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.updateProfile = updateProfile;
// Смена пароля
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Требуется текущий и новый пароль' });
        }
        const user = yield User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        // Проверка текущего пароля
        if (!user.password) {
            return res.status(400).json({ message: 'Учетная запись без пароля' });
        }
        const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный текущий пароль' });
        }
        // Хеширование нового пароля
        const salt = yield bcryptjs_1.default.genSalt(10);
        user.password = yield bcryptjs_1.default.hash(newPassword, salt);
        yield user.save();
        res.json({ message: 'Пароль успешно изменен' });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
exports.changePassword = changePassword;
