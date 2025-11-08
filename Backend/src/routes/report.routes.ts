import { Router } from "express";
import {
  createReport,
  getReportsByUser,
  getReportsByClient,
  getReportById,
  updateReport,
  deleteReport,
  getDashboardStats,
  generateTaxDatesReport,
  getOverdueReport,
  getReportsByType,
} from "../controllers/report.controller";

const router = Router();

// CRUD de reportes
router.post("/", createReport);
router.get("/user/:user_id", getReportsByUser);
router.get("/client/:client_id", getReportsByClient);
router.get("/:report_id", getReportById);
router.put("/:report_id", updateReport);
router.delete("/:report_id", deleteReport);

// Dashboard y estadísticas
router.get("/dashboard/:user_id", getDashboardStats);

// Reportes especiales
router.get("/user/:user_id/tax-dates", generateTaxDatesReport);
router.get("/user/:user_id/overdue", getOverdueReport);
router.get("/user/:user_id/type/:report_type", getReportsByType);

export default router;
