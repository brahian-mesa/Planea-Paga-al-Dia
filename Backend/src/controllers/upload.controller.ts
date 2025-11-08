import { Request, Response } from "express";
import fs from "fs";
import { supabase } from "../config/supabaseClient";
import { Upload } from "../types/upload.model";

// @ts-ignore - pdf-parse doesn't have proper TypeScript types
const pdfParse = require("pdf-parse");

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { client_id, user_id } = req.body;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const bucket = "uploads";
    const filePath = `${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fs.readFileSync(file.path), {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    // Extraer texto del PDF
    const buffer = fs.readFileSync(file.path);
    const pdfData = await pdfParse(buffer);

    const { error: insertError } = await supabase.from("uploads").insert([
      {
        client_id,
        user_id,
        file_name: file.originalname,
        file_url: publicUrl,
        file_type: file.mimetype,
        extracted_text: pdfData.text,
      } as Upload,
    ]);

    if (insertError) throw insertError;

    // Eliminar archivo temporal
    fs.unlinkSync(file.path);

    return res.status(201).json({
      message: "Archivo subido y procesado correctamente",
      file_url: publicUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
