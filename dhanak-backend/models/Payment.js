// models/Payment.js
import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema({
  mrNo: { type: String, required: true },
  patientName: { type: String, required: true },
  visitDate: { type: String, required: true },
  consultationFee: { type: Number, required: true },
  procedureFee: { type: Number, required: true },
  medicineFee: { type: Number, required: true },
  totalFee: { type: Number, required: true },
  status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" }
}, {
  timestamps: true,
})

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema)
