// routes/notifications.js
import express from "express";
import Medicine from "../models/medicine.js";
import Patient from "../models/Patient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // 🔹 Low stock medicines (use threshold if defined, otherwise default 10)
    const lowStockMedicines = await Medicine.find({
      $expr: {
        $lt: ["$stock", { $ifNull: ["$lowStockThreshold", 10] }]
      },
      deleted: false
    });

    // 🔹 Unpaid patients (case-insensitive check)
    const unpaidPatients = await Patient.find({
      paymentStatus: { $regex: /^unpaid$/i }, // matches "unpaid" or "Unpaid"
      deleted: false
    });

    res.json({
      lowStockMedicines,
      unpaidPatients,
    });
  } catch (err) {
    console.error("Notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

export default router;
