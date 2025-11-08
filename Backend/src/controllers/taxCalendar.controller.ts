import { Request, Response } from "express";
import fs from "fs";
import { supabase } from "../config/supabaseClient";
import { TaxCalendar, TaxDate } from "../types/taxCalendar";
import { TaxCalendarModel, TaxDateModel } from "../models/taxCalendar.model";
import { ClientModel } from "../models/client.model";
import { getLastDigit, validateNit } from "../utils/nitHelper";

/**
 * Subir calendario tributario anual (PDF)
 * El contador sube el PDF y registra las fechas por dígito
 */
export const uploadTaxCalendar = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { year, user_id } = req.body;

    if (!file) {
      return res.status(400).json({ message: "No se ha subido ningún archivo" });
    }

    if (!year || !user_id) {
      return res.status(400).json({
        message: "Faltan datos requeridos: year y user_id"
      });
    }

    // Verificar si ya existe un calendario para ese año
    const { data: existingCalendar } = await TaxCalendarModel.getByYear(parseInt(year));
    if (existingCalendar) {
      // Eliminar archivo temporal
      fs.unlinkSync(file.path);
      return res.status(409).json({
        message: `Ya existe un calendario tributario para el año ${year}`
      });
    }

    // Subir archivo a Supabase Storage
    const bucket = "tax-calendars";
    const filePath = `${year}/${Date.now()}-${file.originalname}`;

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

    // Guardar registro del calendario en la base de datos
    const { data: calendarData, error: insertError } = await TaxCalendarModel.create({
      year: parseInt(year),
      file_name: file.originalname,
      file_url: publicUrl,
      uploaded_by: user_id,
    });

    if (insertError) throw insertError;

    // Eliminar archivo temporal
    fs.unlinkSync(file.path);

    return res.status(201).json({
      message: "Calendario tributario subido correctamente",
      calendar: calendarData,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Agregar fechas tributarias para un calendario
 * El contador debe especificar las fechas por cada dígito (0-9)
 */
export const addTaxDates = async (req: Request, res: Response) => {
  try {
    const { tax_calendar_id, dates } = req.body;

    if (!tax_calendar_id || !dates || !Array.isArray(dates)) {
      return res.status(400).json({
        message: "Datos incompletos: se requiere tax_calendar_id y array de fechas"
      });
    }

    // Validar que cada fecha tenga los campos requeridos
    for (const date of dates) {
      if (
        date.ultimo_digito === undefined ||
        !date.tipo_obligacion ||
        !date.fecha_vencimiento
      ) {
        return res.status(400).json({
          message: "Cada fecha debe tener: ultimo_digito, tipo_obligacion y fecha_vencimiento",
        });
      }
    }

    // Insertar fechas
    const taxDates: TaxDate[] = dates.map((d: any) => ({
      tax_calendar_id,
      ultimo_digito: parseInt(d.ultimo_digito),
      tipo_obligacion: d.tipo_obligacion,
      fecha_vencimiento: d.fecha_vencimiento,
      descripcion: d.descripcion || null,
    }));

    const { data, error } = await TaxDateModel.createMany(taxDates);

    if (error) throw error;

    return res.status(201).json({
      message: "Fechas tributarias agregadas correctamente",
      dates: data,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Obtener fechas tributarias de un cliente según su NIT
 * Lee el último dígito del NIT y retorna las fechas correspondientes
 */
export const getTaxDatesByClientId = async (req: Request, res: Response) => {
  try {
    const { client_id } = req.params;
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : new Date().getFullYear();

    // Obtener datos del cliente
    const { data: client, error: clientError } = await ClientModel.getById(client_id);

    if (clientError || !client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    if (!client.nit) {
      return res.status(400).json({
        message: "El cliente no tiene NIT registrado"
      });
    }

    // Validar NIT
    if (!validateNit(client.nit)) {
      return res.status(400).json({
        message: "El NIT del cliente no es válido"
      });
    }

    // Extraer último dígito del NIT
    const ultimoDigito = getLastDigit(client.nit);

    // Obtener calendario tributario del año
    const { data: calendar, error: calendarError } = await TaxCalendarModel.getByYear(year);

    if (calendarError || !calendar) {
      return res.status(404).json({
        message: `No existe calendario tributario para el año ${year}`
      });
    }

    // Obtener fechas correspondientes al último dígito
    const { data: dates, error: datesError } = await TaxDateModel.getByCalendarAndDigit(
      calendar.id!,
      ultimoDigito
    );

    if (datesError) throw datesError;

    return res.status(200).json({
      nit: client.nit,
      ultimo_digito: ultimoDigito,
      year: calendar.year,
      calendar_pdf: calendar.file_url,
      fechas: dates || [],
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Obtener fechas tributarias por NIT directo (sin necesidad de tener el cliente registrado)
 */
export const getTaxDatesByNit = async (req: Request, res: Response) => {
  try {
    const { nit } = req.params;
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : new Date().getFullYear();

    if (!nit) {
      return res.status(400).json({ message: "Se requiere el NIT" });
    }

    // Validar NIT
    if (!validateNit(nit)) {
      return res.status(400).json({ message: "NIT inválido" });
    }

    // Extraer último dígito
    const ultimoDigito = getLastDigit(nit);

    // Obtener calendario tributario del año
    const { data: calendar, error: calendarError } = await TaxCalendarModel.getByYear(year);

    if (calendarError || !calendar) {
      return res.status(404).json({
        message: `No existe calendario tributario para el año ${year}`
      });
    }

    // Obtener fechas correspondientes al último dígito
    const { data: dates, error: datesError } = await TaxDateModel.getByCalendarAndDigit(
      calendar.id!,
      ultimoDigito
    );

    if (datesError) throw datesError;

    return res.status(200).json({
      nit,
      ultimo_digito: ultimoDigito,
      year: calendar.year,
      calendar_pdf: calendar.file_url,
      fechas: dates || [],
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Obtener todos los calendarios tributarios disponibles
 */
export const getAllTaxCalendars = async (req: Request, res: Response) => {
  try {
    const { data, error } = await TaxCalendarModel.getAll();

    if (error) throw error;

    return res.status(200).json({
      calendars: data || [],
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Obtener todas las fechas de un calendario específico
 */
export const getTaxDatesByCalendar = async (req: Request, res: Response) => {
  try {
    const { calendar_id } = req.params;

    const { data, error } = await TaxDateModel.getByCalendar(calendar_id);

    if (error) throw error;

    return res.status(200).json({
      dates: data || [],
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
