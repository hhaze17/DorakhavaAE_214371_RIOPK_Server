import { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import Product from "../models/Product";
import Batch from "../models/Batch";
import ProductMovement from "../models/ProductMovement";
import Zone from "../models/Zone";

interface ProductRequestBody {
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
}

export const getAllProductsController = async (req: Request, res: Response) => {
  try {
    const ITEMS_PER_PAGE = 5;
    const page: any = req.query.page || 1;
    const query = {};
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const countPromise = Product.estimatedDocumentCount(query);
    const itemsPromise = Product.find(query).limit(ITEMS_PER_PAGE).skip(skip);
    const [count, items] = await Promise.all([countPromise, itemsPromise]);
    const pageCount = count / ITEMS_PER_PAGE;
    const result = pageCount - Math.floor(pageCount);

    return res.status(200).json({
      pagination: {
        count,
        pageCount: result > 0 ? Math.trunc(pageCount) + 1 : pageCount,
      },
      items,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const body = req.body as unknown as ProductRequestBody;
    // Валидация входящих данных
    if (!body.name || !body.category || !body.price || !body.zone) {
      return res.status(400).json({ 
        message: 'Недостаточно данных для создания продукта', 
        requiredFields: ['name', 'category', 'price', 'zone'] 
      });
    }
    const product = await Product.create(body);
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Ошибка создания продукта:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Ошибка валидации данных', 
        details: error.errors 
      });
    }
    res.status(500).json({ 
      message: 'Ошибка сервера при создании продукта', 
      error: error.message 
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const body = req.body as unknown as Partial<ProductRequestBody>;
    if (body.zone && !mongoose.Types.ObjectId.isValid(body.zone as any)) {
      return res.status(400).json({ message: 'Некорректный ObjectId зоны' });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }
    res.json({ message: 'Продукт успешно удален' });
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const getProductsByZone = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    
    if (!zoneId || !mongoose.Types.ObjectId.isValid(zoneId)) {
      return res.status(400).json({ message: 'Неверный ID зоны' });
    }
    
    // Получаем все товары, хранящиеся в указанной зоне
    // Сначала проверяем товары по полю zone
    const productsByZone = await Product.find({ zone: zoneId });
    
    // Также проверяем батчи в этой зоне и получаем их продукты
    const batches = await Batch.find({ zone: zoneId }).populate('product');
    
    // Объединяем результаты, исключая дубликаты
    const productIds = new Set(productsByZone.map(p => p._id.toString()));
    const allProducts = [...productsByZone];
    
    batches.forEach(batch => {
      if (batch.product && typeof batch.product !== 'string' && '_id' in batch.product) {
        const productDoc = batch.product as any;
        if (!productIds.has(productDoc._id.toString())) {
          allProducts.push(productDoc);
          productIds.add(productDoc._id.toString());
        }
      }
    });
    
    res.json(allProducts);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const getLowStockProducts = async (req: Request, res: Response) => {
  try {
    const threshold = req.query.threshold ? Number(req.query.threshold) : 10;
    const products = await Product.find({ quantity: { $lt: threshold } });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const moveProduct = async (req: Request, res: Response) => {
  try {
    const { productId, fromZone, toZone, quantity, reason } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Недостаточное количество продукта' });
    }
    product.zone = toZone;
    await product.save();
    // Запись движения продукта
    await ProductMovement.create({
      product: productId,
      fromZone,
      toZone,
      quantity,
      reason,
      performedBy: req.body.decoded?._id || 'unknown'
    });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const updateProductStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProductQuantity = async (req: Request, res: Response) => {
  try {
    const { quantity } = req.body as { quantity: number };
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }

    await product.updateQuantity(quantity);
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brandName: { $regex: query, $options: 'i' } },
        { productModel: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};
