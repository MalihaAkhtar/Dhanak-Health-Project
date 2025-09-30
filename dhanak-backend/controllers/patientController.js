import Patient from "../models/Patient.js";
import Visit from "../models/visits.js";
import Payment from "../models/Payment.js";

// Get all non-deleted patients with their latest visit info
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ deleted: false });

    const patientsWithVisits = await Promise.all(
      patients.map(async (p) => {
        // 🟢 Latest Visit nikalna
        const latestVisit = await Visit.findOne({
          mrNo: p.mrNo,
          deleted: { $ne: true },
        })
          .sort({ createdAt: -1 })
          .lean();

        if (!latestVisit) {
          return {
            ...p.toObject(),
            visitDate: null,
            paymentStatus: "No Visit",
            totalFees: 0,
          };
        }

        // 🟢 Latest Visit ka Payment bhi nikalna
      // 🟢 Latest Visit ka Payment bhi nikalna (sirf mrNo par)
const payment = await Payment.findOne({
  mrNo: p.mrNo
})
  .sort({ createdAt: -1 })   // latest payment
  .lean();


        return {
          ...p.toObject(),
          visitDate: latestVisit.visitDate,
          symptoms: latestVisit.symptoms,
          diagnosis: latestVisit.diagnosis,
          procedures: latestVisit.procedures,
          medicines: latestVisit.medicines,

          consultationFee: latestVisit.consultationFee || 0,
          procedureFee: latestVisit.procedureFee || 0,
          medicineFee: latestVisit.medicineFee || 0,

          // ✅ Total fees pehle Payment model se, warna Visit fees se
          totalFees:
            payment?.totalFee ||
            ((latestVisit.consultationFee || 0) +
              (latestVisit.procedureFee || 0) +
              (latestVisit.medicineFee || 0)),

          // ✅ Status bhi Payment model se priority
          paymentStatus: payment?.status || latestVisit.paymentStatus || "Unpaid",
        };
      })
    );

    res.json(patientsWithVisits);
  } catch (err) {
    console.error("❌ Error in getAllPatients:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add a new patient
const addPatient = async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    const saved = await newPatient.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Soft-delete a patient (move to trash)
const deletePatient = async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json({ message: "Patient moved to trash", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Error deleting patient" });
  }
};

// Restore a patient
const restorePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.deleted = false;
    await patient.save();

    res.status(200).json({ message: "Patient restored successfully" });
  } catch (error) {
    console.error("Restore patient failed:", error);
    res.status(500).json({ message: "Failed to restore patient" });
  }
};

// Permanently delete patient
const permanentlyDeletePatient = async (req, res) => {
  try {
    const deleted = await Patient.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json({ message: "Patient permanently deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting patient permanently" });
  }
};

// Get all deleted patients (for trash page)
const getDeletedPatients = async (req, res) => {
  try {
    const deletedPatients = await Patient.find({ deleted: true });
    res.json(deletedPatients);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch deleted patients" });
  }
};
// ✅ Update a patient record
const updatePatient = async (req, res) => {
  try {
    // Validate ID and body
    if (!req.params.id) {
      return res.status(400).json({ message: "Missing patient ID" });
    }

    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json({
      message: "Patient updated successfully",
      data: updated
    });
  } catch (err) {
    console.error("❌ Error updating patient:", err);
    return res.status(500).json({
      message: "Failed to update patient",
      error: err.message
    });
  }
};

export {
  getAllPatients,
  addPatient,
  deletePatient,
  updatePatient,
  getDeletedPatients,
  restorePatient,
  permanentlyDeletePatient,
};
