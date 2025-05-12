"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductMovement = exports.updateProductMovement = exports.getMovementsByDateRange = exports.getMovementsByZone = exports.getMovementsByBatch = exports.getMovementsByProduct = exports.deleteMovement = exports.updateMovement = exports.getMovementById = exports.getMovements = exports.getProductMovementStats = exports.getProductHistory = exports.getProductMovementById = exports.getProductMovements = exports.createProductMovement = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ProductMovement_1 = __importDefault(require("../models/ProductMovement"));
const Batch_1 = __importDefault(require("../models/Batch"));
const Zone_1 = __importDefault(require("../models/Zone"));
const createProductMovement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { product, batch, type, quantity, fromZone, toZone, reason, reference } = req.body;
    try {
        // Validate the data
        if (!product || !batch || !type || !quantity) {
            return res.status(400).json({ message: "Необходимо указать продукт, партию, тип и количество" });
        }
        // Check if the batch exists and has enough quantity
        const batchDoc = yield Batch_1.default.findById(batch);
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
            const [fromZoneDoc, toZoneDoc] = yield Promise.all([
                Zone_1.default.findById(fromZone),
                Zone_1.default.findById(toZone)
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
            yield fromZoneDoc.save();
            // Update the target zone's occupancy
            toZoneDoc.currentOccupancy += quantity;
            yield toZoneDoc.save();
        }
        // For sales and expired, we only reduce the from zone
        if (type === 'sale' || type === 'expired' || type === 'adjustment') {
            if (!fromZone) {
                return res.status(400).json({ message: "Необходимо указать исходную зону" });
            }
            const fromZoneDoc = yield Zone_1.default.findById(fromZone);
            if (!fromZoneDoc) {
                return res.status(404).json({ message: "Исходная зона не найдена" });
            }
            // Update the source zone's occupancy
            fromZoneDoc.currentOccupancy = Math.max(0, fromZoneDoc.currentOccupancy - quantity);
            yield fromZoneDoc.save();
        }
        // Update the batch quantity
        if (type === 'transfer' || type === 'online_order') {
            // For transfers, we're just moving the batch, not changing its quantity
        }
        else if (type === 'sale' || type === 'expired' || type === 'adjustment') {
            // For sales and expiry, reduce the batch quantity
            batchDoc.quantity -= quantity;
            yield batchDoc.save();
        }
        // Create the movement record
        const movement = new ProductMovement_1.default({
            product,
            batch,
            type,
            quantity,
            fromZone,
            toZone,
            performedBy: ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || null, // Get the user from the auth middleware
            reason,
            reference
        });
        yield movement.save();
        // Return the created movement
        res.status(201).json({
            message: "Перемещение товара успешно создано",
            movement
        });
    }
    catch (error) {
        console.error("Ошибка при создании перемещения:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.createProductMovement = createProductMovement;
const getProductMovements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Build the filter
        const filter = {};
        if (req.query.product) {
            filter.product = new mongoose_1.default.Types.ObjectId(req.query.product);
        }
        if (req.query.type) {
            filter.type = req.query.type;
        }
        if (req.query.fromZone) {
            filter.fromZone = new mongoose_1.default.Types.ObjectId(req.query.fromZone);
        }
        if (req.query.toZone) {
            filter.toZone = new mongoose_1.default.Types.ObjectId(req.query.toZone);
        }
        if (req.query.dateFrom || req.query.dateTo) {
            filter.createdAt = {};
            if (req.query.dateFrom) {
                filter.createdAt.$gte = new Date(req.query.dateFrom);
            }
            if (req.query.dateTo) {
                filter.createdAt.$lte = new Date(req.query.dateTo);
            }
        }
        // Build the sort
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = {};
        sort[sortBy] = sortOrder;
        // Count total documents
        const totalCount = yield ProductMovement_1.default.countDocuments(filter);
        // Get the movements
        const movements = yield ProductMovement_1.default.find(filter)
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
    }
    catch (error) {
        console.error("Ошибка при получении перемещений:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.getProductMovements = getProductMovements;
const getProductMovementById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movement = yield ProductMovement_1.default.findById(req.params.id)
            .populate('product', 'name description')
            .populate('batch', 'batchNumber manufacturingDate expiryDate')
            .populate('fromZone', 'name type')
            .populate('toZone', 'name type')
            .populate('performedBy', 'username firstName lastName');
        if (!movement) {
            return res.status(404).json({ message: "Перемещение не найдено" });
        }
        res.json(movement);
    }
    catch (error) {
        console.error("Ошибка при получении перемещения:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.getProductMovementById = getProductMovementById;
const getProductHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    try {
        const movements = yield ProductMovement_1.default.find({ product: productId })
            .sort({ createdAt: -1 })
            .populate('batch', 'batchNumber manufacturingDate expiryDate')
            .populate('fromZone', 'name type')
            .populate('toZone', 'name type')
            .populate('performedBy', 'username firstName lastName');
        res.json(movements);
    }
    catch (error) {
        console.error("Ошибка при получении истории продукта:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.getProductHistory = getProductHistory;
const getProductMovementStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get date range
        const startDate = req.query.startDate
            ? new Date(req.query.startDate)
            : new Date(new Date().setDate(new Date().getDate() - 30)); // Last 30 days by default
        const endDate = req.query.endDate
            ? new Date(req.query.endDate)
            : new Date();
        // Calculate stats
        const movementsByType = yield ProductMovement_1.default.aggregate([
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
        const movementsByZone = yield ProductMovement_1.default.aggregate([
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
        const dailyMovements = yield ProductMovement_1.default.aggregate([
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
        const popularProducts = yield ProductMovement_1.default.aggregate([
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
    }
    catch (error) {
        console.error("Ошибка при получении статистики перемещений:", error);
        res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
});
exports.getProductMovementStats = getProductMovementStats;
const getMovements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movements = yield ProductMovement_1.default.find();
        res.status(200).json(movements);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMovements = getMovements;
const getMovementById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movement = yield ProductMovement_1.default.findById(req.params.id);
        if (!movement) {
            return res.status(404).json({ message: "Movement not found" });
        }
        res.status(200).json(movement);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMovementById = getMovementById;
const updateMovement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movement = yield ProductMovement_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), { updatedAt: new Date() }), { new: true });
        if (!movement) {
            return res.status(404).json({ message: "Movement not found" });
        }
        res.status(200).json(movement);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateMovement = updateMovement;
const deleteMovement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movement = yield ProductMovement_1.default.findById(req.params.id);
        if (!movement) {
            return res.status(404).json({ message: "Movement not found" });
        }
        // Возвращаем товар в исходную зону
        const fromZone = yield Zone_1.default.findOne({ name: movement.fromZone });
        const toZone = yield Zone_1.default.findOne({ name: movement.toZone });
        if (fromZone) {
            fromZone.currentOccupancy += movement.quantity;
            yield fromZone.save();
        }
        if (toZone) {
            toZone.currentOccupancy -= movement.quantity;
            yield toZone.save();
        }
        yield ProductMovement_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Movement deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteMovement = deleteMovement;
const getMovementsByProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movements = yield ProductMovement_1.default.find({ productId: req.params.productId });
        res.status(200).json(movements);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMovementsByProduct = getMovementsByProduct;
const getMovementsByBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movements = yield ProductMovement_1.default.find({ batchId: req.params.batchId });
        res.status(200).json(movements);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMovementsByBatch = getMovementsByBatch;
const getMovementsByZone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movements = yield ProductMovement_1.default.find({
            $or: [
                { fromZone: req.params.zoneId },
                { toZone: req.params.zoneId }
            ]
        });
        res.status(200).json(movements);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMovementsByZone = getMovementsByZone;
const getMovementsByDateRange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        const movements = yield ProductMovement_1.default.find({
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        });
        res.status(200).json(movements);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMovementsByDateRange = getMovementsByDateRange;
const updateProductMovement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movement = yield ProductMovement_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), { updatedAt: new Date() }), { new: true })
            .populate('product', 'name')
            .populate('batch', 'batchNumber')
            .populate('fromZone', 'name type')
            .populate('toZone', 'name type')
            .populate('performedBy', 'username firstName lastName');
        if (!movement) {
            return res.status(404).json({ message: 'Перемещение не найдено' });
        }
        res.json(movement);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.updateProductMovement = updateProductMovement;
const deleteProductMovement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const movement = yield ProductMovement_1.default.findByIdAndDelete(req.params.id);
        if (!movement) {
            return res.status(404).json({ message: 'Перемещение не найдено' });
        }
        res.json({ message: 'Перемещение успешно удалено' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteProductMovement = deleteProductMovement;
