import { Request, Response } from "express";
import ExpiryTracking from "../models/ExpiryTracking";
import Product from "../models/Product";
import Batch from "../models/Batch";
import Zone from "../models/Zone";
import InventoryAlert from "../models/InventoryAlert";
import mongoose from 'mongoose';

interface ExpiryAlert {
  _id: string;
  product: any;
  batch: any;
  zone: any;
  daysUntilExpiry: number;
  expiryDate: Date;
  quantity: number;
  status: string;
  isProcessed: boolean;
}

// Получение всех товаров с истекающим сроком годности
export const getExpiringProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 10, page = 1, sort = 'expiryDate:1', status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Проверяем, что есть батчи с информацией о сроке годности
    const batches = await Batch.find({
      expiryDate: { $exists: true, $ne: null }
    })
    .populate('product', 'name brandName productModel')
    .populate('zone', 'name type')
    .sort({ expiryDate: 1 })
    .lean();
    
    if (!batches.length) {
      return res.status(200).json({
        totalCount: 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: 0,
        expiringProducts: []
      });
    }
    
    // Преобразуем в структуру для ответа
    const currentDate = new Date();
    let expiringProducts: ExpiryAlert[] = [];
    
    for (const batch of batches) {
      if (batch.expiryDate) {
        const daysUntilExpiry = Math.floor((batch.expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        let expiryStatus = 'normal';
        
        if (daysUntilExpiry <= 0) {
          expiryStatus = 'expired';
        } else if (daysUntilExpiry <= 7) {
          expiryStatus = 'warning';
        } else if (daysUntilExpiry <= 14) {
          expiryStatus = 'attention';
        }
        
        // Применяем фильтр по статусу, если указан
        if (status && status !== expiryStatus) {
          continue;
        }
        
        expiringProducts.push({
          _id: batch._id.toString(),
          product: batch.product,
          batch: {
            _id: batch._id,
            batchNumber: batch.batchNumber,
            manufacturingDate: batch.manufacturingDate
          },
          zone: batch.zone,
          daysUntilExpiry,
          expiryDate: batch.expiryDate,
          quantity: batch.quantity,
          status: expiryStatus,
          isProcessed: false
        });
      }
    }
    
    // Сортировка
    const [sortField, sortOrder] = (sort as string).split(':');
    expiringProducts.sort((a, b) => {
      if (sortField === 'expiryDate') {
        return (sortOrder === '1' ? 1 : -1) * (a.expiryDate.getTime() - b.expiryDate.getTime());
      } else if (sortField === 'daysUntilExpiry') {
        return (sortOrder === '1' ? 1 : -1) * (a.daysUntilExpiry - b.daysUntilExpiry);
      }
      return 0;
    });
    
    // Пагинация
    const paginatedProducts = expiringProducts.slice(skip, skip + Number(limit));
    
    res.status(200).json({
      totalCount: expiringProducts.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(expiringProducts.length / Number(limit)),
      expiringProducts: paginatedProducts
    });
  } catch (error) {
    console.error('Error getting expiring products:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Получение товаров с истекающим сроком годности по зоне
export const getZoneExpiringProducts = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    
    if (!zoneId) {
      return res.status(400).json({ message: 'Zone ID is required' });
    }
    
    // Находим батчи в указанной зоне с информацией о сроке годности
    const batches = await Batch.find({
      zone: zoneId,
      expiryDate: { $exists: true, $ne: null }
    })
    .populate('product', 'name brandName productModel')
    .populate('zone', 'name type')
    .sort({ expiryDate: 1 })
    .lean();
    
    // Преобразуем в структуру для ответа
    const currentDate = new Date();
    const expiringProducts: ExpiryAlert[] = [];
    
    for (const batch of batches) {
      if (batch.expiryDate) {
        const daysUntilExpiry = Math.floor((batch.expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        let expiryStatus = 'normal';
        
        if (daysUntilExpiry <= 0) {
          expiryStatus = 'expired';
        } else if (daysUntilExpiry <= 7) {
          expiryStatus = 'warning';
        } else if (daysUntilExpiry <= 14) {
          expiryStatus = 'attention';
        }
        
        // Добавляем только те, которые скоро истекут или уже истекли
        if (daysUntilExpiry <= 14) {
          expiringProducts.push({
            _id: batch._id.toString(),
            product: batch.product,
            batch: {
              _id: batch._id,
              batchNumber: batch.batchNumber,
              manufacturingDate: batch.manufacturingDate
            },
            zone: batch.zone,
            daysUntilExpiry,
            expiryDate: batch.expiryDate,
            quantity: batch.quantity,
            status: expiryStatus,
            isProcessed: false
          });
        }
      }
    }
    
    res.status(200).json(expiringProducts);
  } catch (error) {
    console.error('Error getting zone expiring products:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Обработка товара с истекающим сроком годности
export const processExpiringProduct = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    const { action, quantity } = req.body;
    
    if (!batchId) {
      return res.status(400).json({ message: 'Batch ID is required' });
    }
    
    if (!action) {
      return res.status(400).json({ message: 'Action is required' });
    }
    
    // Находим партию
    const batch = await Batch.findById(batchId);
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    // Выполняем соответствующее действие
    switch (action) {
      case 'discount':
        // Применение скидки к товару (просто пример, в реальности нужно обновить цену)
        res.status(200).json({ 
          message: 'Discount applied successfully',
          discountPercentage: req.body.discountPercentage || 15
        });
        break;
        
      case 'move_to_returns':
        // Перемещение в зону возвратов (нужно создать перемещение товара)
        res.status(200).json({ 
          message: 'Product moved to returns zone'
        });
        break;
        
      case 'write_off':
        // Списание товара (нужно уменьшить количество)
        res.status(200).json({ 
          message: 'Product written off'
        });
        break;
        
      default:
        res.status(400).json({ message: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error processing expiring product:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};

// Создание записи о сроке годности
export const createExpiryTracking = async (req: Request, res: Response) => {
  try {
    const { productId, batchId, zoneId, quantity } = req.body;
    
    // Проверяем существование продукта, партии и зоны
    const [product, batch, zone] = await Promise.all([
      Product.findById(productId),
      Batch.findById(batchId),
      Zone.findById(zoneId)
    ]);
    
    if (!product) {
      return res.status(404).json({ message: "Продукт не найден" });
    }
    
    if (!batch) {
      return res.status(404).json({ message: "Партия не найдена" });
    }
    
    if (!zone) {
      return res.status(404).json({ message: "Зона не найдена" });
    }
    
    // Создаем запись о сроке годности
    const expiryTracking = new ExpiryTracking({
      productId,
      batchId,
      expiryDate: batch.expiryDate,
      zoneId,
      quantity
    });
    
    await expiryTracking.save();
    
    // Проверяем, не истекает ли скоро срок годности
    const now = new Date();
    const expiryDate = new Date(batch.expiryDate);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Если срок годности менее 30 дней, создаем предупреждение
    if (daysUntilExpiry <= 30) {
      const level = daysUntilExpiry <= 7 ? 'critical' : (daysUntilExpiry <= 15 ? 'warning' : 'info');
      
      // Создаем уведомление
      const alert = new InventoryAlert({
        type: 'expiring_soon',
        productId,
        batchId,
        zoneId,
        message: `Товар "${product.name}" (партия ${batch.batchNumber}) истекает через ${daysUntilExpiry} дней`,
        level
      });
      
      await alert.save();
    }
    
    res.status(201).json({
      message: "Запись о сроке годности успешно создана",
      expiryTracking
    });
  } catch (error: any) {
    console.error("Ошибка при создании записи о сроке годности:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

// Обновление записи о сроке годности
export const updateExpiryTracking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, notificationSent } = req.body;
    
    const expiryTracking = await ExpiryTracking.findById(id);
    
    if (!expiryTracking) {
      return res.status(404).json({ message: "Запись не найдена" });
    }
    
    // Обновляем поля
    if (quantity !== undefined) {
      expiryTracking.quantity = quantity;
    }
    
    if (notificationSent !== undefined) {
      expiryTracking.notificationSent = notificationSent;
    }
    
    await expiryTracking.save();
    
    res.json({
      message: "Запись о сроке годности успешно обновлена",
      expiryTracking
    });
  } catch (error: any) {
    console.error("Ошибка при обновлении записи о сроке годности:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

// Удаление записи о сроке годности
export const deleteExpiryTracking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const expiryTracking = await ExpiryTracking.findByIdAndDelete(id);
    
    if (!expiryTracking) {
      return res.status(404).json({ message: "Запись не найдена" });
    }
    
    res.json({ message: "Запись о сроке годности успешно удалена" });
  } catch (error: any) {
    console.error("Ошибка при удалении записи о сроке годности:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
}; 