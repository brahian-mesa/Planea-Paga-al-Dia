import { Router } from "express";
import multer from "multer";
import {
  uploadTaxCalendar,
  addTaxDates,
  getTaxDatesByClientId,
  getTaxDatesByNit,
  getAllTaxCalendars,
  getTaxDatesByCalendar,
} from "../controllers/taxCalendar.controller";

const router = Router();

// Configurar multer para manejar archivos
const upload = multer({ dest: "src/uploads/" });

// Subir calendario tributario anual (PDF)
router.post("/upload", upload.single("file"), uploadTaxCalendar);

// Agregar fechas tributarias a un calendario
router.post("/dates", addTaxDates);

// Obtener fechas tributarias de un cliente por su ID (usa el NIT del cliente)
router.get("/client/:client_id/dates", getTaxDatesByClientId);

// Obtener fechas tributarias directamente por NIT
router.get("/nit/:nit/dates", getTaxDatesByNit);

// Obtener todos los calendarios tributarios
router.get("/", getAllTaxCalendars);

// Obtener todas las fechas de un calendario específico
router.get("/:calendar_id/dates", getTaxDatesByCalendar);

export default router;
