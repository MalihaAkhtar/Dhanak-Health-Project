import Payment from "../models/Payment.js";
import Visit from "../models/visits.js";

/* ----------------------------
   GET all payments
----------------------------- */
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

/* ----------------------------
   ADD new payment
----------------------------- */
export const addPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to add payment" });
  }
};

/* ----------------------------
   UPDATE payment only
   (basic update if you don't need to sync visit)
----------------------------- */
export const updatePayment = async (req, res) => {
  try {
    const updated = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to update payment" });
  }
};

/* ----------------------------
   ✅ UPDATE + SYNC VISIT
   This is the key endpoint you’ll call
----------------------------- */
export const updatePaymentAndVisit = async (req, res) => {
  try {
    const { status, totalFee, consultationFee, procedureFee, medicineFee } =
      req.body;

    // 1️⃣ Find payment
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    // 2️⃣ Update payment fields if provided
    if (status) payment.status = status;
    if (totalFee !== undefined) payment.totalFee = totalFee;
    if (consultationFee !== undefined)
      payment.consultationFee = consultationFee;
    if (procedureFee !== undefined) payment.procedureFee = procedureFee;
    if (medicineFee !== undefined) payment.medicineFee = medicineFee;

    await payment.save();

    // 3️⃣ Sync linked Visit
    await Visit.findByIdAndUpdate(payment.visitId, {
      paymentStatus: payment.status,
      totalFee: payment.totalFee,
      consultationFee: payment.consultationFee,
      procedureFee: payment.procedureFee,
      medicineFee: payment.medicineFee,
    });

    res.json({
      message: "✅ Payment & Visit updated successfully",
      payment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update payment & visit" });
  }
};
