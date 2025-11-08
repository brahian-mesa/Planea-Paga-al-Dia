import { Router } from "express";
import { getClients, getClient, createClient, updateClient, deleteClient } from "../controllers/client.controller";
import { authMiddleware } from "../middlewares/user.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getClients);
router.get("/:id", getClient);
router.post("/", createClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;
