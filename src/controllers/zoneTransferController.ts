import { Request, Response } from "express";
import ZoneTransferRequest from "../models/ZoneTransferRequest";
import Zone from "../models/Zone";
import Product from "../models/Product";
import Batch from "../models/Batch";
import ProductMovement from "../models/ProductMovement";
import InventoryAlert from "../models/InventoryAlert";

// Создание запроса на перемещение товара между зонами
export const createTransferRequest = async (req: Request, res: Response) => {
  try {
    const { productId, batchId, quantity, fromZoneId, toZoneId, priority, reason } = req.body;
    const requestedBy = (req as any).user?._id;
    
    if (!requestedBy) {
      return res.status(401).json({ message: "Необходима авторизация" });
    }
    
    // Проверяем существование продукта, партии и зон
    const [product, batch, fromZone, toZone] = await Promise.all([
      Product.findById(productId),
      Batch.findById(batchId),
      Zone.findById(fromZoneId),
      Zone.findById(toZoneId)
    ]);
    
    if (!product) {
      return res.status(404).json({ message: "Продукт не найден" });
    }
    
    if (!batch) {
      return res.status(404).json({ message: "Партия не найдена" });
    }
    
    if (!fromZone) {
      return res.status(404).json({ message: "Исходная зона не найдена" });
    }
    
    if (!toZone) {
      return res.status(404).json({ message: "Целевая зона не найдена" });
    }
    
    // Проверяем доступность товара в исходной зоне
    if (batch.quantity < quantity) {
      return res.status(400).json({ message: "Недостаточное количество товара в партии" });
    }
    
    // Проверяем наличие места в целевой зоне
    if (!toZone.hasAvailableSpace(quantity)) {
      return res.status(400).json({ message: "Недостаточно места в целевой зоне" });
    }
    
    // Для товаров с особыми условиями хранения проверяем соответствие целевой зоны
    if (product.storageConditions && (
      product.storageConditions.temperature !== undefined || 
      product.storageConditions.humidity !== undefined
    )) {
      const tempRequirement = product.storageConditions.temperature;
      const humidityRequirement = product.storageConditions.humidity;
      
      // Проверка соответствия условий хранения
      if (!toZone.meetsStorageRequirements(tempRequirement, humidityRequirement)) {
        // Создаем предупреждение, но позволяем продолжить
        const alert = new InventoryAlert({
          type: 'quality_issue',
          productId,
          zoneId: toZoneId,
          message: `Несоответствие условий хранения для товара "${product.name}" в зоне "${toZone.name}"`,
          level: 'warning'
        });
        
        await alert.save();
      }
    }
    
    // Создаем запрос на перемещение
    const transferRequest = new ZoneTransferRequest({
      productId,
      batchId,
      quantity,
      fromZoneId,
      toZoneId,
      requestedBy,
      priority: priority || 'normal',
      reason
    });
    
    await transferRequest.save();
    
    res.status(201).json({
      message: "Запрос на перемещение товара успешно создан",
      transferRequest
    });
  } catch (error: any) {
    console.error("Ошибка при создании запроса на перемещение:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

// Получение всех запросов на перемещение
export const getTransferRequests = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Фильтры
    const filters: any = {};
    
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    if (req.query.fromZoneId) {
      filters.fromZoneId = req.query.fromZoneId;
    }
    
    if (req.query.toZoneId) {
      filters.toZoneId = req.query.toZoneId;
    }
    
    if (req.query.priority) {
      filters.priority = req.query.priority;
    }
    
    // Подсчет общего количества запросов
    const totalCount = await ZoneTransferRequest.countDocuments(filters);
    
    // Получение запросов
    const requests = await ZoneTransferRequest.find(filters)
      .sort({ priority: -1, createdAt: 1 })
      .populate('productId', 'name description')
      .populate('batchId', 'batchNumber manufacturingDate expiryDate')
      .populate('fromZoneId', 'name type')
      .populate('toZoneId', 'name type')
      .populate('requestedBy', 'username')
      .populate('approvedBy', 'username')
      .skip(skip)
      .limit(limit);
    
    res.json({
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      requests
    });
  } catch (error: any) {
    console.error("Ошибка при получении запросов на перемещение:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

// Получение запросов на перемещение для конкретной зоны
export const getZoneTransferRequests = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    
    const requests = await ZoneTransferRequest.getRequestsByZone(zoneId);
    
    res.json(requests);
  } catch (error: any) {
    console.error("Ошибка при получении запросов на перемещение для зоны:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

// Подтверждение запроса на перемещение
export const approveTransferRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: "Необходима авторизация" });
    }
    
    const transferRequest = await ZoneTransferRequest.findById(id);
    
    if (!transferRequest) {
      return res.status(404).json({ message: "Запрос на перемещение не найден" });
    }
    
    if (transferRequest.status !== 'pending') {
      return res.status(400).json({ message: `Запрос уже ${transferRequest.status}` });
    }
    
    // Подтверждаем запрос
    await transferRequest.approve(userId);
    
    res.json({
      message: "Запрос на перемещение подтвержден",
      transferRequest
    });
  } catch (error: any) {
    console.error("Ошибка при подтверждении запроса на перемещение:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

// Отклонение запроса на перемещение
export const rejectTransferRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: "Необходима авторизация" });
    }
    
    const transferRequest = await ZoneTransferRequest.findById(id);
    
    if (!transferRequest) {
      return res.status(404).json({ message: "Запрос на перемещение не найден" });
    }
    
    if (transferRequest.status !== 'pending') {
      return res.status(400).json({ message: `Запрос уже ${transferRequest.status}` });
    }
    
    // Отклоняем запрос
    await transferRequest.reject(userId, reason);
    
    res.json({
      message: "Запрос на перемещение отклонен",
      transferRequest
    });
  } catch (error: any) {
    console.error("Ошибка при отклонении запроса на перемещение:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

// Выполнение запроса на перемещение
export const executeTransferRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: "Необходима авторизация" });
    }
    
    const transferRequest = await ZoneTransferRequest.findById(id)
      .populate('productId')
      .populate('batchId')
      .populate('fromZoneId')
      .populate('toZoneId');
    
    if (!transferRequest) {
      return res.status(404).json({ message: "Запрос на перемещение не найден" });
    }
    
    if (transferRequest.status !== 'approved') {
      return res.status(400).json({ 
        message: `Запрос не может быть выполнен, текущий статус: ${transferRequest.status}` 
      });
    }
    
    // Проверяем доступность товара и места снова (на случай изменений с момента одобрения)
    const { batchId, fromZoneId, toZoneId, quantity } = transferRequest;
    
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Партия не найдена" });
    }
    
    if (batch.quantity < quantity) {
      return res.status(400).json({ message: "Недостаточное количество товара в партии" });
    }
    
    const toZone = await Zone.findById(toZoneId);
    if (!toZone) {
      return res.status(404).json({ message: "Целевая зона не найдена" });
    }
    
    if (!toZone.hasAvailableSpace(quantity)) {
      return res.status(400).json({ message: "Недостаточно места в целевой зоне" });
    }
    
    const fromZone = await Zone.findById(fromZoneId);
    if (!fromZone) {
      return res.status(404).json({ message: "Исходная зона не найдена" });
    }
    
    // Создаем запись о перемещении товара
    const movement = new ProductMovement({
      product: transferRequest.productId,
      batch: transferRequest.batchId,
      type: 'transfer',
      quantity: transferRequest.quantity,
      fromZone: transferRequest.fromZoneId,
      toZone: transferRequest.toZoneId,
      performedBy: userId,
      reason: transferRequest.reason,
      reference: `Transfer Request #${transferRequest._id}`
    });
    
    await movement.save();
    
    // Обновляем занятость зон
    await fromZone.updateOccupancy(-transferRequest.quantity);
    await toZone.updateOccupancy(transferRequest.quantity);
    
    // Помечаем запрос как выполненный
    await transferRequest.complete();
    
    res.json({
      message: "Запрос на перемещение успешно выполнен",
      transferRequest,
      movement
    });
  } catch (error: any) {
    console.error("Ошибка при выполнении запроса на перемещение:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
}; 