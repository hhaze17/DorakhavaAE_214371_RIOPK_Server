import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger';

// Import routes
import userRoute from "./routes/userRoute";
import galleryRoute from "./routes/galleryRoute";
import saleRoute from "./routes/saleRoute";
import purchaseRoute from "./routes/purchaseRoute";
import incomingProductRoute from "./routes/incomingProductRoute";
import outgoingProductRoute from "./routes/outgoingProductRoute";
import orderProductRoute from "./routes/orderProductRoute";
import dailyAttendanceRoute from "./routes/dailyAttendanceRoute";
import returnedItemRoute from "./routes/returnedItemRoute";
import barcodeGeneratorRoute from "./routes/barcodeGeneratorRoute";
import productMovementRoutes from "./routes/productMovementRoutes";
import zoneRoutes from "./routes/zoneRoutes";
import storeInventoryRoute from "./routes/storeInventoryRoute";
import storeIncomingProductRoute from "./routes/storeIncomingProductRoute";
import productRoutes from './routes/productRoutes';
import batchRoutes from './routes/batchRoutes';
import orderRoutes from './routes/orderRoutes';
// Import new routes
import inventoryAlertRoutes from './routes/inventoryAlertRoutes';
import expiryTrackingRoutes from './routes/expiryTrackingRoutes';
import zoneTransferRoutes from './routes/zoneTransferRoutes';
import zoneProductRoutes from './routes/zoneProductRoutes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// API Routes
app.use("/api/user", userRoute);
app.use("/api/gallery", galleryRoute);
app.use("/api/sales", saleRoute);
app.use("/api/purchases", purchaseRoute);
app.use("/api/incoming-products", incomingProductRoute);
app.use("/api/outgoing-products", outgoingProductRoute);
app.use("/api/order-products", orderProductRoute);
app.use("/api/daily-attendance", dailyAttendanceRoute);
app.use("/api/returned-items", returnedItemRoute);
app.use("/api/barcode-generator", barcodeGeneratorRoute);
app.use("/api/product-movements", productMovementRoutes);
app.use("/api/zone-products", zoneProductRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/storeInventory", storeInventoryRoute);
app.use("/api/storeIncomingProduct", storeIncomingProductRoute);
app.use("/api/products", productRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/orders", orderRoutes);
// New routes for commercial zone features
app.use("/api/alerts", inventoryAlertRoutes);
app.use("/api/expiry", expiryTrackingRoutes);
app.use("/api/transfers", zoneTransferRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Маршрут не найден" });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Ошибка сервера:", err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Внутренняя ошибка сервера";
  
  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
