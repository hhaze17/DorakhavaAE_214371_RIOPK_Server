import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByCustomer,
  getOrdersByStatus,
  getOrdersByDateRange,
  updateOrderStatus
} from "../controllers/onlineOrderController";
import { Request, Response } from "express";

const router = express.Router();

// Маршруты, доступные всем аутентифицированным пользователям
router.post("/", createOrder);

// Специфичные маршруты должны идти перед более общими
router.get("/customer/me", async (req: Request & { params: any }, res: Response) => {
  try {
    const clientId = req.body.decoded?._id;
    if (!clientId) {
      return res.status(401).json({ message: "Ошибка авторизации" });
    }
    
    // Перенаправляем на существующий обработчик
    req.params = req.params || {};
    req.params.customerId = clientId;
    return getOrdersByCustomer(req, res);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/customer/:customerId", getOrdersByCustomer);
router.get("/status/:status", getOrdersByStatus);
router.get("/date-range", getOrdersByDateRange);

// Маршруты, доступные только администраторам
router.delete("/:id", deleteOrder);

// Маршруты, доступные администраторам и сотрудникам
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrder);
router.put("/:id/status", updateOrderStatus);

export default router; 