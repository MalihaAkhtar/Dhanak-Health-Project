import express from "express";
import {
  getAllPayments,
  addPayment,
  updatePayment,
  updatePaymentAndVisit,
} from "../controllers/paymentController.js";

const router = express.Router();

// basic CRUD
router.get("/", getAllPayments);
router.post("/", addPayment);
router.put("/:id", updatePayment);

// ✅ this is the endpoint to call when marking Paid
router.patch("/:id/sync", updatePaymentAndVisit);

export default router;
