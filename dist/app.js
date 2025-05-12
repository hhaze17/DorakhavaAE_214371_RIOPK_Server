"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
// Import routes
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const galleryRoute_1 = __importDefault(require("./routes/galleryRoute"));
const saleRoute_1 = __importDefault(require("./routes/saleRoute"));
const purchaseRoute_1 = __importDefault(require("./routes/purchaseRoute"));
const incomingProductRoute_1 = __importDefault(require("./routes/incomingProductRoute"));
const outgoingProductRoute_1 = __importDefault(require("./routes/outgoingProductRoute"));
const orderProductRoute_1 = __importDefault(require("./routes/orderProductRoute"));
const dailyAttendanceRoute_1 = __importDefault(require("./routes/dailyAttendanceRoute"));
const returnedItemRoute_1 = __importDefault(require("./routes/returnedItemRoute"));
const barcodeGeneratorRoute_1 = __importDefault(require("./routes/barcodeGeneratorRoute"));
const productMovementRoutes_1 = __importDefault(require("./routes/productMovementRoutes"));
const zoneRoutes_1 = __importDefault(require("./routes/zoneRoutes"));
const storeInventoryRoute_1 = __importDefault(require("./routes/storeInventoryRoute"));
const storeIncomingProductRoute_1 = __importDefault(require("./routes/storeIncomingProductRoute"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const batchRoutes_1 = __importDefault(require("./routes/batchRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
// Import new routes
const inventoryAlertRoutes_1 = __importDefault(require("./routes/inventoryAlertRoutes"));
const expiryTrackingRoutes_1 = __importDefault(require("./routes/expiryTrackingRoutes"));
const zoneTransferRoutes_1 = __importDefault(require("./routes/zoneTransferRoutes"));
const zoneProductsRoute_1 = __importDefault(require("./routes/zoneProductsRoute"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
// Serve static files
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
});
// API Routes
app.use("/api/user", userRoute_1.default);
app.use("/api/gallery", galleryRoute_1.default);
app.use("/api/sales", saleRoute_1.default);
app.use("/api/purchases", purchaseRoute_1.default);
app.use("/api/incoming-products", incomingProductRoute_1.default);
app.use("/api/outgoing-products", outgoingProductRoute_1.default);
app.use("/api/order-products", orderProductRoute_1.default);
app.use("/api/daily-attendance", dailyAttendanceRoute_1.default);
app.use("/api/returned-items", returnedItemRoute_1.default);
app.use("/api/barcode-generator", barcodeGeneratorRoute_1.default);
app.use("/api/product-movements", productMovementRoutes_1.default);
app.use("/api/zone-products", zoneProductsRoute_1.default);
app.use("/api/zones", zoneRoutes_1.default);
app.use("/api/storeInventory", storeInventoryRoute_1.default);
app.use("/api/storeIncomingProduct", storeIncomingProductRoute_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/batches", batchRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
// New routes for commercial zone features
app.use("/api/alerts", inventoryAlertRoutes_1.default);
app.use("/api/expiry", expiryTrackingRoutes_1.default);
app.use("/api/transfers", zoneTransferRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Маршрут не найден" });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error("Ошибка сервера:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Внутренняя ошибка сервера";
    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
});
exports.default = app;
