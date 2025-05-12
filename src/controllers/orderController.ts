import { Request, Response } from 'express';
import OnlineOrder from '../models/OnlineOrder';
import Product from '../models/Product';

interface OrderItem {
  product: string;
  quantity: number;
  price?: number;
  zone?: string;
}

interface OrderRequestBody {
  products: Array<{
    productId: string;
    quantity: number;
  }>;
  pickupDate: Date;
  items: OrderItem[];
  pickupZone: string;
  paymentStatus?: string;
  paymentMethod?: string;
  notes?: string;
  client?: string;
  orderNumber?: string;
  totalAmount?: number;
}

// Получение списка заказов
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await OnlineOrder.find()
      .populate('client', 'username firstName lastName email')
      .populate('items.product', 'name brandName productModel price');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получение заказа по ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await OnlineOrder.findById(req.params.id)
      .populate('client', 'username firstName lastName email')
      .populate('items.product', 'name brandName productModel price');
    
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Создание заказа
export const createOrder = async (req: Request, res: Response) => {
  try {
    console.log('Create order request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const body = req.body as OrderRequestBody;
    const { items, pickupZone } = body;

    // Проверка наличия продуктов
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ 
          message: `Продукт с ID ${item.product} не найден` 
        });
      }
      
      // Если используется определенная зона для товара, нужно проверить наличие в этой зоне
      if (item.zone) {
        // Здесь можно реализовать проверку наличия в конкретной зоне
        // Пока просто проверяем общее количество
        if (product.quantity < item.quantity) {
          return res.status(400).json({ 
            message: `Недостаточное количество продукта ${product.name || product.brandName}` 
          });
        }
      } else {
        // Проверка общего количества товара
        if (product.quantity < item.quantity) {
          return res.status(400).json({ 
            message: `Недостаточное количество продукта ${product.name || product.brandName}` 
          });
        }
      }
    }

    // Получаем ID клиента из всех возможных источников
    const clientId = req.body.client || 
                    req.query.clientId ||
                    req.body.decoded?._id || 
                    (req as any).user?._id || 
                    req.headers['x-user-id'] ||
                    req.headers['user-id'];
    
    console.log('Client ID sources:', {
      bodyClient: req.body.client,
      queryClientId: req.query.clientId,
      decodedId: req.body.decoded?._id,
      userObjectId: (req as any).user?._id,
      headerXUserId: req.headers['x-user-id'],
      headerUserId: req.headers['user-id'],
      resolvedClientId: clientId
    });
    
    if (!clientId) {
      return res.status(400).json({
        message: 'ID клиента не указан. Пожалуйста, войдите в систему или укажите client в запросе.'
      });
    }

    // Создание заказа с явным указанием всех полей
    const orderData = {
      client: clientId,
      items: items.map((item: OrderItem) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price || 0,
        zone: item.zone // Сохраняем выбранную зону
      })),
      status: 'pending',
      pickupZone,
      paymentStatus: body.paymentStatus || 'pending',
      paymentMethod: body.paymentMethod || 'card',
      notes: body.notes || '',
      orderNumber: body.orderNumber || `ORD-${Date.now()}`,
      totalAmount: body.totalAmount || items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0)
    };
    
    console.log('Creating order with data:', orderData);
    
    const order = await OnlineOrder.create(orderData);
    console.log('Order created successfully:', order._id);

    // Обновление количества продуктов
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity }
      });
    }

    res.status(201).json(order);
  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Обновление заказа
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const order = await OnlineOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Удаление заказа
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await OnlineOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    // Возврат продуктов на склад
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity }
      });
    }

    await order.deleteOne();
    res.json({ message: 'Заказ удален' });
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получение заказов клиента
export const getOrdersByCustomer = async (req: Request, res: Response) => {
  try {
    console.log('Getting orders for customer ID:', req.params.customerId);
    
    if (!req.params.customerId) {
      return res.status(400).json({ message: 'ID клиента не указан' });
    }
    
    const orders = await OnlineOrder.find({ client: req.params.customerId })
      .populate('items.product', 'name brandName productModel price');
    
    console.log(`Found ${orders.length} orders for customer ${req.params.customerId}`);
    
    res.json(orders);
  } catch (error: any) {
    console.error('Error getting customer orders:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении заказов клиента', 
      error: error.message,
      customerId: req.params.customerId
    });
  }
};

// Получение заказов по статусу
export const getOrdersByStatus = async (req: Request, res: Response) => {
  try {
    const orders = await OnlineOrder.find({ status: req.params.status })
      .populate('client', 'username firstName lastName email')
      .populate('items.product', 'name brandName productModel price');
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Обновление статуса заказа
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const order = await OnlineOrder.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
}; 