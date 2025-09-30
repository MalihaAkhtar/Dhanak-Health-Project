import express from "express";
import {
  getMedicines,
  getDeletedMedicines,         // ✅ NEW
  addMedicine,
  updateMedicine,
  deleteMedicine,
  updateMedicineStock,
  restoreMedicine,
  permanentlyDeleteMedicine,
} from "../controllers/medicinecontroller.js";

const router = express.Router();

// ✅ Get all non-deleted medicines
router.get("/", getMedicines);

// ✅ Get deleted medicines for Trash page
router.get("/deleted", getDeletedMedicines);

// ✅ Add new medicine
router.post("/", addMedicine);

// ✅ Update medicine
router.put("/:id", updateMedicine);

// ✅ Soft delete medicine
router.put("/:id/soft-delete", deleteMedicine);

// ✅ Restore from trash
router.patch('/:id/restore', restoreMedicine);


// ✅ Permanent delete
router.delete("/:id/permanent", permanentlyDeleteMedicine);

// ✅ Reduce stock
router.put("/:id/update-stock", updateMedicineStock);

export default router;
