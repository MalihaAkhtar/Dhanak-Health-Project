import Patient from "../models/Patient.js";
import Visit from "../models/visits.js";
import mongoose from "mongoose";

const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments({ deleted: false });
    const totalVisits = await Visit.countDocuments({ deleted: false });

    // 🟡 Count unique patients with unpaid visits
    const unpaidPatientsSet = await Visit.distinct("patientId", {
      paymentStatus: "Unpaid",
      deleted: false,
    });
    const unpaidPatients = unpaidPatientsSet.length;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayIncomeAgg = await Visit.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          deleted: false,
          createdAt: { $gte: startOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $add: ["$consultationFee", "$procedureFee", "$medicineFee"],
            },
          },
        },
      },
    ]);

    const monthlyIncomeAgg = await Visit.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          deleted: false,
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $add: ["$consultationFee", "$procedureFee", "$medicineFee"],
            },
          },
        },
      },
    ]);

    const feeBreakdownAgg = await Visit.aggregate([
      {
        $match: {
          paymentStatus: "Paid",
          deleted: false,
        },
      },
      {
        $group: {
          _id: null,
          consultation: { $sum: "$consultationFee" },
          procedures: { $sum: "$procedureFee" },
          medicines: { $sum: "$medicineFee" },
        },
      },
    ]);

    const todayIncome = todayIncomeAgg[0]?.total || 0;
    const monthlyIncome = monthlyIncomeAgg[0]?.total || 0;
    const feeBreakdown = feeBreakdownAgg[0] || {
      consultation: 0,
      procedures: 0,
      medicines: 0,
    };

    res.json({
      totalPatients,
      totalVisits,
      unpaidPatients,
      todayIncome,
      monthlyIncome,
      feeBreakdown,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

export { getDashboardStats };
