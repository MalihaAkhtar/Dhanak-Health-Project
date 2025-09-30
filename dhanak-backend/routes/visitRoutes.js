import express from "express";
import {
  getAllVisits,
  getVisitById,
  createVisit,
  updateVisit,
  deleteVisit,
  restoreVisit,
  permanentlyDeleteVisit,
  getVisitsCount       // ✅ make sure imported
} from "../controllers/visitController.js";

const router = express.Router();

// ✅ Endpoint name aligned with frontend
router.get("/total-count", getVisitsCount);

router.get("/", getAllVisits);
router.get("/:id", getVisitById);
router.post("/", createVisit);
router.put("/:id", updateVisit);
router.delete("/:id", deleteVisit);
router.patch("/restore/:id", restoreVisit);
router.delete("/permanent/:id", permanentlyDeleteVisit);

export default router;
