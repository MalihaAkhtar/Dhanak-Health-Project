import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // <-- add this
  phone: { type: String },
  address: { type: String },
  specialization: { type: String },
  profileImage: { type: String }, // base64 or URL
});

const User = mongoose.model("User", userSchema);
export default User;
