import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

// Define and export JWT secret
export const SECRET_KEY = process.env.JWT_SECRET || "warehouse_secret_key_20";

// MongoDB connection
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/warehouse2";
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("MongoDB подключена успешно ✅");
    return true;
  } catch (error) {
    console.error("Ошибка подключения к MongoDB:", error);
    return false;
  }
};

// Start the server only after database connection
const startServer = async () => {
  // Initialize all models before importing app
  // This ensures models are registered before they are used
  require("./models/User");
  require("./models/ResetToken");
  require("./models/CreatePasswordToken");
  require("./models/Product");
  require("./models/Zone");
  require("./models/ProductMovement");
  require("./models/OnlineOrder");
  require("./models/Batch");
  require("./models/StoreInventory");
  require("./models/StoreIncomingProduct");
  require("./models/Sale");
  require("./models/ReturnedItem");
  require("./models/Purchase");
  require("./models/OutgoingProduct");
  require("./models/OrderProduct");
  require("./models/IncomingProduct");
  require("./models/Gallery");
  require("./models/DailyAttendance");
  require("./models/BarcodeGenerator");
  
  // Now import app after models are loaded
  const app = require("./app").default;
  
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT} 🚀`);
  });
};

// Main execution
(async () => {
  try {
    const connected = await connectDB();
    if (connected) {
      await startServer();
    } else {
      console.error("Не удалось запустить сервер из-за ошибки подключения к базе данных");
      process.exit(1);
    }
  } catch (error) {
    console.error("Непредвиденная ошибка при запуске:", error);
    process.exit(1);
  }
})();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Необработанная ошибка:", err);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Необработанное исключение:", err);
});

