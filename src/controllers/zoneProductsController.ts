import { Request, Response } from 'express';
import Product from '../models/Product';
import Batch from '../models/Batch';
import Zone from '../models/Zone';
import ProductMovement from '../models/ProductMovement';

// Получить товары с их текущим местоположением (по партиям и последнему перемещению)
export const getZoneProducts = async (req: Request, res: Response) => {
  try {
    // 1. Получаем все партии с полной информацией
    const batches = await Batch.find()
      .populate('product')
      .populate('zone');

    // 2. Для каждой партии формируем подробную информацию
    const result = await Promise.all(batches.map(async (batch) => {
      // Найти последнее перемещение для этой партии
      const lastMove = await ProductMovement.findOne({ batch: batch._id })
        .sort({ createdAt: -1 })
        .populate('fromZone')
        .populate('toZone');

      // Определяем текущую зону (приоритет у последнего перемещения)
      let currentZone = batch.zone;
      if (lastMove && lastMove.toZone) {
        currentZone = lastMove.toZone;
      }

      // Определяем статус
      let status = batch.status || 'active';
      if (batch.expiryDate && new Date(batch.expiryDate) < new Date()) {
        status = 'expired';
      }

      // Получаем подробную информацию о продукте
      let productData: any = { 
        _id: null, 
        name: 'Неизвестный товар',
        brandName: '',
        description: '',
        model: '',
        category: ''
      };
      
      try {
        // If batch.product is populated, use it directly
        if (typeof batch.product === 'object' && batch.product !== null) {
          productData = batch.product;
        } 
        // If not populated, fetch it manually
        else if (batch.product) {
          const product = await Product.findById(batch.product);
          if (product) {
            productData = product;
          }
        }
      } catch (err) {
        console.error('Failed to get product details:', err);
      }

      // Получаем информацию о зоне
      let zoneData: any = { 
        _id: null, 
        name: 'Неизвестная зона', 
        type: 'unknown' 
      };
      
      try {
        if (typeof currentZone === 'object' && currentZone !== null) {
          zoneData = currentZone;
        } else if (currentZone) {
          const zone = await Zone.findById(currentZone);
          if (zone) {
            zoneData = zone;
          }
        }
      } catch (err) {
        console.error('Failed to get zone details:', err);
      }

      // Ensure proper display name for product
      const productName = productData.name || 
                         (productData.brandName ? `${productData.brandName} ${productData.model || ''}`.trim() : 
                         `Партия ${batch.batchNumber}`);

      // Формируем полный объект с информацией
      return {
        // Информация о продукте
        productId: productData._id || batch.product,
        name: productName,
        brandName: productData.brandName || '',
        description: productData.description || '',
        model: productData.model || productData.productModel || '',
        category: productData.category || '',
        
        // Информация о партии
        batchId: batch._id,
        batchNumber: batch.batchNumber,
        quantity: batch.quantity,
        manufacturingDate: batch.manufacturingDate,
        expiryDate: batch.expiryDate,
        purchasePrice: batch.purchasePrice,
        
        // Информация о зоне
        zoneId: zoneData._id || currentZone,
        zoneName: zoneData.name,
        zoneType: zoneData.type,
        
        // Дополнительная информация
        status,
        supplier: batch.supplier,
        notes: batch.notes,
      };
    }));

    res.json(result);
  } catch (err) {
    console.error('Error in getZoneProducts:', err);
    res.status(500).json({ message: 'Ошибка получения товаров по зонам', error: err });
  }
}; 