"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ZoneSchema = new mongoose_1.Schema({
    name: {
        type: String,
        unique: true
    },
    type: {
        type: String,
        enum: ['sales', 'warehouse', 'receiving', 'cashier', 'returns', 'pickup'],
        required: true
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
    const newOccupancy = this.currentOccupancy + quantity;
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
    const tempDiff = Math.abs(this.temperature - requiredTemp);
    const humidityDiff = Math.abs(this.humidity - requiredHumidity);
    // Допустимая погрешность
    return tempDiff <= 3 && humidityDiff <= 5;
};
// Новый метод для проверки срока годности продукта в зоне
ZoneSchema.methods.checkExpiryDates = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.type !== 'sales' && this.type !== 'warehouse')
            return [];
        const Product = mongoose_1.default.model('Product');
        const Batch = mongoose_1.default.model('Batch');
        // Найти все партии в этой зоне
        const batches = yield Batch.find({ currentZone: this._id });
        // Проверить сроки годности
        const expiringItems = [];
        const now = new Date();
        for (const batch of batches) {
            // Если срок годности истек или истекает в ближайшие 30 дней
            const expiryDate = new Date(batch.expiryDate);
            const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= 30) {
                const product = yield Product.findById(batch.product);
                expiringItems.push({
                    product,
                    batch,
                    daysUntilExpiry
                });
            }
        }
        return expiringItems;
    });
};
// Новый метод для проверки наличия акционных товаров
ZoneSchema.methods.checkPromotionalItems = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.type !== 'sales' || !this.salesZoneConfig.isPromoZone)
            return [];
        const Product = mongoose_1.default.model('Product');
        const now = new Date();
        // Найти все акционные товары в этой зоне, акция которых еще действует
        const products = yield Product.find({
            zone: this._id,
            isPromotion: true,
            promotionEndDate: { $gt: now }
        });
        return products;
    });
};
// Новый метод для проверки заказов в зоне самовывоза
ZoneSchema.methods.checkUncollectedOrders = function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.type !== 'pickup')
            return [];
        const OnlineOrder = mongoose_1.default.model('OnlineOrder');
        const now = new Date();
        // Найти все заказы в этой зоне самовывоза, которые ожидают более 24 часов
        const orders = yield OnlineOrder.find({
            pickupZone: this._id,
            status: 'ready',
            updatedAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        }).populate('customer');
        return orders;
    });
};
exports.default = mongoose_1.default.model('Zone', ZoneSchema);
