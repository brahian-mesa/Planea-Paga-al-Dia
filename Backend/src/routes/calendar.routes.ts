import { Router } from "express";
import { CalendarController } from "../controllers/calendar.controller";
import { authMiddleware } from "../middlewares/user.middleware";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas de calendario
router.use(authMiddleware);

router.get("/", CalendarController.getAll);
router.get("/client/:client_id", CalendarController.getByClientId);
router.get("/:id", CalendarController.getById);
router.post("/", CalendarController.addEvent);
router.put("/:id", CalendarController.updateEvent);
router.delete("/:id", CalendarController.deleteEvent);

export default router;
