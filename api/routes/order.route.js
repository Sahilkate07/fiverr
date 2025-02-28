import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { getOrders, intent, confirm, checkOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", verifyToken, getOrders);
router.get("/check/:paymentIntentId", verifyToken, checkOrder);
router.post("/create-payment-intent/:id", verifyToken, intent);
router.put("/confirm", verifyToken, confirm);

export default router;
