// notificationsController.js
import Medicine from "../models/medicine.js";
import Patient from "../models/Patient.js";

// GET notifications
export const getNotifications = async (req, res) => {
  try {
    // Low stock medicines
    const lowStockMedicines = await Medicine.find({ quantity: { $lte: 10 } }); // threshold

    // Unpaid patients
    const unpaidPatients = await Patient.find({ paymentStatus: "unpaid" });

    res.json({
      lowStockMedicines: lowStockMedicines.map((m) => ({
        name: m.name,
        quantity: m.quantity,
      })),
      unpaidPatients: unpaidPatients.map((p) => ({
        name: p.patientName,
        amountDue: p.amountDue,
        mrNo: p.mrNo,
      })),
    });
  } catch (err) {
    console.error("Notification fetch error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};
