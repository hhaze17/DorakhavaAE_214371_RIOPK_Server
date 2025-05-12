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
var mongoose_1 = require("mongoose");
var InventoryAlertSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['low_stock', 'expiring_soon', 'zone_capacity', 'quality_issue', 'uncollected_order'],
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product'
    },
    batchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    zoneId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Zone',
    },
    message: {
        type: String,
    },
    level: {
        type: String,
        enum: ['info', 'warning', 'critical'],
        default: 'info'
    },
    isResolved: {
        type: Boolean,
        default: false
    },
    resolvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});
// Индексы для повышения производительности запросов
InventoryAlertSchema.index({ type: 1 });
InventoryAlertSchema.index({ zoneId: 1 });
InventoryAlertSchema.index({ level: 1 });
InventoryAlertSchema.index({ isResolved: 1 });
InventoryAlertSchema.index({ createdAt: 1 });
// Статические методы
InventoryAlertSchema.statics.getActiveAlerts = function () {
    return this.find({ isResolved: false })
        .sort({ level: -1, createdAt: -1 }) // Critical first, then by date
        .populate('productId', 'name')
        .populate('batchId', 'batchNumber')
        .populate('zoneId', 'name type')
        .populate('resolvedBy', 'username');
};
InventoryAlertSchema.statics.getAlertsByZone = function (zoneId) {
    return this.find({ zoneId: zoneId, isResolved: false })
        .sort({ level: -1, createdAt: -1 })
        .populate('productId', 'name')
        .populate('batchId', 'batchNumber')
        .populate('resolvedBy', 'username');
};
InventoryAlertSchema.statics.getAlertsByProduct = function (productId) {
    return this.find({ productId: productId, isResolved: false })
        .sort({ level: -1, createdAt: -1 })
        .populate('zoneId', 'name type')
        .populate('batchId', 'batchNumber')
        .populate('resolvedBy', 'username');
};
// Методы экземпляра
InventoryAlertSchema.methods.resolve = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            this.isResolved = true;
            this.resolvedBy = userId;
            this.resolvedAt = new Date();
            return [2 /*return*/, this.save()];
        });
    });
};
exports.default = mongoose_1.default.model('InventoryAlert', InventoryAlertSchema);
