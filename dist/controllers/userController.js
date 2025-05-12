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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUser = exports.createUser = exports.validateTokenController = exports.updateProfileController = exports.deleteUserController = exports.updateUserController = exports.getUserByIdController = exports.createUserController = exports.getAllUsersController = exports.getProfileController = exports.createPasswordController = exports.resetPasswordController = exports.forgotPasswordController = exports.signInController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const User_1 = __importDefault(require("../models/User"));
const ResetToken_1 = __importDefault(require("../models/ResetToken"));
const CreatePasswordToken_1 = __importDefault(require("../models/CreatePasswordToken"));
const signInController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        console.log(`Поиск пользователя: ${username}`);
        const existingUser = yield User_1.default.findOne({ username });
        if (!existingUser || !existingUser.password) {
            return res.status(404).json({ message: "Пользователь не существует или пароль не установлен" });
        }
        const comparedPassword = yield bcryptjs_1.default.compare(password, existingUser.password);
        if (!comparedPassword) {
            return res.status(400).json({ message: "Неверный пароль" });
        }
        const token = jsonwebtoken_1.default.sign({
            id: existingUser.id,
            username: existingUser.username,
            store: existingUser.store,
        }, index_1.SECRET_KEY, {
            expiresIn: "24h",
        });
        res.status(200).json({
            token,
            levelOfAccess: existingUser.levelOfAccess,
            message: "Вход выполнен успешно",
        });
    }
    catch (error) {
        console.error("Ошибка входа:", error);
        res.status(500).json({ message: "Что-то пошло не так" });
    }
});
exports.signInController = signInController;
const forgotPasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const existingEmail = yield User_1.default.findOne({ email });
        if (!existingEmail)
            return res.status(404).json({ message: "Email doesn't exist" });
        // res.status(200).json({ message: "Email verification sent to your email" }); // Commented out as it might be confusing for user
        const generatedToken = crypto_1.default.randomBytes(64);
        const convertTokenToHexString = generatedToken.toString("hex");
        const filePath = path_1.default.join(__dirname, "../emailTemplate/resetPassword.html");
        const source = fs_1.default.readFileSync(filePath, "utf-8").toString();
        const template = handlebars_1.default.compile(source);
        const replacements = {
            email: email,
            resetToken: convertTokenToHexString,
            resetLink: `${req.protocol}://${req.get('host')}/reset-password/${convertTokenToHexString}` // Added reset link
        };
        const htmlToSend = template(replacements);
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com", // Replace with your SMTP provider
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER, // Use environment variables
                pass: process.env.EMAIL_PASS, // Use environment variables
            },
        });
        yield transporter.sendMail({
            from: `"Your App Name" <${process.env.EMAIL_USER}>`, // Replace with your app name and email
            to: email,
            subject: "Сброс пароля",
            text: "Вы запросили сброс пароля. Перейдите по ссылке для сброса.",
            html: htmlToSend,
        });
        yield ResetToken_1.default.create({
            email,
            resetToken: convertTokenToHexString,
        });
        res.status(200).json({ message: "Письмо для сброса пароля отправлено на ваш email" }); // Confirmation message
    }
    catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({ message: "Что-то пошло не так при отправке email" });
    }
});
exports.forgotPasswordController = forgotPasswordController;
const resetPasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, confirmPassword, resetToken } = req.body;
    try {
        const existingToken = yield ResetToken_1.default.findOne({ resetToken });
        if (!existingToken) {
            return res.status(404).json({ message: "Токен недействителен или истек" });
        }
        const existingUser = yield User_1.default.findOne({ email: existingToken.email });
        if (!existingUser) {
            return res.status(404).json({ message: "Пользователь с этим email не найден" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Пароли не совпадают" });
        }
        existingUser.password = password; // Hashing is done by pre-save hook
        yield existingUser.save();
        yield ResetToken_1.default.deleteMany({ email: existingUser.email });
        res.status(200).json({ message: "Пароль успешно обновлен" });
    }
    catch (error) {
        return res.status(500).json({ message: "Что-то пошло не так при сбросе пароля" });
    }
});
exports.resetPasswordController = resetPasswordController;
const createPasswordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, confirmPassword, createPasswordToken } = req.body;
    try {
        const existingToken = yield CreatePasswordToken_1.default.findOne({
            createPasswordToken,
        });
        if (!existingToken) {
            return res.status(404).json({ message: "Токен недействителен или истек" });
        }
        const existingUser = yield User_1.default.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "Пользователь с этим email не найден" });
        }
        if (existingToken.email !== email) {
            return res.status(400).json({ message: "Неверный email для этого токена" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Пароли не совпадают" });
        }
        existingUser.password = password; // Hashing is done by pre-save hook
        yield existingUser.save();
        yield CreatePasswordToken_1.default.deleteMany({ email: existingUser.email });
        res.status(200).json({ message: "Пароль успешно создан" });
    }
    catch (error) {
        return res.status(500).json({ message: "Что-то пошло не так при создании пароля" });
    }
});
exports.createPasswordController = createPasswordController;
const getProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded } = req.body;
    try {
        console.log("getProfile: получен токен декодирован:", decoded);
        if (!decoded || !decoded.id) {
            console.error("getProfile: отсутствует ID в токене");
            return res.status(400).json({ message: "Неверный токен" });
        }
        console.log(`getProfile: ищу пользователя с ID ${decoded.id}`);
        const user = yield User_1.default.findById(decoded.id).select("-password");
        if (!user) {
            console.error("getProfile: пользователь не найден");
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        console.log("getProfile: пользователь найден, формирую данные");
        const userData = {
            _id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            address: user.address,
            birthDate: user.birthDate,
            contactNumber: user.contactNumber,
            levelOfAccess: user.levelOfAccess,
            store: user.store,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            fullName: `${user.firstName} ${user.lastName}`,
        };
        console.log("getProfile: успешно отправляю ответ");
        res.status(200).json(userData);
    }
    catch (error) {
        console.error("getProfile ошибка:", error);
        return res.status(500).json({ message: "Что-то пошло не так" });
    }
});
exports.getProfileController = getProfileController;
const getAllUsersController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ITEMS_PER_PAGE = 10;
        const page = parseInt(req.query.page) || 1;
        // Фильтруем только сотрудников
        const query = { levelOfAccess: "Сотрудник" };
        const skip = (page - 1) * ITEMS_PER_PAGE;
        const countPromise = User_1.default.countDocuments(query);
        const usersPromise = User_1.default.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(ITEMS_PER_PAGE)
            .skip(skip);
        const [count, filteredItems] = yield Promise.all([countPromise, usersPromise]);
        const pageCount = Math.ceil(count / ITEMS_PER_PAGE);
        res.json({
            pagination: {
                count,
                pageCount
            },
            filteredItems
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllUsersController = getAllUsersController;
const createUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, firstName, // Changed from name
    lastName, // Added
    email, address, birthDate, contactNumber, levelOfAccess, store, password, // Added for initial password creation
     } = req.body;
    try {
        const existingUsername = yield User_1.default.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Имя пользователя уже существует" });
        }
        const existingEmail = yield User_1.default.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email уже существует" });
        }
        if (contactNumber) { // Check if contactNumber is provided
            const existingContactNumber = yield User_1.default.findOne({ contactNumber });
            if (existingContactNumber) {
                return res.status(400).json({ message: "Контактный номер уже существует" });
            }
        }
        const newUser = new User_1.default({
            username,
            firstName,
            lastName,
            email,
            address,
            birthDate,
            contactNumber,
            levelOfAccess,
            store,
            password, // Password will be hashed by pre-save hook
        });
        yield newUser.save();
        // Send create password email if password was not provided initially
        if (!password) {
            const generatedToken = crypto_1.default.randomBytes(64).toString("hex");
            const filePath = path_1.default.join(__dirname, "../emailTemplate/createPassword.html");
            const source = fs_1.default.readFileSync(filePath, "utf-8").toString();
            const template = handlebars_1.default.compile(source);
            const replacements = {
                email: email,
                createPasswordToken: generatedToken,
                createLink: `${req.protocol}://${req.get('host')}/create-password/${generatedToken}`
            };
            const htmlToSend = template(replacements);
            const transporter = nodemailer_1.default.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            yield transporter.sendMail({
                from: `"Your App Name" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Создание пароля",
                text: "Пожалуйста, создайте пароль для вашего аккаунта.",
                html: htmlToSend,
            });
            yield CreatePasswordToken_1.default.create({
                email,
                createPasswordToken: generatedToken,
            });
            return res.status(201).json({ message: "Пользователь успешно создан. Письмо для создания пароля отправлено." });
        }
        res.status(201).json({ message: "Пользователь успешно создан." });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Что-то пошло не так при создании пользователя" });
    }
});
exports.createUserController = createUserController;
const getUserByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        const userData = {
            id: user._id,
            username: user.username,
            levelOfAccess: user.levelOfAccess,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            store: user.store,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        };
        res.json(userData);
    }
    catch (error) {
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.getUserByIdController = getUserByIdController;
const updateUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { username, firstName, lastName, address, contactNumber, store, levelOfAccess, isActive, } = req.body;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid ID" });
        const user = yield User_1.default.findById(id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        user.username = username || user.username;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.address = address || user.address;
        user.contactNumber = contactNumber || user.contactNumber;
        user.store = store || user.store;
        user.levelOfAccess = levelOfAccess || user.levelOfAccess;
        user.isActive = isActive;
        const updatedUser = yield user.save();
        const userData = {
            _id: updatedUser._id,
            username: updatedUser.username,
            name: updatedUser.name,
            email: updatedUser.email,
            address: updatedUser.address,
            contactNumber: updatedUser.contactNumber,
            levelOfAccess: updatedUser.levelOfAccess,
            store: updatedUser.store,
            isActive: updatedUser.isActive,
            fullName: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim(),
        };
        res.status(200).json(userData);
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.updateUserController = updateUserController;
const deleteUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: "Неверный ID пользователя" });
        }
        const deletedUser = yield User_1.default.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        return res.status(200).json({ message: "Пользователь успешно удален" }); // Changed to 200 for consistency
    }
    catch (error) {
        return res.status(500).json({ message: "Что-то пошло не так" });
    }
});
exports.deleteUserController = deleteUserController;
const updateProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { decoded, username, firstName, lastName, email, address, birthDate, contactNumber, store } = req.body; // Assuming decoded token from auth middleware
    try {
        const userToUpdate = yield User_1.default.findById(decoded.id);
        if (!userToUpdate) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        if (email && email !== userToUpdate.email) {
            const existingEmail = yield User_1.default.findOne({ email: email, _id: { $ne: decoded.id } });
            if (existingEmail) {
                return res.status(400).json({ message: "Email уже используется" });
            }
            userToUpdate.email = email;
            userToUpdate.username = username || email; // Update username if provided, else use email
        }
        if (contactNumber && contactNumber !== userToUpdate.contactNumber) {
            const existingContactNumber = yield User_1.default.findOne({ contactNumber: contactNumber, _id: { $ne: decoded.id } });
            if (existingContactNumber) {
                return res.status(400).json({ message: "Контактный номер уже используется" });
            }
            userToUpdate.contactNumber = contactNumber;
        }
        if (username && username !== userToUpdate.username && (!email || email === userToUpdate.email)) {
            // if username changes and email does not, or email is not provided
            const existingUsername = yield User_1.default.findOne({ username: username, _id: { $ne: decoded.id } });
            if (existingUsername) {
                return res.status(400).json({ message: "Имя пользователя уже используется" });
            }
            userToUpdate.username = username;
        }
        if (firstName)
            userToUpdate.firstName = firstName;
        if (lastName)
            userToUpdate.lastName = lastName;
        if (address)
            userToUpdate.address = address;
        if (birthDate)
            userToUpdate.birthDate = birthDate;
        if (store)
            userToUpdate.store = store;
        yield userToUpdate.save();
        return res.status(200).json({ message: "Профиль успешно обновлен" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Что-то пошло не так при обновлении профиля" });
    }
});
exports.updateProfileController = updateProfileController;
const validateTokenController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({ valid: true });
    }
    catch (error) {
        res.status(401).json({ valid: false, message: "Неверный токен" });
    }
});
exports.validateTokenController = validateTokenController;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { password } = _a, userData = __rest(_a, ["password"]);
        // Хешируем пароль
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield User_1.default.create(Object.assign(Object.assign({}, userData), { password: hashedPassword, createdAt: new Date(), updatedAt: new Date() }));
        // Не возвращаем пароль
        const _b = user.toObject(), { password: _ } = _b, userWithoutPassword = __rest(_b, ["password"]);
        res.status(201).json(userWithoutPassword);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createUser = createUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUser = getUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { password } = _a, updateData = __rest(_a, ["password"]);
        // Если передан новый пароль, хешируем его
        if (password) {
            updateData.password = yield bcryptjs_1.default.hash(password, 10);
        }
        const user = yield User_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, updateData), { updatedAt: new Date() }), { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json({ message: 'Пользователь успешно удален' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteUser = deleteUser;
