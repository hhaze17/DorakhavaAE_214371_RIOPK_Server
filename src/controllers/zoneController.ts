import { Request, Response } from "express";
import Zone from "../models/Zone";
import Product from "../models/Product";
import Batch from "../models/Batch";
import mongoose from "mongoose";

interface ZoneRequestBody {
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
  };
  warehouseConfig?: {
    storageConditions: {
      specialRequirements?: string;
    };
    fifoEnabled: boolean;
  };
  receivingConfig?: {
    hasQualityControl: boolean;
    maxDailyCapacity?: number;
  };
  cashierConfig?: {
    hasReturnsProcessing: boolean;
    hasExpressCheckout: boolean;
  };
  returnsConfig?: {
    requiresInspection: boolean;
    maxStorageDays: number;
  };
  pickupConfig?: {
    maxWaitingTime: number;
    requiresIdentification: boolean;
  };
}

interface ZoneTemplateRequest {
  type: string;
  name: string;
  capacity: number;
}

export const createZone = async (req: Request, res: Response) => {
  try {
    const body = req.body as unknown as ZoneRequestBody;
    const zone = await Zone.create(body);
    res.status(201).json(zone);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const getZones = async (req: Request, res: Response) => {
  try {
    const zones = await Zone.find();
    res.json(zones);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const getZoneById = async (req: Request, res: Response) => {
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ message: 'Зона не найдена' });
    }
    res.json(zone);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const updateZone = async (req: Request, res: Response) => {
  try {
    const body = req.body as unknown as Partial<ZoneRequestBody>;
    const zone = await Zone.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    if (!zone) {
      return res.status(404).json({ message: 'Зона не найдена' });
    }
    res.json(zone);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const deleteZone = async (req: Request, res: Response) => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);
    if (!zone) {
      return res.status(404).json({ message: 'Зона не найдена' });
    }
    res.json({ message: 'Зона успешно удалена' });
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const getZonesByType = async (req: Request, res: Response) => {
  try {
    const zones = await Zone.find({ type: req.params.type });
    res.json(zones);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const updateZoneOccupancy = async (req: Request, res: Response) => {
  try {
    const { occupancy } = req.body as { occupancy: number };
    const zone = await Zone.findByIdAndUpdate(
      req.params.id,
      { $inc: { currentOccupancy: occupancy } },
      { new: true }
    );
    if (!zone) {
      return res.status(404).json({ message: 'Зона не найдена' });
    }
    res.json(zone);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Новые методы для работы с зонами

// Проверка товаров, которые нуждаются в пополнении (для торгового зала)
export const checkSalesZoneInventory = async (req: Request, res: Response) => {
  try {
    const salesZone = await Zone.findById(req.params.id);
    if (!salesZone || salesZone.type !== 'sales') {
      return res.status(400).json({ message: 'Не торговая зона' });
    }

    const products = await Product.find({ zone: salesZone._id });
    const lowStockProducts = products.filter(product => 
      product.quantity <= (salesZone.salesZoneConfig?.minStockThreshold || 5)
    );

    res.json({
      zoneId: salesZone._id,
      zoneName: salesZone.name,
      lowStockProducts: lowStockProducts.map(p => ({
        id: p._id,
        name: p.name,
        currentQuantity: p.quantity,
        minThreshold: salesZone.salesZoneConfig?.minStockThreshold || 5
      }))
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получение партий товаров по принципу FIFO (для склада)
export const getFifoBatches = async (req: Request, res: Response) => {
  try {
    const warehouseZone = await Zone.findById(req.params.id);
    if (!warehouseZone || warehouseZone.type !== 'warehouse') {
      return res.status(400).json({ message: 'Не складская зона' });
    }

    const batches = await Batch.find({ zone: warehouseZone._id })
      .sort({ manufacturingDate: 1 }) // Сортировка по дате производства (старые первыми)
      .limit(20)
      .populate('product', 'name'); // Добавляем информацию о продукте

    res.json({
      zoneId: warehouseZone._id,
      zoneName: warehouseZone.name,
      batches: batches
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Проверка заполненности зоны приемки
export const checkReceivingZoneCapacity = async (req: Request, res: Response) => {
  try {
    const receivingZone = await Zone.findById(req.params.id);
    if (!receivingZone || receivingZone.type !== 'receiving') {
      return res.status(400).json({ message: 'Не зона приемки' });
    }

    const currentCapacity = receivingZone.currentOccupancy;
    const maxCapacity = receivingZone.capacity;
    const availableSpace = maxCapacity - currentCapacity;
    const dailyCapacity = receivingZone.receivingConfig?.maxDailyCapacity || maxCapacity;

    res.json({
      zoneId: receivingZone._id,
      zoneName: receivingZone.name,
      currentOccupancy: currentCapacity,
      capacity: maxCapacity,
      availableSpace: availableSpace,
      dailyCapacity: dailyCapacity,
      canReceiveMore: availableSpace > 0,
      hasQualityControl: receivingZone.receivingConfig?.hasQualityControl || false,
      occupancyPercentage: Math.round((currentCapacity / maxCapacity) * 100)
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Проверка статуса заказов в зоне самовывоза
export const checkPickupZoneStatus = async (req: Request, res: Response) => {
  try {
    const pickupZone = await Zone.findById(req.params.id);
    if (!pickupZone || pickupZone.type !== 'pickup') {
      return res.status(400).json({ message: 'Не зона самовывоза' });
    }

    // Получаем все онлайн-заказы, связанные с этой зоной самовывоза
    const onlineOrders = await mongoose.model('OnlineOrder').find({
      pickupZone: pickupZone._id,
      status: { $in: ['reserved', 'ready', 'pending'] }
    }).populate('customer', 'firstName lastName');

    // Обрабатываем заказы
    const orders = onlineOrders.map(order => {
      const reservedUntil = new Date(order.createdAt);
      reservedUntil.setHours(reservedUntil.getHours() + (pickupZone.pickupConfig?.maxWaitingTime || 48));
      
      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        reservedUntil: reservedUntil,
        status: order.status,
        customer: {
          name: order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Н/Д'
        },
        items: order.items.map((item: any) => ({
          productName: item.productName,
          quantity: item.quantity
        }))
      };
    });

    // Разделяем на просроченные и активные
    const now = new Date();
    const expiredOrders = orders.filter(order => new Date(order.reservedUntil) < now);
    const activeOrders = orders.filter(order => new Date(order.reservedUntil) >= now);

    res.json({
      zoneId: pickupZone._id,
      zoneName: pickupZone.name,
      orders: orders,
      expiredOrders: expiredOrders,
      activeOrders: activeOrders,
      requiresIdentification: pickupZone.pickupConfig?.requiresIdentification || true,
      maxWaitingTime: pickupZone.pickupConfig?.maxWaitingTime || 48
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Создание зоны по шаблону
export const createZoneByTemplate = async (req: Request, res: Response) => {
  try {
    const { type, name, capacity } = req.body as ZoneTemplateRequest;

    if (!type || !name || !capacity) {
      return res.status(400).json({ message: 'Необходимо указать тип, название и вместимость зоны' });
    }

    let zoneData: any = {
      name,
      type,
      capacity,
      currentOccupancy: 0,
      // Стандартные условия хранения
      temperature: 20,
      humidity: 50,
      status: 'active'
    };

    // Добавляем специфичные настройки в зависимости от типа зоны
    switch (type) {
      case 'sales':
        zoneData.salesZoneConfig = {
          minStockThreshold: 5,
          isPromoZone: false
        };
        // Торговая зона имеет комнатную температуру и среднюю влажность
        zoneData.temperature = 22;
        zoneData.humidity = 45;
        break;
      
      case 'warehouse':
        zoneData.warehouseConfig = {
          storageConditions: {
            specialRequirements: 'Обычные условия хранения'
          },
          fifoEnabled: true
        };
        // Склад может иметь более прохладную температуру для лучшего хранения
        zoneData.temperature = 18;
        zoneData.humidity = 50;
        break;
      
      case 'receiving':
        zoneData.receivingConfig = {
          hasQualityControl: true,
          maxDailyCapacity: capacity // По умолчанию равно общей вместимости
        };
        // Зона приемки - обычные условия
        zoneData.temperature = 20;
        zoneData.humidity = 50;
        break;
      
      case 'cashier':
        zoneData.cashierConfig = {
          hasReturnsProcessing: true,
          hasExpressCheckout: false
        };
        // Кассовая зона - комнатная температура
        zoneData.temperature = 22;
        zoneData.humidity = 45;
        break;
      
      case 'returns':
        zoneData.returnsConfig = {
          requiresInspection: true,
          maxStorageDays: 30
        };
        // Зона возвратов - обычные условия
        zoneData.temperature = 20;
        zoneData.humidity = 50;
        break;
      
      case 'pickup':
        zoneData.pickupConfig = {
          maxWaitingTime: 48,
          requiresIdentification: true
        };
        // Зона самовывоза - комнатная температура
        zoneData.temperature = 22;
        zoneData.humidity = 45;
        break;
      
      default:
        return res.status(400).json({ message: 'Неизвестный тип зоны' });
    }

    const zone = await Zone.create(zoneData);
    res.status(201).json(zone);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

/**
 * Получение статистики по зонам (заполненность и товары)
 */
export const getZoneStats = async (req: Request, res: Response) => {
  try {
    // Получаем все зоны
    const zones = await Zone.find({});
    
    // Получаем все продукты
    const products = await Product.find({});
    
    // Создаем статистику по зонам
    const zoneStats = zones.map(zone => {
      // Фильтруем продукты, которые находятся в этой зоне
      const zoneProducts = products.filter(product => 
        product.zone && product.zone.toString() === zone._id.toString()
      );
      
      // Подсчитываем общее количество товаров в зоне
      const totalQuantity = zoneProducts.reduce((sum, product) => sum + (product.quantity || 0), 0);
      
      return {
        _id: zone._id,
        name: zone.name,
        type: zone.type,
        capacity: zone.capacity || 0,
        currentOccupancy: totalQuantity,
        products: zoneProducts.length,
        utilization: zone.capacity ? (totalQuantity / zone.capacity * 100).toFixed(1) + '%' : 'N/A'
      };
    });
    
    res.status(200).json(zoneStats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 

// Добавляем новый метод для получения зон по продукту
export const getZonesByProductId = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    
    // Находим все зоны, где есть этот продукт
    const zones = await Zone.aggregate([
      // Lookup в коллекции products для поиска товаров в этой зоне
      {
        $lookup: {
          from: "products",
          let: { zoneId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $and: [
                    { $eq: ["$zone", "$$zoneId"] },
                    { $eq: ["$_id", { $toObjectId: productId }] }
                  ]
                }
              }
            }
          ],
          as: "products"
        }
      },
      // Lookup в коллекции batches для нахождения партий этого товара в зоне
      {
        $lookup: {
          from: "batches",
          let: { zoneId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $and: [
                    { $eq: ["$zone", "$$zoneId"] },
                    { $eq: ["$product", { $toObjectId: productId }] }
                  ]
                }
              }
            }
          ],
          as: "batches"
        }
      },
      // Добавляем поле с количеством товара в зоне
      {
        $addFields: {
          productQuantity: {
            $sum: [
              { $sum: "$batches.quantity" },
              { 
                $cond: [
                  { $gt: [{ $size: "$products" }, 0] }, 
                  { $arrayElemAt: ["$products.quantity", 0] }, 
                  0
                ]
              }
            ]
          }
        }
      },
      // Фильтруем только зоны, где есть товар
      {
        $match: {
          $or: [
            { "products": { $ne: [] } },
            { "batches": { $ne: [] } }
          ]
        }
      },
      // Проекция нужных полей
      {
        $project: {
          _id: 1,
          name: 1,
          type: 1,
          productQuantity: 1
        }
      }
    ]);
    
    if (!zones || zones.length === 0) {
      return res.status(404).json({ message: "Product not found in any zone" });
    }
    
    res.status(200).json(zones);
  } catch (error) {
    console.error("Error getting zones by product:", error);
    res.status(500).json({ message: (error as Error).message });
  }
}; 