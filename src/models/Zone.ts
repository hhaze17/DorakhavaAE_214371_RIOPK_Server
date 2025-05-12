import mongoose, { Schema } from 'mongoose';
import { ZoneInterface } from '../types';

const ZoneSchema = new Schema({
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
    minStockThreshold: { // порог для уведомления о пополнении
      type: Number,
      default: 5
    },
    isPromoZone: { // флаг для акционной зоны
      type: Boolean,
      default: false
    },
    promotionEndDate: { // дата окончания акции
      type: Date
    },
    displayPriority: { // приоритет отображения товаров
      type: Number,
      default: 1
    },
    visibleToCustomer: { // видимость в клиентской части
      type: Boolean,
      default: true
    }
  },
  // Дополнительные поля для склада (warehouse)
  warehouseConfig: {
    storageConditions: {
      specialRequirements: { // особые требования к хранению
        type: String
      }
    },
    fifoEnabled: { // использование FIFO (First In, First Out)
      type: Boolean,
      default: true
    },
    temperatureMonitored: { // мониторинг температуры
      type: Boolean,
      default: false
    },
    zonePartition: { // раздел склада (например, "холодильное", "сухое")
      type: String
    },
    allowMixedProducts: { // разрешать хранение разных товаров вместе
      type: Boolean,
      default: true
    }
  },
  // Дополнительные поля для зоны приемки (receiving)
  receivingConfig: {
    hasQualityControl: { // проверка качества при приемке
      type: Boolean,
      default: true
    },
    maxDailyCapacity: { // максимальное количество товаров для приемки в день
      type: Number
    },
    requiresInspection: { // требуется ли проверка товара
      type: Boolean,
      default: true
    },
    supplierVerification: { // проверка поставщика
      type: Boolean,
      default: false
    },
    tempStorageDuration: { // максимальное время временного хранения (в часах)
      type: Number,
      default: 24
    }
  },
  // Дополнительные поля для кассовой зоны (cashier)
  cashierConfig: {
    hasReturnsProcessing: { // обработка возвратов на кассе
      type: Boolean,
      default: true
    },
    hasExpressCheckout: { // наличие экспресс-обслуживания
      type: Boolean,
      default: false
    },
    realTimeInventoryUpdate: { // обновление инвентаря в реальном времени
      type: Boolean,
      default: true
    },
    allowPartialReturn: { // разрешить частичный возврат товара
      type: Boolean,
      default: true
    }
  },
  // Дополнительные поля для зоны возвратов (returns)
  returnsConfig: {
    requiresInspection: { // требуется ли осмотр возвращенных товаров
      type: Boolean,
      default: true
    },
    maxStorageDays: { // максимальное количество дней хранения возвратов
      type: Number,
      default: 30
    },
    allowReselling: { // разрешено ли перепродавать возвращенные товары
      type: Boolean,
      default: false
    },
    defectCategories: { // категории дефектов
      type: [String],
      default: ['minor', 'major', 'critical']
    },
    quarantinePeriod: { // период карантина для возвращенных товаров (в днях)
      type: Number,
      default: 0
    }
  },
  // Дополнительные поля для зоны самовывоза (pickup)
  pickupConfig: {
    maxWaitingTime: { // максимальное время ожидания (в часах)
      type: Number,
      default: 48
    },
    requiresIdentification: { // требуется ли удостоверение личности
      type: Boolean,
      default: true
    },
    notificationEnabled: { // включены ли уведомления
      type: Boolean,
      default: true
    },
    reservationDuration: { // длительность резервирования (в часах)
      type: Number,
      default: 48
    },
    statusTracking: { // отслеживание статуса заказа
      type: Boolean,
      default: true
    }
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Индекс для поиска по типу зоны
ZoneSchema.index({ type: 1 });

// Метод для проверки доступной вместимости
ZoneSchema.methods.hasAvailableSpace = function(quantity: number) {
  return this.currentOccupancy + quantity <= this.capacity;
};

// Метод для обновления занятости
ZoneSchema.methods.updateOccupancy = function(quantity: number) {
  // Ensure currentOccupancy is a number
  if (typeof this.currentOccupancy !== 'number') {
    this.currentOccupancy = 0;
  }
  
  // Ensure capacity is a number
  if (typeof this.capacity !== 'number') {
    this.capacity = 1000; // Default capacity if undefined
  }
  
  const newOccupancy = this.currentOccupancy + quantity;
  
  // Handle negative occupancy
  if (newOccupancy < 0) {
    console.warn(`Warning: Attempted to set negative occupancy for zone ${this._id}. Setting to 0 instead.`);
    this.currentOccupancy = 0;
    return this.save();
  }
  
  // Handle exceeding capacity
  if (newOccupancy > this.capacity) {
    console.warn(`Warning: Attempted to exceed capacity for zone ${this._id}. Setting to maximum capacity instead.`);
    this.currentOccupancy = this.capacity;
    return this.save();
  }
  
  // Normal case
  this.currentOccupancy = newOccupancy;
  return this.save();
};

// Метод для проверки необходимости пополнения торгового зала
ZoneSchema.methods.needsRestock = function() {
  if (this.type !== 'sales') return false;
  return this.currentOccupancy <= this.salesZoneConfig.minStockThreshold;
};

// Метод для проверки соответствия условий хранения
ZoneSchema.methods.meetsStorageRequirements = function(requiredTemp: number, requiredHumidity: number) {
  const tempDiff = Math.abs(this.temperature - requiredTemp);
  const humidityDiff = Math.abs(this.humidity - requiredHumidity);
  
  // Допустимая погрешность
  return tempDiff <= 3 && humidityDiff <= 5;
};

// Новый метод для проверки срока годности продукта в зоне
ZoneSchema.methods.checkExpiryDates = async function() {
  if (this.type !== 'sales' && this.type !== 'warehouse') return [];
  
  const Product = mongoose.model('Product');
  const Batch = mongoose.model('Batch');
  
  // Найти все партии в этой зоне
  const batches = await Batch.find({ currentZone: this._id });
  
  // Проверить сроки годности
  const expiringItems = [];
  const now = new Date();
  
  for (const batch of batches) {
    // Если срок годности истек или истекает в ближайшие 30 дней
    const expiryDate = new Date(batch.expiryDate);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 30) {
      const product = await Product.findById(batch.product);
      expiringItems.push({
        product,
        batch,
        daysUntilExpiry
      });
    }
  }
  
  return expiringItems;
};

// Новый метод для проверки наличия акционных товаров
ZoneSchema.methods.checkPromotionalItems = async function() {
  if (this.type !== 'sales' || !this.salesZoneConfig.isPromoZone) return [];
  
  const Product = mongoose.model('Product');
  const now = new Date();
  
  // Найти все акционные товары в этой зоне, акция которых еще действует
  const products = await Product.find({ 
    zone: this._id,
    isPromotion: true,
    promotionEndDate: { $gt: now }
  });
  
  return products;
};

// Новый метод для проверки заказов в зоне самовывоза
ZoneSchema.methods.checkUncollectedOrders = async function() {
  if (this.type !== 'pickup') return [];
  
  const OnlineOrder = mongoose.model('OnlineOrder');
  const now = new Date();
  
  // Найти все заказы в этой зоне самовывоза, которые ожидают более 24 часов
  const orders = await OnlineOrder.find({
    pickupZone: this._id,
    status: 'ready',
    updatedAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
  }).populate('customer');
  
  return orders;
};

export default mongoose.model<ZoneInterface>('Zone', ZoneSchema); 