import { Request, Response } from "express";
import Batch from "../models/Batch";
import Product from "../models/Product";
import Zone from "../models/Zone";
import { ProductMovement } from '../models/productMovementModel';

interface BatchRequestBody {
  product: string;
  batchNumber: string;
  quantity: number;
  manufacturingDate: Date;
  expiryDate: Date;
  zone: string;
  status: 'active' | 'expired' | 'depleted' | 'recalled';
  supplier: {
    name: string;
    contact: string;
  };
  purchasePrice: number;
  notes?: string;
}

export const createBatch = async (req: Request, res: Response) => {
  try {
    const body = req.body as unknown as BatchRequestBody;
    
    // Проверка существования продукта
    const product = await Product.findById(body.product);
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }

    // Проверка существования зоны
    const zone = await Zone.findById(body.zone);
    if (!zone) {
      return res.status(404).json({ message: 'Зона не найдена' });
    }

    // Проверка доступного места в зоне
    if (zone.currentOccupancy + body.quantity > zone.capacity) {
      return res.status(400).json({ message: 'Недостаточно места в зоне' });
    }

    const batch = await Batch.create(body);

    // Создание записи о движении
    const movement = new ProductMovement({
      product: body.product,
      fromZone: null,
      toZone: body.zone,
      quantity: body.quantity,
      type: 'transfer',
      date: new Date(),
    });
    await movement.save();

    // Обновление количества продукта
    await Product.findByIdAndUpdate(body.product, {
      $inc: { quantity: body.quantity }
    });

    // Обновление занятости зоны
    await Zone.findByIdAndUpdate(body.zone, {
      $inc: { currentOccupancy: body.quantity }
    });

    res.status(201).json(batch);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const getBatches = async (req: Request, res: Response) => {
  try {
    const batches = await Batch.find()
      .populate('product', 'name brandName model')
      .populate('zone', 'name type');
    res.json(batches);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const getBatchById = async (req: Request, res: Response) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('product', 'name brandName model')
      .populate('zone', 'name type');
    if (!batch) {
      return res.status(404).json({ message: 'Партия не найдена' });
    }
    res.json(batch);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const updateBatch = async (req: Request, res: Response) => {
  try {
    const body = req.body as unknown as Partial<BatchRequestBody>;
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    ).populate('product', 'name brandName model')
     .populate('zone', 'name type');

    if (!batch) {
      return res.status(404).json({ message: 'Партия не найдена' });
    }
    res.json(batch);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const deleteBatch = async (req: Request, res: Response) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Партия не найдена' });
    }

    // Обновление количества продукта
    await Product.findByIdAndUpdate(batch.product, {
      $inc: { quantity: -batch.quantity }
    });

    // Обновление занятости зоны
    await Zone.findByIdAndUpdate(batch.zone, {
      $inc: { currentOccupancy: -batch.quantity }
    });

    res.json({ message: 'Партия успешно удалена' });
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const getBatchesByProduct = async (req: Request, res: Response) => {
  try {
    const batches = await Batch.find({ product: req.params.productId })
      .populate('zone', 'name type');
    res.json(batches);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const getBatchesByZone = async (req: Request, res: Response) => {
  try {
    const batches = await Batch.find({ zone: req.params.zoneId })
      .populate('product', 'name brandName model');
    res.json(batches);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const getExpiringBatches = async (req: Request, res: Response) => {
  try {
    const { days } = req.query;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(days));

    const batches = await Batch.find({
      expiryDate: { $lte: expiryDate },
      status: 'active'
    });
    res.status(200).json(batches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const moveBatch = async (req: Request, res: Response) => {
  try {
    const { batchId, toZone } = req.body;
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ message: 'Партия не найдена' });
    }

    const zone = await Zone.findById(toZone);
    if (!zone) {
      return res.status(404).json({ message: 'Зона не найдена' });
    }

    // Проверка вместимости зоны
    if (zone.currentOccupancy + batch.quantity > zone.capacity) {
      return res.status(400).json({ message: 'Недостаточно места в зоне' });
    }

    // Создание записи о движении
    const movement = new ProductMovement({
      product: batch.product,
      fromZone: batch.zone,
      toZone: toZone,
      quantity: batch.quantity,
      type: 'transfer',
      date: new Date(),
    });
    await movement.save();

    // Обновление зон
    const oldZone = await Zone.findById(batch.zone);
    if (oldZone) {
      oldZone.currentOccupancy -= batch.quantity;
      await oldZone.save();
    }

    zone.currentOccupancy += batch.quantity;
    await zone.save();

    // Обновление партии
    batch.zone = toZone;
    await batch.save();

    res.json({ message: 'Партия успешно перемещена', batch });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при перемещении партии', error });
  }
};

export const sellBatch = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ message: 'Партия не найдена' });
    }

    // Создание записи о движении
    const movement = new ProductMovement({
      product: batch.product,
      fromZone: batch.zone,
      toZone: null,
      quantity: batch.quantity,
      type: 'sale',
      date: new Date(),
    });
    await movement.save();

    // Обновление зоны
    const zone = await Zone.findById(batch.zone);
    if (zone) {
      zone.currentOccupancy -= batch.quantity;
      await zone.save();
    }

    // Обновление количества продукта
    await Product.findByIdAndUpdate(batch.product, {
      $inc: { quantity: -batch.quantity }
    });

    // Обновление партии
    batch.status = 'depleted';
    await batch.save();

    res.json({ message: 'Партия успешно продана', batch });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при продаже партии', error });
  }
};

export const updateBatchQuantity = async (req: Request, res: Response) => {
  try {
    const { quantity } = req.body as { quantity: number };
    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({ message: 'Партия не найдена' });
    }

    const quantityDiff = quantity - batch.quantity;

    // Проверка доступного места в зоне
    const zone = await Zone.findById(batch.zone);
    if (!zone) {
      return res.status(404).json({ message: 'Зона не найдена' });
    }

    if (zone.currentOccupancy + quantityDiff > zone.capacity) {
      return res.status(400).json({ message: 'Недостаточно места в зоне' });
    }

    // Создание записи о движении
    const movement = new ProductMovement({
      product: batch.product,
      fromZone: batch.zone,
      toZone: batch.zone,
      quantity: quantityDiff,
      type: 'transfer',
      date: new Date(),
    });
    await movement.save();

    // Обновление партии
    batch.quantity = quantity;
    if (quantity === 0) {
      batch.status = 'depleted';
    }
    await batch.save();

    // Обновление количества продукта
    await Product.findByIdAndUpdate(batch.product, {
      $inc: { quantity: quantityDiff }
    });

    // Обновление занятости зоны
    await Zone.findByIdAndUpdate(batch.zone, {
      $inc: { currentOccupancy: quantityDiff }
    });

    res.json(batch);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
}; 