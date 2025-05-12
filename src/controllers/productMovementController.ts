import { Request, Response } from "express";
import mongoose from "mongoose";
import ProductMovement from "../models/ProductMovement";
import Product from "../models/Product";
import Batch from "../models/Batch";
import Zone from "../models/Zone";

export const createProductMovement = async (req: Request, res: Response) => {
  const { product, batch, type, quantity, fromZone, toZone, reason, reference } = req.body;
  
  try {
    // Validate the data
    if (!product || !batch || !type || !quantity) {
      return res.status(400).json({ message: "Необходимо указать продукт, партию, тип и количество" });
    }
    
    // Check if the batch exists and has enough quantity
    const batchDoc = await Batch.findById(batch);
    if (!batchDoc) {
      return res.status(404).json({ message: "Партия не найдена" });
    }
    
    if (batchDoc.quantity < quantity) {
      return res.status(400).json({ message: "Недостаточное количество товара в партии" });
    }
    
    // For zone transfers, check both zones
    if (type === 'transfer' || type === 'receipt' || type === 'online_order') {
      if (!fromZone || !toZone) {
        return res.status(400).json({ message: "Для перемещения необходимо указать исходную и целевую зоны" });
      }
      
      const [fromZoneDoc, toZoneDoc] = await Promise.all([
        Zone.findById(fromZone),
        Zone.findById(toZone)
      ]);
      
      if (!fromZoneDoc) {
        return res.status(404).json({ message: "Исходная зона не найдена" });
      }
      
      if (!toZoneDoc) {
        return res.status(404).json({ message: "Целевая зона не найдена" });
      }
      
      // Check if the target zone has enough capacity
      const newOccupancy = toZoneDoc.currentOccupancy + quantity;
      if (newOccupancy > toZoneDoc.capacity) {
        return res.status(400).json({ 
          message: "Недостаточно места в целевой зоне",
          details: {
            currentOccupancy: toZoneDoc.currentOccupancy,
            capacity: toZoneDoc.capacity,
            required: quantity
          }
        });
      }
      
      // Update the source zone's occupancy
      fromZoneDoc.currentOccupancy = Math.max(0, fromZoneDoc.currentOccupancy - quantity);
      await fromZoneDoc.save();
      
      // Update the target zone's occupancy
      toZoneDoc.currentOccupancy += quantity;
      await toZoneDoc.save();
    }
    
    // For sales and expired, we only reduce the from zone
    if (type === 'sale' || type === 'expired' || type === 'adjustment') {
      if (!fromZone) {
        return res.status(400).json({ message: "Необходимо указать исходную зону" });
      }
      
      const fromZoneDoc = await Zone.findById(fromZone);
      if (!fromZoneDoc) {
        return res.status(404).json({ message: "Исходная зона не найдена" });
      }
      
      // Update the source zone's occupancy
      fromZoneDoc.currentOccupancy = Math.max(0, fromZoneDoc.currentOccupancy - quantity);
      await fromZoneDoc.save();
    }
    
    // Update the batch quantity
    if (type === 'transfer' || type === 'online_order') {
      // For transfers, we're just moving the batch, not changing its quantity
    } else if (type === 'sale' || type === 'expired' || type === 'adjustment') {
      // For sales and expiry, reduce the batch quantity
      batchDoc.quantity -= quantity;
      await batchDoc.save();
    }
    
    // Create the movement record
    const movement = new ProductMovement({
      product,
      batch,
      type,
      quantity,
      fromZone,
      toZone,
      performedBy: (req as any).user?._id || null, // Get the user from the auth middleware
      reason,
      reference
    });
    
    await movement.save();

    // Return the created movement
    res.status(201).json({
      message: "Перемещение товара успешно создано",
      movement
    });
    
  } catch (error: any) {
    console.error("Ошибка при создании перемещения:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const getProductMovements = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Build the filter
    const filter: any = {};
    
    if (req.query.product) {
      filter.product = new mongoose.Types.ObjectId(req.query.product as string);
    }
    
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    if (req.query.fromZone) {
      filter.fromZone = new mongoose.Types.ObjectId(req.query.fromZone as string);
    }
    
    if (req.query.toZone) {
      filter.toZone = new mongoose.Types.ObjectId(req.query.toZone as string);
    }
    
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      
      if (req.query.dateFrom) {
        filter.createdAt.$gte = new Date(req.query.dateFrom as string);
      }
      
      if (req.query.dateTo) {
        filter.createdAt.$lte = new Date(req.query.dateTo as string);
      }
    }
    
    // Build the sort
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;
    
    const sort: any = {};
    sort[sortBy] = sortOrder;
    
    // Count total documents
    const totalCount = await ProductMovement.countDocuments(filter);
    
    // Get the movements
    const movements = await ProductMovement.find(filter)
      .populate('product', 'name')
      .populate('batch', 'batchNumber')
      .populate('fromZone', 'name type')
      .populate('toZone', 'name type')
      .populate('performedBy', 'username firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    res.json({
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      movements
    });
    
  } catch (error: any) {
    console.error("Ошибка при получении перемещений:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const getProductMovementById = async (req: Request, res: Response) => {
  try {
    const movement = await ProductMovement.findById(req.params.id)
      .populate('product', 'name description')
      .populate('batch', 'batchNumber manufacturingDate expiryDate')
      .populate('fromZone', 'name type')
      .populate('toZone', 'name type')
      .populate('performedBy', 'username firstName lastName');
    
    if (!movement) {
      return res.status(404).json({ message: "Перемещение не найдено" });
    }
    
    res.json(movement);
    
  } catch (error: any) {
    console.error("Ошибка при получении перемещения:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const getProductHistory = async (req: Request, res: Response) => {
  const { productId } = req.params;
  
  try {
    const movements = await ProductMovement.find({ product: productId })
      .sort({ createdAt: -1 })
      .populate('batch', 'batchNumber manufacturingDate expiryDate')
      .populate('fromZone', 'name type')
      .populate('toZone', 'name type')
      .populate('performedBy', 'username firstName lastName');
    
    res.json(movements);
    
  } catch (error: any) {
    console.error("Ошибка при получении истории продукта:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const getProductMovementStats = async (req: Request, res: Response) => {
  try {
    // Get date range
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(new Date().setDate(new Date().getDate() - 30)); // Last 30 days by default
      
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();
    
    // Calculate stats
    const movementsByType = await ProductMovement.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate } 
        } 
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" }
        }
      }
    ]);
    
    const movementsByZone = await ProductMovement.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          toZone: { $exists: true }
        } 
      },
      {
        $group: {
          _id: "$toZone",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" }
        }
      },
      {
        $lookup: {
          from: "zones",
          localField: "_id",
          foreignField: "_id",
          as: "zone"
        }
      },
      {
        $unwind: "$zone"
      },
      {
        $project: {
          _id: 1,
          count: 1,
          totalQuantity: 1,
          zoneName: "$zone.name",
          zoneType: "$zone.type"
        }
      }
    ]);
    
    // Get daily movement counts
    const dailyMovements = await ProductMovement.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate } 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day"
            }
          },
          count: 1,
          totalQuantity: 1
        }
      }
    ]);
    
    // Get popular products
    const popularProducts = await ProductMovement.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate, $lte: endDate },
          type: "sale" // Only count sales
        } 
      },
      {
        $group: {
          _id: "$product",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $project: {
          _id: 1,
          count: 1,
          totalQuantity: 1,
          productName: "$product.name"
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    res.json({
      movementsByType,
      movementsByZone,
      dailyMovements,
      popularProducts,
      dateRange: {
        startDate,
        endDate
      }
    });
    
  } catch (error: any) {
    console.error("Ошибка при получении статистики перемещений:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const getMovements = async (req: Request, res: Response) => {
  try {
    // Построение запроса с фильтрами
    const queryParams: any = {};
    
    if (req.query.type) queryParams.type = req.query.type;
    if (req.query.fromZone) queryParams.fromZone = req.query.fromZone;
    if (req.query.toZone) queryParams.toZone = req.query.toZone;
    if (req.query.product) queryParams.product = req.query.product;
    
    if (req.query.dateFrom && req.query.dateTo) {
      queryParams.createdAt = {
        $gte: new Date(req.query.dateFrom as string),
        $lte: new Date(req.query.dateTo as string)
      };
    } else if (req.query.dateFrom) {
      queryParams.createdAt = { $gte: new Date(req.query.dateFrom as string) };
    } else if (req.query.dateTo) {
      queryParams.createdAt = { $lte: new Date(req.query.dateTo as string) };
    }
    
    // Пагинация
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Подсчет общего количества перемещений
    const totalCount = await ProductMovement.countDocuments(queryParams);
    
    // Получение данных
    const movements = await ProductMovement.find(queryParams)
      .populate('product', 'name brandName productModel')
      .populate('batch', 'batchNumber')
      .populate('fromZone', 'name type')
      .populate('toZone', 'name type')
      .populate('performedBy', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      movements
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const getMovementById = async (req: Request, res: Response) => {
  try {
    const movement = await ProductMovement.findById(req.params.id);
    if (!movement) {
      return res.status(404).json({ message: "Movement not found" });
    }
    res.status(200).json(movement);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMovement = async (req: Request, res: Response) => {
  try {
    const movement = await ProductMovement.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!movement) {
      return res.status(404).json({ message: "Movement not found" });
    }
    res.status(200).json(movement);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMovement = async (req: Request, res: Response) => {
  try {
    const movement = await ProductMovement.findById(req.params.id);
    if (!movement) {
      return res.status(404).json({ message: "Movement not found" });
    }

    // Возвращаем товар в исходную зону
    const fromZone = await Zone.findOne({ name: movement.fromZone });
    const toZone = await Zone.findOne({ name: movement.toZone });

    if (fromZone) {
      fromZone.currentOccupancy += movement.quantity;
      await fromZone.save();
    }

    if (toZone) {
      toZone.currentOccupancy -= movement.quantity;
      await toZone.save();
    }

    await ProductMovement.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Movement deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMovementsByProduct = async (req: Request, res: Response) => {
  try {
    const movements = await ProductMovement.find({ productId: req.params.productId });
    res.status(200).json(movements);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMovementsByBatch = async (req: Request, res: Response) => {
  try {
    const movements = await ProductMovement.find({ batchId: req.params.batchId });
    res.status(200).json(movements);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMovementsByZone = async (req: Request, res: Response) => {
  try {
    const movements = await ProductMovement.find({
      $or: [
        { fromZone: req.params.zoneId },
        { toZone: req.params.zoneId }
      ]
    });
    res.status(200).json(movements);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMovementsByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const movements = await ProductMovement.find({
      createdAt: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    });
    res.status(200).json(movements);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProductMovement = async (req: Request, res: Response) => {
  try {
    const movement = await ProductMovement.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    )
    .populate('product', 'name')
    .populate('batch', 'batchNumber')
    .populate('fromZone', 'name type')
    .populate('toZone', 'name type')
    .populate('performedBy', 'username firstName lastName');

    if (!movement) {
      return res.status(404).json({ message: 'Перемещение не найдено' });
    }

    res.json(movement);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProductMovement = async (req: Request, res: Response) => {
  try {
    const movement = await ProductMovement.findByIdAndDelete(req.params.id);

    if (!movement) {
      return res.status(404).json({ message: 'Перемещение не найдено' });
    }

    res.json({ message: 'Перемещение успешно удалено' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createMovement = async (req: Request, res: Response) => {
  try {
    const movementData = req.body;
    
    // Создаем новое перемещение
    const newMovement = await ProductMovement.create(movementData);
    
    // Получаем полные данные о созданном перемещении
    const populatedMovement = await ProductMovement.findById(newMovement._id)
      .populate('product', 'name brandName productModel')
      .populate('batch', 'batchNumber')
      .populate('fromZone', 'name type')
      .populate('toZone', 'name type')
      .populate('performedBy', 'username firstName lastName');
    
    res.status(201).json(populatedMovement);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка при создании перемещения', error: error.message });
  }
}; 