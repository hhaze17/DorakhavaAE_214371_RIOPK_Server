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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var mongoose_1 = require("mongoose");
var bcryptjs_1 = require("bcryptjs");
var UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: false,
    },
    levelOfAccess: {
        type: String,
        enum: ['Администратор', 'Сотрудник', 'Клиент'],
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    store: {
        type: String,
    },
    address: {
        type: String,
    },
    birthDate: {
        type: Date,
    },
    contactNumber: {
        type: String,
    },
    name: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});
// Хеширование пароля перед сохранением
UserSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!this.isModified('password') || !this.password) {
                        return [2 /*return*/, next()];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
                case 2:
                    salt = _b.sent();
                    _a = this;
                    return [4 /*yield*/, bcryptjs_1.default.hash(this.password, salt)];
                case 3:
                    _a.password = _b.sent();
                    next();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    next(error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
});
// Метод для проверки пароля
UserSchema.methods.comparePassword = function (passwordToCompare) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!this.password)
                return [2 /*return*/, false];
            return [2 /*return*/, bcryptjs_1.default.compare(passwordToCompare, this.password)];
        });
    });
};
// Метод для получения полного имени
UserSchema.methods.getFullName = function () {
    return "".concat(this.firstName, " ").concat(this.lastName);
};
exports.User = mongoose_1.default.model('User', UserSchema);
exports.default = exports.User;
