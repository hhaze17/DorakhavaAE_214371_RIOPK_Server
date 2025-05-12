// Этот файл инициализирует все модели при запуске приложения
import './User';
import './ResetToken';
import './CreatePasswordToken';
import './Product';
import './Zone';
import './ProductMovement';
import './OnlineOrder';
import './Batch';
import './StoreInventory';
import './StoreIncomingProduct';
import './Sale';
import './ReturnedItem';
import './Purchase';
import './OutgoingProduct';
import './OrderProduct';
import './IncomingProduct';
import './Gallery';
import './DailyAttendance';
import './BarcodeGenerator';
// Новые модели для системы зон
import './ExpiryTracking';
import './InventoryAlert';
import './ZoneTransferRequest';
import './ZoneProduct';

// Экспортируем все модели для удобства импорта
export { User } from './User';
export { default as ResetToken } from './ResetToken';
export { default as CreatePasswordToken } from './CreatePasswordToken';
export { default as Product } from './Product';
export { default as Zone } from './Zone';
export { default as ProductMovement } from './ProductMovement';
export { default as OnlineOrder } from './OnlineOrder';
export { default as Batch } from './Batch';
export { default as StoreInventory } from './StoreInventory';
export { default as StoreIncomingProduct } from './StoreIncomingProduct';
export { default as Sale } from './Sale';
export { default as ReturnedItem } from './ReturnedItem';
export { default as Purchase } from './Purchase';
export { default as OutgoingProduct } from './OutgoingProduct';
export { default as OrderProduct } from './OrderProduct';
export { default as IncomingProduct } from './IncomingProduct';
export { default as Gallery } from './Gallery';
export { default as DailyAttendance } from './DailyAttendance';
export { default as BarcodeGenerator } from './BarcodeGenerator';
// Экспортируем новые модели
export { default as ExpiryTracking } from './ExpiryTracking';
export { default as InventoryAlert } from './InventoryAlert';
export { default as ZoneTransferRequest } from './ZoneTransferRequest';
export { default as ZoneProduct } from './ZoneProduct'; 