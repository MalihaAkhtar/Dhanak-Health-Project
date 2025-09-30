import express from "express";
import {
  getAllPatients,
  addPatient,
  deletePatient,
  updatePatient,
  restorePatient,
  permanentlyDeletePatient,
  getDeletedPatients,
} from "../controllers/patientController.js";

const router = express.Router();

// GET all non-deleted patients
router.get("/", getAllPatients);

// POST new patient
router.post("/", addPatient);

// SOFT delete patient (move to trash)
router.delete("/:id", deletePatient);

// UPDATE patient
router.put("/:id", updatePatient);

// GET all soft-deleted patients
router.get("/deleted", getDeletedPatients);

// RESTORE soft-deleted patient
router.patch("/:id/restore", restorePatient);

// PERMANENTLY DELETE patient
router.delete("/:id/permanent", permanentlyDeletePatient);

export default router;
