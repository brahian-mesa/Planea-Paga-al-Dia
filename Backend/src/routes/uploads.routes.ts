import express, { Router } from "express";
import { uploadFile } from "../controllers/upload.controller";
import multer from "multer";

const upload = multer({ dest: "src/uploads"});
const router = express.Router();

router.post("/upload", upload.single("file"), uploadFile);

export default router;
