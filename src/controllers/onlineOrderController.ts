import { Request, Response } from "express";
import OnlineOrder from "../models/OnlineOrder";
import Product from "../models/Product";
import Zone from "../models/Zone";
import ProductMovement from "../models/ProductMovement";

export const createOrder = async (req: Request, res: Response) => {
  try {
    // Проверяем наличие необходимых полей
    const { items, pickupZone, totalAmount, paymentMethod, orderNumber, client } = req.body;
    
    // Проверяем наличие ID клиента
    if (!client) {
      return res.status(400).json({ message: "ID клиента не указан" });
    }

    // Создаем новый заказ
    const orderData = {
      orderNumber: orderNumber || `ORD-${Date.now()}`,
      client,
      items: items.map((item: { product: string; quantity: number; price: number }) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount,
      pickupZone,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    };

    const order = new OnlineOrder(orderData);
    await order.save();

    // Проверяем наличие выбранной зоны самовывоза
    const targetPickupZone = await Zone.findById(pickupZone);
    if (!targetPickupZone) {
      return res.status(404).json({ message: "Указанная зона самовывоза не найдена" });
    }

    // Создаем движения товаров для каждого товара в заказе
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        console.error(`Товар с ID ${item.product} не найден`);
        continue;
      }
      
      // Проверка доступности товара
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Недостаточное количество товара: ${product.name || product.brandName || 'Товар'}`
        });
      }
      
      // Создаем запись о перемещении товара
      const movement = new ProductMovement({
        product: item.product,
        quantity: item.quantity,
        fromZone: product.zone, // откуда
        toZone: targetPickupZone._id, // куда (зона самовывоза)
        type: "online_order",
        reason: `Заказ ${orderData.orderNumber}`,
        performedBy: client,
        pickupInfo: {
          orderNumber: orderData.orderNumber,
          reservedUntil: new Date(Date.now() + 48 * 60 * 60 * 1000) // +48 часов
        }
      });
      
      await movement.save();
      
      // Обновляем количество товара (уменьшаем)
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity }
      });
      
      // Обновляем занятость зоны самовывоза
      targetPickupZone.currentOccupancy = (targetPickupZone.currentOccupancy || 0) + item.quantity;
    }

    await targetPickupZone.save();
    res.status(201).json(order);
  } catch (error: any) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await OnlineOrder.find();
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await OnlineOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const order = await OnlineOrder.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await OnlineOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Возвращаем товары в исходные зоны
    const pickupZone = await Zone.findOne({ type: "online_pickup" });
    if (!pickupZone) {
      return res.status(404).json({ message: "Pickup zone not found" });
    }

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        continue;
      }
      const movement = new ProductMovement({
        productId: item.product,
        quantity: item.quantity,
        fromZone: pickupZone._id,
        toZone: product.zone,
        reason: "order_cancellation",
        batchId: item.batch,
        orderId: order._id
      });
      await movement.save();
      pickupZone.currentOccupancy -= item.quantity;
    }

    await pickupZone.save();
    await OnlineOrder.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrdersByCustomer = async (req: Request, res: Response) => {
  try {
    const customerId = req.params.customerId;
    if (!customerId) {
      return res.status(400).json({ message: "ID клиента не указан" });
    }

    const orders = await OnlineOrder.find({ client: customerId })
      .populate('items.product', 'name brandName productModel price')
      .populate('pickupZone', 'name type')
      .sort({ createdAt: -1 }); // Сортировка по дате создания (новые сначала)

    res.status(200).json(orders);
  } catch (error: any) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrdersByStatus = async (req: Request, res: Response) => {
  try {
    const orders = await OnlineOrder.find({ status: req.params.status });
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrdersByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const orders = await OnlineOrder.find({
      createdAt: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    });
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const order = await OnlineOrder.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}; 