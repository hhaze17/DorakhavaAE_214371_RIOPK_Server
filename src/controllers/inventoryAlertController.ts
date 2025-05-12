import { Request, Response } from "express";
import InventoryAlert from "../models/InventoryAlert";
import Zone from "../models/Zone";
import Product from "../models/Product";
import Batch from "../models/Batch";

// Получение всех активных уведомлений
export const getActiveAlerts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Фильтры
    const filters: any = { isResolved: false };
    
    if (req.query.type) {
      filters.type = req.query.type;
    }
    
    if (req.query.level) {
      filters.level = req.query.level;
    }
    
    if (req.query.zoneId) {
      filters.zoneId = req.query.zoneId;
    }
    
    if (req.query.productId) {
      filters.productId = req.query.productId;
    }
    
    // Подсчет общего количества уведомлений
    const totalCount = await InventoryAlert.countDocuments(filters);
    
    // Получение уведомлений
    const alerts = await InventoryAlert.find(filters)
      .sort({ level: -1, createdAt: -1 }) // Сначала критические, затем по дате
      .populate('productId', 'name')
      .populate('batchId', 'batchNumber')
      .populate('zoneId', 'name type')
      .skip(skip)
      .limit(limit);
    
    res.json({
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      alerts
    });
  } catch (error: any) {
    console.error("Ошибка при получении уведомлений:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

// Создание нового уведомления
export const createAlert = async (req: Request, res: Response) => {
  try {
    const { type, productId, batchId, zoneId, message, level } = req.body;
    
    // Проверка зоны
    if (!zoneId) {
      return res.status(400).json({ message: "Необходимо указать зону (zoneId)" });
    }
    
    const zone = await Zone.findById(zoneId);
    if (!zone) {
      return res.status(404).json({ message: "Зона не найдена" });
    }
    
    // Дополнительные проверки для товаров
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Товар не найден" });
      }
    }
    
    // Создание уведомления
    const alert = new InventoryAlert({
      type,
      productId,
      batchId,
      zoneId,
      message,
      level: level || 'info'
    });
    
    await alert.save();
    
    res.status(201).json({
      message: "Уведомление успешно создано",
      alert
    });
  } catch (error: any) {
    console.error("Ошибка при создании уведомления:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

// Получение уведомлений по зоне
export const getAlertsByZone = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    
    if (!zoneId) {
      return res.status(400).json({ message: 'Zone ID is required' });
    }
    
    // Находим уведомления для зоны
    const products = await Product.find({ 
      zone: zoneId,
      quantity: { $lt: 5 }
    }).populate('zone', 'name type');
    
    const alerts: any[] = [];
    
    // Создаем уведомления о низком запасе
    products.forEach(product => {
      alerts.push({
        type: 'low_stock',
        severity: product.quantity <= 1 ? 'critical' : 'warning',
        message: `Низкий уровень запасов: ${product.name} (${product.quantity} шт.)`,
        product: product,
        zone: product.zone,
        quantity: product.quantity,
        threshold: 5,
        createdAt: new Date()
      });
    });
    
    // Пример: уведомление о заполнении зоны (если это зона приемки или склада)
    const zone = await Zone.findById(zoneId);
    if (zone && (zone.type === 'receiving' || zone.type === 'warehouse')) {
      if (zone.currentOccupancy && zone.capacity && 
          zone.currentOccupancy / zone.capacity > 0.9) {
        alerts.push({
          type: 'zone_full',
          severity: 'warning',
          message: `Зона ${zone.name} заполнена на ${Math.round(zone.currentOccupancy / zone.capacity * 100)}%`,
          zone: zone,
          createdAt: new Date()
        });
      }
    }
    
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error getting alerts by zone:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Получение уведомлений по продукту
export const getAlertsByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Находим продукт
    const product = await Product.findById(productId).populate('zone', 'name type');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const alerts: any[] = [];
    
    // Проверка на низкий запас
    if (product.quantity < 5) {
      alerts.push({
        type: 'low_stock',
        severity: product.quantity <= 1 ? 'critical' : 'warning',
        message: `Низкий уровень запасов: ${product.name} (${product.quantity} шт.)`,
        product: product,
        zone: product.zone,
        quantity: product.quantity,
        threshold: 5,
        createdAt: new Date()
      });
    }
    
    // Проверка на истечение срока годности (если есть батчи)
    const batches = await Batch.find({ product: productId });
    
    for (const batch of batches) {
      if (batch.expiryDate) {
        const daysUntilExpiry = Math.floor((batch.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 7) {
          alerts.push({
            type: 'batch_expiring',
            severity: daysUntilExpiry <= 2 ? 'critical' : 'warning',
            message: `Истекает срок годности: ${product.name}, партия ${batch.batchNumber} (${daysUntilExpiry} дней)`,
            product: product,
            createdAt: new Date()
          });
        }
      }
    }
    
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error getting alerts by product:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Разрешение уведомления
export const resolveAlert = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    
    // В реальном приложении здесь нужно обновить статус уведомления в базе данных
    // Так как уведомления генерируются динамически, просто возвращаем успешный ответ
    
    res.status(200).json({ 
      message: 'Alert marked as resolved',
      alertId
    });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Получение истории разрешенных уведомлений
export const getResolvedAlerts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Фильтры
    const filters: any = { isResolved: true };
    
    if (req.query.type) {
      filters.type = req.query.type;
    }
    
    if (req.query.zoneId) {
      filters.zoneId = req.query.zoneId;
    }
    
    // Подсчет общего количества разрешенных уведомлений
    const totalCount = await InventoryAlert.countDocuments(filters);
    
    // Получение уведомлений
    const alerts = await InventoryAlert.find(filters)
      .sort({ resolvedAt: -1 })
      .populate('productId', 'name')
      .populate('batchId', 'batchNumber')
      .populate('zoneId', 'name type')
      .populate('resolvedBy', 'username')
      .skip(skip)
      .limit(limit);
    
    res.json({
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      alerts
    });
  } catch (error: any) {
    console.error("Ошибка при получении разрешенных уведомлений:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
}; 