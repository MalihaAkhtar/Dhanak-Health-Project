import Medicine from "../models/medicine.js";

// ✅ GET all *non-deleted* medicines
export const getMedicines = async (req, res) => {
  try {
    const meds = await Medicine.find({ deleted: false });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: "Error fetching medicines" });
  }
};

// ✅ GET all deleted medicines (for Trash page)
export const getDeletedMedicines = async (req, res) => {
  try {
    const deletedMeds = await Medicine.find({ deleted: true });
    res.json(deletedMeds);
  } catch (err) {
    res.status(500).json({ message: "Error fetching deleted medicines" });
  }
};

// ✅ POST new medicine
export const addMedicine = async (req, res) => {
  try {
    const newMed = new Medicine(req.body);
    const saved = await newMed.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error adding medicine" });
  }
};

// ✅ PUT update medicine
export const updateMedicine = async (req, res) => {
  try {
    const updated = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating medicine" });
  }
};

// ✅ PUT soft delete medicine
export const deleteMedicine = async (req, res) => {
  try {
    const updated = await Medicine.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
    res.json({ message: "Medicine moved to trash", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Error deleting medicine" });
  }
};

// ✅ PUT restore medicine
// ✅ PUT restore medicine
export const restoreMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findById(id);
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });

    medicine.deleted = false;
    await medicine.save();

    // ✅ return full restored object directly
    res.status(200).json(medicine);
  } catch (error) {
    console.error("Restore medicine failed:", error);
    res.status(500).json({ message: "Failed to restore medicine" });
  }
};



// ✅ DELETE permanently delete medicine
export const permanentlyDeleteMedicine = async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: "Medicine permanently deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting medicine permanently" });
  }
};

// ✅ PUT reduce medicine stock
export const updateMedicineStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    medicine.stock = Math.max(0, medicine.stock - quantity);
    await medicine.save();

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
