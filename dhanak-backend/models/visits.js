// models/visits.js
import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  name: { type: String },
  dosage: { type: String },
  quantity: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
}, { _id: false });

const visitSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  mrNo: { type: String, required: true },
  patientName: { type: String, required: true },
  visitDate: { type: Date, required: true },
  visitTime: { type: String },
  symptoms: { type: String },
  diagnosis: { type: String },
  procedures: [{ type: String }],
  medicines: [medicineSchema],

  consultationFee: { type: Number, default: 0 },
  procedureFee: { type: Number, default: 0 },
  medicineFee: { type: Number, default: 0 },
  totalFee: { type: Number, default: 0 },

  paymentStatus: { type: String, default: "Unpaid" },

  deleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Visit || mongoose.model("Visit", visitSchema);
