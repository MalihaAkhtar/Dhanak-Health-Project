import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());

// Increase JSON payload size to handle base64 images
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Route imports
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import notificationRoutes from "./routes/notifications.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import visitRoutes from "./routes/visitRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import trashRoutes from "./routes/trashRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// ✅ Register routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/trash", trashRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/uploads', express.static('uploads'));


// ✅ Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
