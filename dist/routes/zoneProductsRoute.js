"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zoneProductsController_1 = require("../controllers/zoneProductsController");
const router = express_1.default.Router();
router.get('/', zoneProductsController_1.getZoneProducts);
exports.default = router;
