import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  name: String,
  type: String,
  dosage: String, // <--- Must be defined like this
  cost: Number,
  stock: Number,
  lowStockThreshold: Number,
   deleted: {
    type: Boolean,
    default: false
  }
})


const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
