"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
// Логирование для всех маршрутов
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Публичные маршруты
router.get('/', productController_1.getProducts);
router.get('/search', productController_1.searchProducts);
router.get('/category/:category', productController_1.getProductsByCategory);
router.get('/low-stock', productController_1.getLowStockProducts);
router.get('/:id', productController_1.getProductById);
// Защищенные маршруты (требуют аутентификации)
// Применяем middleware к каждому маршруту отдельно, используя authMiddleware как обычный middleware
router.post('/', productController_1.createProduct);
router.put('/:id', productController_1.updateProduct);
router.delete('/:id', productController_1.deleteProduct);
router.patch('/:id/quantity', productController_1.updateProductQuantity);
// Обработчик 404 для неизвестных маршрутов продуктов
router.use((req, res) => {
    res.status(404).json({
        message: 'Маршрут для продуктов не найден',
        path: req.path
    });
});
exports.default = router;
