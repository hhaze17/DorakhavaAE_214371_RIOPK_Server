import { Document, Model } from 'mongoose';
import { Request } from 'express';
import mongoose from 'mongoose';

export interface UserInterface extends Document {
  username: string;
  password?: string;
  levelOfAccess: 'Администратор' | 'Сотрудник' | 'Клиент';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  store?: string;
  address?: string;
  birthDate?: Date;
  contactNumber?: string;
  name?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

export interface ProductInterface extends Document {
  name: string;
  description: string;
  brandName: string;
  productModel: string;
  category: string;
  price: number;
  quantity: number;
  zone: mongoose.Types.ObjectId;
  storageConditions: {
    temperature: number;
    humidity: number;
    lightSensitive: boolean;
  };
  batchInfo: {
    batchNumber: string;
    manufacturingDate: Date;
    expiryDate: Date;
  };
  status: 'active' | 'reserved' | 'sold' | 'returned' | 'written_off' | 'inactive' | 'discontinued';
  reservedForOrder?: mongoose.Types.ObjectId | null;
  isPromotion?: boolean;
  promotionEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  hasStock(amount: number): boolean;
  updateQuantity(amount: number): Promise<ProductInterface>;
  isExpired(): boolean;
}

export interface ZoneInterface extends Document {
  name: string;
  type: 'sales' | 'warehouse' | 'receiving' | 'cashier' | 'returns' | 'pickup';
  capacity: number;
  currentOccupancy: number;
  temperature: number;
  humidity: number;
  status: 'active' | 'inactive' | 'maintenance';
  salesZoneConfig?: {
    minStockThreshold: number;
    isPromoZone: boolean;
    promotionEndDate?: Date;
    displayPriority?: number;
    visibleToCustomer: boolean;
  };
  warehouseConfig?: {
    storageConditions: {
      specialRequirements?: string;
    };
    fifoEnabled: boolean;
    temperatureMonitored: boolean;
    zonePartition?: string;
    allowMixedProducts: boolean;
  };
  receivingConfig?: {
    hasQualityControl: boolean;
    maxDailyCapacity?: number;
    requiresInspection: boolean;
    supplierVerification: boolean;
    tempStorageDuration: number;
  };
  cashierConfig?: {
    hasReturnsProcessing: boolean;
    hasExpressCheckout: boolean;
    realTimeInventoryUpdate: boolean;
    allowPartialReturn: boolean;
  };
  returnsConfig?: {
    requiresInspection: boolean;
    maxStorageDays: number;
    allowReselling: boolean;
    defectCategories?: string[];
    quarantinePeriod?: number;
  };
  pickupConfig?: {
    maxWaitingTime: number;
    requiresIdentification: boolean;
    notificationEnabled: boolean;
    reservationDuration: number;
    statusTracking: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  hasAvailableSpace(quantity: number): boolean;
  updateOccupancy(quantity: number): void;
  needsRestock(): boolean;
  meetsStorageRequirements(requiredTemp: number, requiredHumidity: number): boolean;
}

export interface BatchInterface extends Document {
  product: mongoose.Types.ObjectId;
  batchNumber: string;
  quantity: number;
  manufacturingDate: Date;
  expiryDate: Date;
  zone: mongoose.Types.ObjectId;
  status: 'active' | 'expired' | 'depleted' | 'recalled';
  supplier: {
    name: string;
    contact?: string;
  };
  purchasePrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isExpired(): boolean;
  hasStock(amount: number): boolean;
  updateQuantity(amount: number): Promise<BatchInterface>;
}

export interface ProductMovementInterface extends Document {
  product: mongoose.Types.ObjectId;
  batch: mongoose.Types.ObjectId;
  type: 'receipt' | 'transfer' | 'sale' | 'return' | 'adjustment' | 'writeoff' | 'online_order' | 'pickup' | 'expired';
  quantity: number;
  fromZone?: mongoose.Types.ObjectId;
  toZone?: mongoose.Types.ObjectId;
  performedBy: mongoose.Types.ObjectId;
  reason?: string;
  reference?: string;
  salesInfo?: {
    isPromotion?: boolean;
    discountApplied?: number;
  };
  warehouseInfo?: {
    storageConditions?: {
      temperature?: number;
      humidity?: number;
      isCompliant?: boolean;
    };
  };
  expiryDate?: Date;
  clientInfo?: {
    clientId?: mongoose.Types.ObjectId;
    transactionId?: string;
  };
  pickupInfo?: {
    orderNumber?: string;
    reservedUntil?: Date;
    wasCollected?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OnlineOrderInterface extends Document {
  orderNumber: string;
  client: mongoose.Types.ObjectId;
  items: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    batch?: mongoose.Types.ObjectId;
    zone?: mongoose.Types.ObjectId;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled';
  pickupZone?: mongoose.Types.ObjectId;
  pickupTime?: Date;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'cash' | 'transfer';
  reservedProducts?: mongoose.Types.ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  calculateTotal(): number;
  isReady(): boolean;
  cancel(reason: string): Promise<OnlineOrderInterface>;
}

export interface AuthRequest extends Request {
  user?: UserInterface;
  token?: any;
}

export interface ErrorResponse {
  message: string;
  stack?: string;
}

export interface ExpiryTrackingInterface extends Document {
  productId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  expiryDate: Date;
  notificationSent: boolean;
  zoneId: mongoose.Types.ObjectId;
  quantity: number;
  markNotified(): Promise<ExpiryTrackingInterface>;
}

export interface ExpiryTrackingModel extends Model<ExpiryTrackingInterface> {
  findExpiringSoon(days?: number): Promise<ExpiryTrackingInterface[]>;
}

export interface InventoryAlertInterface extends Document {
  type: 'low_stock' | 'expiring_soon' | 'zone_capacity' | 'quality_issue' | 'uncollected_order';
  productId?: mongoose.Types.ObjectId;
  batchId?: mongoose.Types.ObjectId;
  zoneId: mongoose.Types.ObjectId;
  message: string;
  level: 'info' | 'warning' | 'critical';
  isResolved: boolean;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  resolve(userId: string): Promise<InventoryAlertInterface>;
}

export interface InventoryAlertModel extends Model<InventoryAlertInterface> {
  getActiveAlerts(): Promise<InventoryAlertInterface[]>;
  getAlertsByZone(zoneId: string): Promise<InventoryAlertInterface[]>;
  getAlertsByProduct(productId: string): Promise<InventoryAlertInterface[]>;
}

export interface ZoneTransferRequestInterface extends Document {
  productId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  quantity: number;
  fromZoneId: mongoose.Types.ObjectId;
  toZoneId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: mongoose.Types.ObjectId;
  reason?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
  completedAt?: Date;
  approve(userId: string): Promise<ZoneTransferRequestInterface>;
  reject(userId: string, reason: string): Promise<ZoneTransferRequestInterface>;
  complete(): Promise<ZoneTransferRequestInterface>;
}

export interface ZoneTransferRequestModel extends Model<ZoneTransferRequestInterface> {
  getPendingRequests(): Promise<ZoneTransferRequestInterface[]>;
  getRequestsByZone(zoneId: string): Promise<ZoneTransferRequestInterface[]>;
}

export interface ZoneProductInterface extends Document {
  zone: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  status: 'available' | 'reserved' | 'processing' | 'sold';
  expiryDate?: Date;
  isPromotion?: boolean;
  promotionEndDate?: Date;
  reservedForOrder?: mongoose.Types.ObjectId | null;
  lastUpdated?: {
    by?: mongoose.Types.ObjectId;
    reason?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ZoneProductModel extends Model<ZoneProductInterface> {
  getProductsInZone(zoneId: string): Promise<ZoneProductInterface[]>;
  getZonesForProduct(productId: string): Promise<ZoneProductInterface[]>;
  getExpiringProducts(days: number): Promise<ZoneProductInterface[]>;
  getLowStockProducts(threshold: number): Promise<ZoneProductInterface[]>;
} 