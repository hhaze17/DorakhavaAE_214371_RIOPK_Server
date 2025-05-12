"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PurchaseSchema = new mongoose_1.Schema({
    dateOfTransaction: { type: Date  },
    brandName: { type: String  },
    description: { type: String  },
    model: { type: String  },
    quantity: { type: Number },
    totalPrice: { type: String  },
    createdAt: { type: Date, default: new Date() },
});
exports.default = (0, mongoose_1.model)("Purchase", PurchaseSchema);
