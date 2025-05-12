import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ZoneProduct from '../models/ZoneProduct';
import Product from '../models/Product';
import Zone from '../models/Zone';
import ProductMovement from '../models/ProductMovement';
import InventoryAlert from '../models/InventoryAlert';
import { ProductInterface, ZoneInterface, ZoneProductInterface } from '../types';

/**
 * Получение всех товаров в конкретной зоне
 */
export const getProductsByZone = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    
    console.log('Getting products for zone:', zoneId);
    
    if (!zoneId || !mongoose.Types.ObjectId.isValid(zoneId)) {
      return res.status(400).json({ message: 'Некорректный ID зоны' });
    }
    
    // Получаем зону и проверяем ее существование
    const zone = await Zone.findById(zoneId);
    if (!zone) {
      return res.status(404).json({ message: 'Зона не найдена' });
    }
    
    // Получаем все записи ZoneProduct для этой зоны с детальной информацией о товарах
    const zoneProducts = await ZoneProduct.find({ zone: zoneId })
      .populate<{ product: ProductInterface }>('product')
      .populate<{ zone: ZoneInterface }>('zone');
    
    console.log(`Found ${zoneProducts.length} products in zone ${zoneId}`);
    
    // Форматируем ответ
    const formattedProducts = zoneProducts.map(zp => {
      // Check if product or zone is undefined
      if (!zp.product || !zp.zone) {
        console.warn(`Warning: Found ZoneProduct with missing product or zone reference:`, zp);
        return null;
      }
      
      return {
        _id: zp._id,
        productId: zp.product._id,
        productName: zp.product.name,
        brandName: zp.product.brandName,
        productModel: zp.product.productModel,
        category: zp.product.category,
        zoneName: zp.zone.name,
        zoneType: zp.zone.type,
        quantity: zp.quantity,
        status: zp.status,
        expiryDate: zp.expiryDate,
        isPromotion: zp.isPromotion,
        promotionEndDate: zp.promotionEndDate,
        createdAt: zp.createdAt,
        updatedAt: zp.updatedAt
      };
    }).filter(Boolean); // Remove null entries
    
    // Считаем общую статистику по зоне
    const totalProducts = formattedProducts.length;
    const totalItems = formattedProducts.reduce((sum, item) => sum + (item?.quantity || 0), 0);
    const expiringProducts = formattedProducts.filter(zp => 
      zp?.expiryDate && new Date(zp.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    res.json({
      zone: zone, // Send the full zone object
      zoneName: zone.name,
      zoneType: zone.type,
      stats: {
        totalProducts,
        totalItems,
        expiringProducts,
        occupancy: `${Math.round((totalItems / (zone.capacity || 1)) * 100)}%`,
        capacityRemaining: (zone.capacity || 0) - totalItems
      },
      products: formattedProducts
    });
  } catch (error: any) {
    console.error('Ошибка при получении товаров зоны:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

/**
 * Получение всех зон, содержащих конкретный товар
 */
export const getZonesByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Некорректный ID товара' });
    }
    
    // Проверяем существование товара
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    
    // Получаем все записи ZoneProduct для этого товара
    const productZones = await ZoneProduct.find({ product: productId })
      .populate<{ zone: ZoneInterface }>('zone')
      .populate<{ product: ProductInterface }>('product');
    
    // Форматируем ответ
    const formattedZones = productZones.map(pz => ({
      _id: pz._id,
      zoneId: pz.zone._id,
      zoneName: pz.zone.name,
      zoneType: pz.zone.type,
      quantity: pz.quantity,
      status: pz.status,
      expiryDate: pz.expiryDate,
      isPromotion: pz.isPromotion
    }));
    
    res.json({
      productName: product.name,
      brandName: product.brandName,
      productModel: product.productModel,
      totalQuantity: productZones.reduce((sum, item) => sum + item.quantity, 0),
      zones: formattedZones
    });
  } catch (error: any) {
    console.error('Ошибка при получении зон товара:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

/**
 * Добавление или обновление товара в зоне
 */
export const addProductToZone = async (req: Request, res: Response) => {
  try {
    const { zoneId, productId, quantity, expiryDate, isPromotion, promotionEndDate } = req.body;
    const userId = (req as any).user?._id;
    
    // Валидация входных данных
    if (!zoneId || !productId || quantity === undefined) {
      return res.status(400).json({ 
        message: 'ID зоны, ID товара и количество обязательны' 
      });
    }
    
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Количество должно быть положительным числом' });
    }
    
    // Проверяем существование зоны и товара
    const [zone, product] = await Promise.all([
      Zone.findById(zoneId),
      Product.findById(productId)
    ]);
    
    if (!zone) {
      return res.status(404).json({ message: 'Зона не найдена' });
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    
    // Проверяем, есть ли место в зоне
    const availableSpace = zone.capacity - zone.currentOccupancy;
    if (quantity > availableSpace) {
      return res.status(400).json({ 
        message: 'Недостаточно места в зоне', 
        availableSpace,
        requested: quantity
      });
    }
    
    // Проверяем соответствие условий хранения товара условиям зоны
    if (product.storageConditions && zone.temperature && zone.humidity) {
      const tempRequirement = product.storageConditions.temperature;
      const humidityRequirement = product.storageConditions.humidity;
      
      if (!zone.meetsStorageRequirements(tempRequirement, humidityRequirement)) {
        // Создаем предупреждение, но разрешаем добавление
        await InventoryAlert.create({
          type: 'quality_issue',
          productId: productId,
          zoneId: zoneId,
          message: `Несоответствие условий хранения для товара "${product.name}" в зоне "${zone.name}"`,
          level: 'warning'
        });
      }
    }
    
    // Проверяем, уже есть ли запись о товаре в этой зоне
    let zoneProduct = await ZoneProduct.findOne({ zone: zoneId, product: productId });
    
    let message = '';
    
    if (zoneProduct) {
      // Обновляем существующую запись
      const oldQuantity = zoneProduct.quantity;
      const quantityDiff = quantity - oldQuantity;
      
      zoneProduct.quantity = quantity;
      
      if (expiryDate) zoneProduct.expiryDate = new Date(expiryDate);
      if (isPromotion !== undefined) zoneProduct.isPromotion = isPromotion;
      if (promotionEndDate) zoneProduct.promotionEndDate = new Date(promotionEndDate);
      
      zoneProduct.lastUpdated = {
        by: userId,
        reason: 'Обновление количества товара в зоне'
      };
      
      await zoneProduct.save();
      
      // Обновляем заполненность зоны
      zone.currentOccupancy += quantityDiff;
      await zone.save();
      
      // Создаем запись о движении товара, если количество изменилось
      if (quantityDiff !== 0) {
        await ProductMovement.create({
          product: productId,
          type: quantityDiff > 0 ? 'receipt' : 'adjustment',
          quantity: Math.abs(quantityDiff),
          fromZone: quantityDiff < 0 ? zoneId : undefined,
          toZone: quantityDiff > 0 ? zoneId : undefined,
          performedBy: userId,
          reason: 'Корректировка количества товара в зоне'
        });
      }
      
      message = 'Товар в зоне успешно обновлен';
    } else {
      // Создаем новую запись
      zoneProduct = new ZoneProduct({
        zone: zoneId,
        product: productId,
        quantity,
        status: 'available',
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        isPromotion: isPromotion || false,
        promotionEndDate: promotionEndDate ? new Date(promotionEndDate) : undefined,
        lastUpdated: {
          by: userId,
          reason: 'Первичное добавление товара в зону'
        }
      });
      
      await zoneProduct.save();
      
      // Обновляем заполненность зоны
      zone.currentOccupancy += quantity;
      await zone.save();
      
      // Создаем запись о движении товара
      await ProductMovement.create({
        product: productId,
        type: 'receipt',
        quantity,
        toZone: zoneId,
        performedBy: userId,
        reason: 'Добавление товара в зону'
      });
      
      message = 'Товар успешно добавлен в зону';
    }
    
    // Проверяем необходимость создания предупреждений
    
    // 1. Предупреждение о сроке годности
    if (expiryDate && new Date(expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      await InventoryAlert.create({
        type: 'expiring_soon',
        productId: productId,
        zoneId: zoneId,
        message: `Товар "${product.name}" в зоне "${zone.name}" истекает ${new Date(expiryDate).toLocaleDateString()}`,
        level: 'warning'
      });
    }
    
    // 2. Предупреждение о низком остатке для торгового зала
    if (zone.type === 'sales' && 
        zone.salesZoneConfig && 
        zone.salesZoneConfig.minStockThreshold && 
        quantity <= zone.salesZoneConfig.minStockThreshold) {
      await InventoryAlert.create({
        type: 'low_stock',
        productId: productId,
        zoneId: zoneId,
        message: `Низкий остаток товара "${product.name}" в торговом зале "${zone.name}"`,
        level: 'info'
      });
    }
    
    // Отправляем результат
    res.status(201).json({
      message,
      zoneProduct: await ZoneProduct.findById(zoneProduct._id)
        .populate('product')
        .populate('zone')
    });
  } catch (error: any) {
    console.error('Ошибка при добавлении товара в зону:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

/**
 * Перемещение товара между зонами
 */
export const moveProductBetweenZones = async (req: Request, res: Response) => {
  try {
    const { productId, fromZoneId, toZoneId, quantity, reason, performedBy: requestPerformedBy } = req.body;
    
    // Get user ID from middleware or request body
    const userId = (req as any).user?._id || requestPerformedBy || null;
    
    console.log('Move product between zones request:', {
      productId, fromZoneId, toZoneId, quantity, reason,
      userId, requestPerformedBy, authUser: (req as any).user?._id
    });
    
    // Валидация входных данных
    if (!productId || !fromZoneId || !toZoneId || quantity === undefined) {
      return res.status(400).json({ 
        message: 'ID товара, ID исходной зоны, ID целевой зоны и количество обязательны' 
      });
    }
    
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Количество должно быть положительным числом' });
    }
    
    if (fromZoneId === toZoneId) {
      return res.status(400).json({ message: 'Исходная и целевая зоны не могут совпадать' });
    }
    
    // Проверяем существование товара и зон
    const [product, fromZone, toZone] = await Promise.all([
      Product.findById(productId),
      Zone.findById(fromZoneId),
      Zone.findById(toZoneId)
    ]);
    
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    
    if (!fromZone) {
      return res.status(404).json({ message: 'Исходная зона не найдена' });
    }
    
    if (!toZone) {
      return res.status(404).json({ message: 'Целевая зона не найдена' });
    }
    
    // Проверяем наличие достаточного количества товара в исходной зоне
    const sourceZoneProduct = await ZoneProduct.findOne({ 
      zone: fromZoneId, 
      product: productId 
    });
    
    if (!sourceZoneProduct || sourceZoneProduct.quantity < quantity) {
      return res.status(400).json({ 
        message: 'Недостаточное количество товара в исходной зоне',
        available: sourceZoneProduct ? sourceZoneProduct.quantity : 0,
        requested: quantity
      });
    }
    
    // Проверяем, есть ли место в целевой зоне
    const availableSpace = toZone.capacity - toZone.currentOccupancy;
    if (quantity > availableSpace) {
      return res.status(400).json({ 
        message: 'Недостаточно места в целевой зоне', 
        availableSpace,
        requested: quantity
      });
    }
    
    // Проверяем соответствие условий хранения товара условиям зоны
    if (product.storageConditions && toZone.temperature && toZone.humidity) {
      const tempRequirement = product.storageConditions.temperature;
      const humidityRequirement = product.storageConditions.humidity;
      
      if (!toZone.meetsStorageRequirements(tempRequirement, humidityRequirement)) {
        // Создаем предупреждение, но разрешаем перемещение
        await InventoryAlert.create({
          type: 'quality_issue',
          productId: productId,
          zoneId: toZoneId,
          message: `Несоответствие условий хранения для товара "${product.name}" в зоне "${toZone.name}"`,
          level: 'warning'
        });
      }
    }
    
    // Обновляем запись в исходной зоне
    sourceZoneProduct.quantity -= quantity;
    sourceZoneProduct.lastUpdated = {
      by: userId,
      reason: reason || 'Перемещение товара в другую зону'
    };
    
    // Проверяем/создаем запись в целевой зоне
    let targetZoneProduct = await ZoneProduct.findOne({ 
      zone: toZoneId, 
      product: productId 
    });
    
    if (targetZoneProduct) {
      // Обновляем существующую запись
      targetZoneProduct.quantity += quantity;
      targetZoneProduct.lastUpdated = {
        by: userId,
        reason: reason || 'Перемещение товара из другой зоны'
      };
    } else {
      // Создаем новую запись
      targetZoneProduct = new ZoneProduct({
        zone: toZoneId,
        product: productId,
        quantity,
        status: 'available',
        expiryDate: sourceZoneProduct.expiryDate,
        isPromotion: sourceZoneProduct.isPromotion,
        promotionEndDate: sourceZoneProduct.promotionEndDate,
        lastUpdated: {
          by: userId,
          reason: reason || 'Перемещение товара из другой зоны'
        }
      });
    }
    
    // Создаем запись о движении товара
    const movement = new ProductMovement({
      product: productId,
      type: 'transfer',
      quantity,
      fromZone: fromZoneId,
      toZone: toZoneId,
      performedBy: userId,
      reason: reason || 'Перемещение товара между зонами',
      reference: `Перемещение ${quantity} ед. товара "${product.name}" из зоны "${fromZone.name}" в зону "${toZone.name}"`
    });
    
    // Сохраняем все изменения в базе данных
    await Promise.all([
      // Если количество в исходной зоне стало 0, удаляем запись
      sourceZoneProduct.quantity > 0 ? sourceZoneProduct.save() : ZoneProduct.deleteOne({ _id: sourceZoneProduct._id }),
      targetZoneProduct.save(),
      fromZone.updateOccupancy(-quantity),
      toZone.updateOccupancy(quantity),
      movement.save()
    ]);
    
    // Специальные проверки для разных типов зон
    
    // 1. Проверка для торгового зала (минимальный остаток)
    if (toZone.type === 'sales' && 
        toZone.salesZoneConfig && 
        toZone.salesZoneConfig.minStockThreshold && 
        targetZoneProduct.quantity <= toZone.salesZoneConfig.minStockThreshold) {
      await InventoryAlert.create({
        type: 'low_stock',
        productId: productId,
        zoneId: toZoneId,
        message: `Низкий остаток товара "${product.name}" в торговом зале "${toZone.name}"`,
        level: 'info'
      });
    }
    
    // 2. Проверка заполненности зоны (если осталось мало места)
    if (toZone.capacity - toZone.currentOccupancy < 0.1 * toZone.capacity) {
      await InventoryAlert.create({
        type: 'zone_capacity',
        zoneId: toZoneId,
        message: `Зона "${toZone.name}" почти заполнена (${Math.round((toZone.currentOccupancy / toZone.capacity) * 100)}%)`,
        level: 'info'
      });
    }
    
    res.json({
      message: 'Товар успешно перемещен между зонами',
      sourceZoneProduct: sourceZoneProduct.quantity > 0 ? sourceZoneProduct : null,
      targetZoneProduct,
      movement
    });
  } catch (error: any) {
    console.error('Ошибка при перемещении товара между зонами:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

/**
 * Удаление товара из зоны
 */
export const removeProductFromZone = async (req: Request, res: Response) => {
  try {
    const { zoneId, productId } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?._id;
    
    // Проверяем существование записи
    const zoneProduct = await ZoneProduct.findOne({ 
      zone: zoneId, 
      product: productId 
    })
      .populate<{ product: ProductInterface }>('product')
      .populate<{ zone: ZoneInterface }>('zone');
    
    if (!zoneProduct) {
      return res.status(404).json({ message: 'Товар не найден в указанной зоне' });
    }
    
    // Получаем информацию о продукте и зоне для записи в журнал
    const productName = zoneProduct.product.name;
    const zoneName = zoneProduct.zone.name;
    const quantity = zoneProduct.quantity;
    
    // Обновляем заполненность зоны
    const zone = await Zone.findById(zoneId);
    if (zone) {
      zone.currentOccupancy = Math.max(0, zone.currentOccupancy - quantity);
      await zone.save();
    }
    
    // Создаем запись о движении товара
    await ProductMovement.create({
      product: productId,
      type: 'writeoff',
      quantity,
      fromZone: zoneId,
      performedBy: userId,
      reason: reason || 'Удаление товара из зоны',
      reference: `Удаление ${quantity} ед. товара "${productName}" из зоны "${zoneName}"`
    });
    
    // Удаляем запись
    await ZoneProduct.deleteOne({ _id: zoneProduct._id });
    
    res.json({
      message: 'Товар успешно удален из зоны',
      details: {
        productName,
        zoneName,
        quantity
      }
    });
  } catch (error: any) {
    console.error('Ошибка при удалении товара из зоны:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

/**
 * Получение товаров с истекающим сроком годности
 */
export const getExpiringProducts = async (req: Request, res: Response) => {
  try {
    // Дни до истечения срока годности (по умолчанию 7 дней)
    const daysThreshold = parseInt(req.query.days as string) || 7;
    
    // Получаем текущую дату и дату через daysThreshold дней
    const today = new Date();
    const expiryThreshold = new Date(today.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
    
    // Находим товары с истекающим сроком годности
    const expiringProducts = await ZoneProduct.find({
      expiryDate: { $ne: null, $lte: expiryThreshold, $gte: today }
    })
      .populate<{ product: ProductInterface }>('product')
      .populate<{ zone: ZoneInterface }>('zone')
      .sort({ expiryDate: 1 });
    
    // Форматируем результат
    const formattedProducts = expiringProducts.map(zp => ({
      _id: zp._id,
      productId: zp.product._id,
      productName: zp.product.name,
      zoneName: zp.zone.name,
      zoneType: zp.zone.type,
      quantity: zp.quantity,
      expiryDate: zp.expiryDate,
      daysRemaining: zp.expiryDate ? Math.ceil((new Date(zp.expiryDate).getTime() - today.getTime()) / (24 * 60 * 60 * 1000)) : 0
    }));
    
    res.json({
      expiringCount: formattedProducts.length,
      threshold: `${daysThreshold} дней`,
      products: formattedProducts
    });
  } catch (error: any) {
    console.error('Ошибка при получении товаров с истекающим сроком годности:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

/**
 * Получение товаров с низким остатком в торговых залах
 */
export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    // Получаем все зоны типа "sales"
    const salesZones = await Zone.find({ type: 'sales' });
    
    // Массив для хранения товаров с низким остатком
    const lowStockProducts = [];
    
    // Для каждой зоны получаем товары с количеством меньше минимального порога
    for (const zone of salesZones) {
      const threshold = zone.salesZoneConfig?.minStockThreshold || 5;
      
      const zoneProducts = await ZoneProduct.find({
        zone: zone._id,
        quantity: { $lte: threshold }
      })
        .populate<{ product: ProductInterface }>('product')
        .populate<{ zone: ZoneInterface }>('zone');
      
      lowStockProducts.push(...zoneProducts);
    }
    
    // Форматируем результат
    const formattedProducts = lowStockProducts.map(zp => ({
      _id: zp._id,
      productId: zp.product._id,
      productName: zp.product.name,
      zoneName: zp.zone.name,
      quantity: zp.quantity,
      threshold: zp.zone.salesZoneConfig?.minStockThreshold || 5
    }));
    
    res.json({
      lowStockCount: formattedProducts.length,
      products: formattedProducts
    });
  } catch (error: any) {
    console.error('Ошибка при получении товаров с низким остатком:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
}; 