import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  mrNo: { type: String, required: true },
  name: { type: String, required: true },
  age: Number,
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  phone: String,
  address: String,
   amount: { type: Number, default: 0 },
  paymentStatus: { type: String, default: "Unpaid" },
  deleted: { type: Boolean, default: false }
});

// Virtual populate: link to Visit collection
patientSchema.virtual("visits", {
  ref: "Visit",
  localField: "_id",
  foreignField: "patientId",
});

patientSchema.set("toObject", { virtuals: true });
patientSchema.set("toJSON", { virtuals: true });

// ✅ OverwriteModelError fix
const Patient = mongoose.models.Patient || mongoose.model("Patient", patientSchema);

export default Patient;
