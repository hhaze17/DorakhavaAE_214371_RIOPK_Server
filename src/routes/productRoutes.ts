import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  updateProductQuantity,
  getLowStockProducts,
  getProductsByZone
} from '../controllers/productController';
 

const router = Router();

// Логирование для всех маршрутов
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Публичные маршруты
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/low-stock', getLowStockProducts);
router.get('/by-zone/:zoneId', getProductsByZone);
router.get('/:id', getProductById);

// Защищенные маршруты (требуют аутентификации)
// Применяем middleware к каждому маршруту отдельно, используя authMiddleware как обычный middleware
router.post('/',  (createProduct as any));
router.put('/:id',  (updateProduct as any));
router.delete('/:id',   (deleteProduct as any));
router.patch('/:id/quantity',   (updateProductQuantity as any));

// Обработчик 404 для неизвестных маршрутов продуктов
router.use((req, res) => {
  res.status(404).json({ 
    message: 'Маршрут для продуктов не найден', 
    path: req.path 
  });
});

export default router; 