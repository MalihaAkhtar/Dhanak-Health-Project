// controllers/visitController.js
import Visit from "../models/visits.js";
import Payment from "../models/Payment.js";
import Patient from "../models/Patient.js";

/* ---------- Helper: Format Visit ---------- */
function formatVisit(v, payment = null) {
  const visitDateObj = v.visitDate ? new Date(v.visitDate) : new Date();
  const dateStr = visitDateObj.toISOString().split("T")[0];
  const timeStr =
    v.visitTime ||
    visitDateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const total =
    payment?.totalFee ??
    v.totalFee ??
    ((Number(v.consultationFee) || 0) +
      (Number(v.procedureFee) || 0) +
      (Number(v.medicineFee) || 0));

  return {
    _id: String(v._id),
    mrNo: v.mrNo || "",
    patientName: v.patientName || "",
    visitDate: dateStr,
    visitTime: timeStr,
    symptoms: v.symptoms || "",
    diagnosis: v.diagnosis || "",
    procedures: v.procedures || [],
    medicines: (v.medicines || []).map((m) => ({
      name: m.name || "",
      quantity: m.quantity || 0,
      cost: m.cost || 0,
    })),
    consultationFee: payment?.consultationFee ?? v.consultationFee ?? 0,
    procedureFee: payment?.procedureFee ?? v.procedureFee ?? 0,
    medicineFee: payment?.medicineFee ?? v.medicineFee ?? 0,
    totalFee: total,
    paymentStatus: payment?.status ?? v.paymentStatus ?? "Unpaid",
  };
}

/* ---------- NEW: Visits Stats (for dashboard) ---------- */
export const getVisitStats = async (req, res) => {
  try {
    const totalVisits = await Visit.countDocuments({ deleted: { $ne: true } });
    const totalPatients = await Patient.countDocuments();
    const unpaidPatients = await Patient.countDocuments({ paymentStatus: "Unpaid" });
    res.json({
      totalVisits,
      totalPatients,
      unpaidPatients,
    });
  } catch (err) {
    console.error("Error getting visit stats:", err);
    res.status(500).json({ message: "Failed to fetch visit stats" });
  }
};

/* ---------- Get All Visits ---------- */
export const getAllVisits = async (req, res) => {
  try {
    const visits = await Visit.find({ deleted: { $ne: true } }).populate(
      "patientId",
      "mrNo name"
    );

    const mrNos = visits.map((v) => v.mrNo);
    const payments = await Payment.find({ mrNo: { $in: mrNos } })
      .sort({ createdAt: -1 })
      .lean();

    const payMap = {};
    payments.forEach((p) => {
      if (!payMap[p.mrNo]) payMap[p.mrNo] = p;
    });

    res.json(visits.map((v) => formatVisit(v, payMap[v.mrNo])));
  } catch (err) {
    console.error("Error fetching all visits:", err);
    res.status(500).json({ message: "Failed to fetch visits" });
  }
};

/* ---------- Get Deleted Visits ---------- */
export const getDeletedVisits = async (req, res) => {
  try {
    const deleted = await Visit.find({ deleted: true }).populate(
      "patientId",
      "mrNo name"
    );
    res.json(deleted.map((v) => formatVisit(v)));
  } catch (err) {
    console.error("Error fetching deleted visits:", err);
    res.status(500).json({ message: "Failed to fetch deleted visits" });
  }
};

/* ---------- Get Single Visit ---------- */
export const getVisitById = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id).populate(
      "patientId",
      "mrNo name"
    );
    if (!visit) return res.status(404).json({ message: "Visit not found" });

    const payment = await Payment.findOne({ mrNo: visit.mrNo })
      .sort({ createdAt: -1 })
      .lean();

    res.json(formatVisit(visit, payment));
  } catch (err) {
    console.error("Error fetching visit:", err);
    res.status(500).json({ message: "Error fetching visit" });
  }
};

