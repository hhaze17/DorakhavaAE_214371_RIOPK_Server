import express from "express";
import userRoute from "./userRoute";
import productRoute from "./productRoute";
import saleRoute from "./saleRoute";
import storeInventoryRoute from "./storeInventoryRoute";
import storeIncomingProductRoute from "./storeIncomingProductRoute";
import incomingProductRoute from "./incomingProductRoute";
import returnedItemRoute from "./returnedItemRoute";
import zoneRoutes from "./zoneRoutes";
import batchRoutes from "./batchRoutes";
import productMovementRoutes from "./productMovementRoutes";
import onlineOrderRoutes from "./onlineOrderRoutes";
import authRoutes from './authRoutes';
import inventoryAlertsRoutes from './inventoryAlertsRoutes';
import expiryTrackingRoutes from './expiryTrackingRoutes';
import zoneProductRoutes from './zoneProductRoutes';

const router = express.Router();

router.use("/users", userRoute);
router.use("/products", productRoute);
router.use("/sales", saleRoute);
router.use("/store-inventory", storeInventoryRoute);
router.use("/store-incoming-products", storeIncomingProductRoute);
router.use("/incoming-products", incomingProductRoute);
router.use("/returned-items", returnedItemRoute);
router.use("/zones", zoneRoutes);
router.use("/batches", batchRoutes);
router.use("/product-movements", productMovementRoutes);
router.use("/orders", onlineOrderRoutes);
router.use('/auth', authRoutes);
router.use('/inventory-alerts', inventoryAlertsRoutes);
router.use('/expiry-tracking', expiryTrackingRoutes);
router.use('/zone-products', zoneProductRoutes);

export default router; 