import { Request, Response } from "express";
import mongoose from "mongoose";
import Sale from "../models/Sale";
import StoreInventory from "../models/StoreInventory";
import { AuthRequest } from "../types";

export const getAllSalesController = async (req: AuthRequest, res: Response) => {
  try {
    const ITEMS_PER_PAGE = 10;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;
    
    // Формируем запрос в зависимости от роли и магазина пользователя
    let query = {};
    if (req.user?.levelOfAccess === 'Сотрудник' && req.user?.store) {
      query = { nameOfStore: req.user.store };
    }
    
    const [count, items] = await Promise.all([
      Sale.countDocuments(query),
      Sale.find(query)
        .sort({ dateOfTransaction: -1 })
        .skip(skip)
        .limit(ITEMS_PER_PAGE)
    ]);
    
    const pageCount = Math.ceil(count / ITEMS_PER_PAGE);
    
    res.json({
      pagination: {
        count,
        pageCount
      },
      items
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSaleController = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    
    // Проверяем наличие товара в магазине
    const query = { 
      store: req.user?.store,
      productId 
    };
    
    const existingProduct = await StoreInventory.findOne(query);
    if (!existingProduct) {
      return res.status(404).json({ message: "Товар не найден" });
    }
    
    if (quantity > existingProduct.quantity) {
      return res.status(400).json({ message: "Недостаточное количество товара" });
    }
    
    // Извлекаем числовое значение цены, убирая " BYN" из строки
    const priceValue = parseFloat(existingProduct.storePrice.replace(" BYN", ""));
    const totalPrice = (priceValue * quantity).toFixed(2) + " BYN";
    
    // Обновляем количество товара в магазине
    await StoreInventory.findByIdAndUpdate(
      existingProduct._id,
      { 
        $inc: { quantity: -quantity },
        updatedAt: new Date()
      }
    );
    
    // Создаем запись о продаже
    const sale = await Sale.create({
      dateOfTransaction: new Date(),
      productId,
      brandName: existingProduct.brandName,
      description: existingProduct.description,
      model: existingProduct.model,
      quantity,
      totalPrice,
      nameOfStore: existingProduct.store,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    res.status(201).json(sale);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSaleById = async (req: Request, res: Response) => {
  try {
    const sale = await Sale.findById(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ message: "Продажа не найдена" });
    }
    
    res.json(sale);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSaleController = async (req: AuthRequest, res: Response) => {
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    
    if (!sale) {
      return res.status(404).json({ message: "Продажа не найдена" });
    }
    
    res.json(sale);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSaleController = async (req: Request, res: Response) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ message: "Продажа не найдена" });
    }
    
    res.json({ message: "Продажа успешно удалена" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