/* ---------- Create Visit ---------- */
export const createVisit = async (req, res) => {
  try {
    const {
      patientId,
      mrNo,
      symptoms,
      diagnosis,
      procedures = [],
      medicines = [],
      consultationFee,
      procedureFee = 0,
    } = req.body;

    const patient = patientId
      ? await Patient.findById(patientId)
      : await Patient.findOne({ mrNo });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const isValidConsult =
      consultationFee !== undefined &&
      consultationFee !== null &&
      consultationFee !== "";
    const finalConsultFee = isValidConsult
      ? Number(consultationFee)
      : Number(patient.amount || 0);

    const medTotal = medicines.reduce(
      (sum, m) => sum + ((m.cost || 0) * (m.quantity || 0)),
      0
    );
    const totalFee = finalConsultFee + Number(procedureFee) + medTotal;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const defaultStatus = patient.paymentStatus || "Unpaid";

    const newVisit = await Visit.create({
      patientId: patient._id,
      mrNo: patient.mrNo,
      patientName: patient.name,
      visitDate: now,
      visitTime: timeStr,
      symptoms,
      diagnosis,
      procedures,
      medicines,
      consultationFee: finalConsultFee,
      procedureFee,
      medicineFee: medTotal,
      totalFee,
      paymentStatus: defaultStatus,
    });

    const newPayment = await Payment.create({
      visitId: newVisit._id,
      patientId: patient._id,
      mrNo: patient.mrNo,
      patientName: patient.name,
      visitDate: now,
      consultationFee: finalConsultFee,
      procedureFee,
      medicineFee: medTotal,
      totalFee,
      status: defaultStatus,
    });

    res.status(201).json(formatVisit(newVisit, newPayment));
  } catch (err) {
    console.error("Error creating visit:", err);
    res.status(400).json({ message: "Error creating visit" });
  }
};

/* ---------- Update Visit ---------- */
export const updateVisit = async (req, res) => {
  try {
    const { consultationFee = 0, procedureFee = 0, medicines = [] } = req.body;

    const medTotal = medicines.reduce(
      (sum, m) => sum + ((Number(m.cost) || 0) * (Number(m.quantity) || 0)),
      0
    );
    const totalFee = Number(consultationFee) + Number(procedureFee) + medTotal;

    const updatedVisit = await Visit.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        consultationFee,
        procedureFee,
        medicineFee: medTotal,
        totalFee,
      },
      { new: true }
    ).populate("patientId", "mrNo name");

    if (!updatedVisit)
      return res.status(404).json({ message: "Visit not found" });

    // ✅ ensure a Payment exists (update or create)
    let payment = await Payment.findOne({ visitId: updatedVisit._id });
    if (payment) {
      payment.consultationFee = consultationFee;
      payment.procedureFee = procedureFee;
      payment.medicineFee = medTotal;
      payment.totalFee = totalFee;
      payment.status = req.body.paymentStatus || payment.status;
      await payment.save();
    } else {
      payment = await Payment.create({
        visitId: updatedVisit._id,
        patientId: updatedVisit.patientId,
        mrNo: updatedVisit.mrNo,
        patientName: updatedVisit.patientName,
        visitDate: updatedVisit.visitDate,
        consultationFee,
        procedureFee,
        medicineFee: medTotal,
        totalFee,
        status: req.body.paymentStatus || "Unpaid",
      });
    }

    res.json(formatVisit(updatedVisit, payment));
  } catch (err) {
    console.error("Visit update error:", err);
    res.status(500).json({ message: "Failed to update visit" });
  }
};

/* ---------- Soft Delete ---------- */
export const deleteVisit = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ message: "Visit not found" });

    visit.deleted = true;
    await visit.save();
    res.json({
      message: "Visit deleted successfully",
      visit: formatVisit(visit),
    });
  } catch (err) {
    console.error("Delete Visit Error:", err);
    res.status(500).json({ message: "Server error while deleting visit" });
  }
};

/* ---------- Restore ---------- */
export const restoreVisit = async (req, res) => {
  try {
    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      { deleted: false },
      { new: true }
    );
    if (!visit) return res.status(404).json({ message: "Visit not found" });
    res.json({
      message: "Visit restored successfully",
      visit: formatVisit(visit),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------- Permanent Delete ---------- */
export const permanentlyDeleteVisit = async (req, res) => {
  try {
    const visit = await Visit.findByIdAndDelete(req.params.id);
    if (!visit) return res.status(404).json({ message: "Visit not found" });

    await Payment.deleteMany({ visitId: visit._id });
    res.json({ message: "Visit permanently deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------- NEW: Real Total Visits Count ---------- */
export const getVisitsCount = async (req, res) => {
  try {
    const totalVisits = await Visit.countDocuments({ deleted: { $ne: true } });
    res.json({ totalVisits }); // ✅ Key name fixed for frontend
  } catch (err) {
    console.error("Visits count error:", err);
    res.status(500).json({ message: "Failed to fetch visit count" });
  }
};
