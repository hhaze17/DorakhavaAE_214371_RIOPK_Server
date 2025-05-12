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
var ZoneSchema = new mongoose_1.Schema({
    name: {
        type: String,
        unique: true
    },
    type: {
        type: String,
        enum: ['sales', 'warehouse', 'receiving', 'cashier', 'returns', 'pickup']
    },
    capacity: {
        type: Number,
        min: 0
    },
    currentOccupancy: {
        type: Number,
        min: 0,
        default: 0
    },
    temperature: {
        type: Number
    },
    humidity: {
        type: Number
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active'
    },
    // Дополнительные поля для торгового зала (sales)
    salesZoneConfig: {
        minStockThreshold: {
            type: Number,
            default: 5
        },
        isPromoZone: {
            type: Boolean,
            default: false
        },
        promotionEndDate: {
            type: Date
        },
        displayPriority: {
            type: Number,
            default: 1
        },
        visibleToCustomer: {
            type: Boolean,
            default: true
        }
    },
    // Дополнительные поля для склада (warehouse)
    warehouseConfig: {
        storageConditions: {
            specialRequirements: {
                type: String
            }
        },
        fifoEnabled: {
            type: Boolean,
            default: true
        },
        temperatureMonitored: {
            type: Boolean,
            default: false
        },
        zonePartition: {
            type: String
        },
        allowMixedProducts: {
            type: Boolean,
            default: true
        }
    },
    // Дополнительные поля для зоны приемки (receiving)
    receivingConfig: {
        hasQualityControl: {
            type: Boolean,
            default: true
        },
        maxDailyCapacity: {
            type: Number
        },
        requiresInspection: {
            type: Boolean,
            default: true
        },
        supplierVerification: {
            type: Boolean,
            default: false
        },
        tempStorageDuration: {
            type: Number,
            default: 24
        }
    },
    // Дополнительные поля для кассовой зоны (cashier)
    cashierConfig: {
        hasReturnsProcessing: {
            type: Boolean,
            default: true
        },
        hasExpressCheckout: {
            type: Boolean,
            default: false
        },
        realTimeInventoryUpdate: {
            type: Boolean,
            default: true
        },
        allowPartialReturn: {
            type: Boolean,
            default: true
        }
    },
    // Дополнительные поля для зоны возвратов (returns)
    returnsConfig: {
        requiresInspection: {
            type: Boolean,
            default: true
        },
        maxStorageDays: {
            type: Number,
            default: 30
        },
        allowReselling: {
            type: Boolean,
            default: false
        },
        defectCategories: {
            type: [String],
            default: ['minor', 'major', 'critical']
        },
        quarantinePeriod: {
            type: Number,
            default: 0
        }
    },
    // Дополнительные поля для зоны самовывоза (pickup)
    pickupConfig: {
        maxWaitingTime: {
            type: Number,
            default: 48
        },
        requiresIdentification: {
            type: Boolean,
            default: true
        },
        notificationEnabled: {
            type: Boolean,
            default: true
        },
        reservationDuration: {
            type: Number,
            default: 48
        },
        statusTracking: {
            type: Boolean,
            default: true
        }
    },
    products: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Product'
        }]
}, {
    timestamps: true
});
// Индекс для поиска по типу зоны
ZoneSchema.index({ type: 1 });
// Метод для проверки доступной вместимости
ZoneSchema.methods.hasAvailableSpace = function (quantity) {
    return this.currentOccupancy + quantity <= this.capacity;
};
// Метод для обновления занятости
ZoneSchema.methods.updateOccupancy = function (quantity) {
    var newOccupancy = this.currentOccupancy + quantity;
    if (newOccupancy < 0 || newOccupancy > this.capacity) {
        throw new Error('Недопустимое значение занятости');
    }
    this.currentOccupancy = newOccupancy;
};
// Метод для проверки необходимости пополнения торгового зала
ZoneSchema.methods.needsRestock = function () {
    if (this.type !== 'sales')
        return false;
    return this.currentOccupancy <= this.salesZoneConfig.minStockThreshold;
};
// Метод для проверки соответствия условий хранения
ZoneSchema.methods.meetsStorageRequirements = function (requiredTemp, requiredHumidity) {
    var tempDiff = Math.abs(this.temperature - requiredTemp);
    var humidityDiff = Math.abs(this.humidity - requiredHumidity);
    // Допустимая погрешность
    return tempDiff <= 3 && humidityDiff <= 5;
};
// Новый метод для проверки срока годности продукта в зоне
ZoneSchema.methods.checkExpiryDates = function () {
    return __awaiter(this, void 0, void 0, function () {
        var Product, Batch, batches, expiringItems, now, _i, batches_1, batch, expiryDate, daysUntilExpiry, product;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (this.type !== 'sales' && this.type !== 'warehouse')
                        return [2 /*return*/, []];
                    Product = mongoose_1.default.model('Product');
                    Batch = mongoose_1.default.model('Batch');
                    return [4 /*yield*/, Batch.find({ currentZone: this._id })];
                case 1:
                    batches = _a.sent();
                    expiringItems = [];
                    now = new Date();
                    _i = 0, batches_1 = batches;
                    _a.label = 2;
                case 2:
                    if (!(_i < batches_1.length)) return [3 /*break*/, 5];
                    batch = batches_1[_i];
                    expiryDate = new Date(batch.expiryDate);
                    daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    if (!(daysUntilExpiry <= 30)) return [3 /*break*/, 4];
                    return [4 /*yield*/, Product.findById(batch.product)];
                case 3:
                    product = _a.sent();
                    expiringItems.push({
                        product: product,
                        batch: batch,
                        daysUntilExpiry: daysUntilExpiry
                    });
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, expiringItems];
            }
        });
    });
};
// Новый метод для проверки наличия акционных товаров
ZoneSchema.methods.checkPromotionalItems = function () {
    return __awaiter(this, void 0, void 0, function () {
        var Product, now, products;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (this.type !== 'sales' || !this.salesZoneConfig.isPromoZone)
                        return [2 /*return*/, []];
                    Product = mongoose_1.default.model('Product');
                    now = new Date();
                    return [4 /*yield*/, Product.find({
                            zone: this._id,
                            isPromotion: true,
                            promotionEndDate: { $gt: now }
                        })];
                case 1:
                    products = _a.sent();
                    return [2 /*return*/, products];
            }
        });
    });
};
// Новый метод для проверки заказов в зоне самовывоза
ZoneSchema.methods.checkUncollectedOrders = function () {
    return __awaiter(this, void 0, void 0, function () {
        var OnlineOrder, now, orders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (this.type !== 'pickup')
                        return [2 /*return*/, []];
                    OnlineOrder = mongoose_1.default.model('OnlineOrder');
                    now = new Date();
                    return [4 /*yield*/, OnlineOrder.find({
                            pickupZone: this._id,
                            status: 'ready',
                            updatedAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
                        }).populate('customer')];
                case 1:
                    orders = _a.sent();
                    return [2 /*return*/, orders];
            }
        });
    });
};
exports.default = mongoose_1.default.model('Zone', ZoneSchema);
