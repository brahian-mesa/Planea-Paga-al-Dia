import { Request, Response } from "express";
import { ReportModel } from "../models/report.model";
import { ClientModel } from "../models/client.model";
import { TaxCalendarModel, TaxDateModel } from "../models/taxCalendar.model";
import { Report, DashboardStats, TaxDatesReport } from "../types/report.model";
import { getLastDigit } from "../utils/nitHelper";

/**
 * Crear un nuevo reporte
 */
export const createReport = async (req: Request, res: Response) => {
  try {
    const reportData: Report = req.body;

    if (!reportData.user_id || !reportData.title || !reportData.report_type) {
      return res.status(400).json({
        message: "Faltan campos requeridos: user_id, title, report_type",
      });
    }

    const { data, error } = await ReportModel.create(reportData);

    if (error) throw error;

    return res.status(201).json({
      message: "Reporte creado exitosamente",
      report: data,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Obtener todos los reportes de un usuario
 */
export const getReportsByUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await ReportModel.getByUserId(user_id);

    if (error) throw error;

    return res.status(200).json({
      reports: data || [],
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Obtener reportes de un cliente específico
 */
export const getReportsByClient = async (req: Request, res: Response) => {
  try {
    const { client_id } = req.params;

    const { data, error } = await ReportModel.getByClientId(client_id);

    if (error) throw error;

    return res.status(200).json({
      reports: data || [],
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Obtener un reporte por ID
 */
export const getReportById = async (req: Request, res: Response) => {
  try {
    const { report_id } = req.params;

    const { data, error } = await ReportModel.getById(report_id);

    if (error || !data) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    return res.status(200).json({
      report: data,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Actualizar un reporte
 */
export const updateReport = async (req: Request, res: Response) => {
  try {
    const { report_id } = req.params;
    const updateData = req.body;

    const { data, error } = await ReportModel.update(report_id, updateData);

    if (error) throw error;

    return res.status(200).json({
      message: "Reporte actualizado exitosamente",
      report: data,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Eliminar un reporte
 */
export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { report_id } = req.params;

    const { data, error } = await ReportModel.delete(report_id);

    if (error) throw error;

    return res.status(200).json({
      message: "Reporte eliminado exitosamente",
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Obtener dashboard con estadísticas generales
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;

    // Obtener total de clientes
    const { data: clients, error: clientsError } = await ClientModel.getByUserId(user_id);
    if (clientsError) throw clientsError;

    // Obtener total de reportes
    const { count: totalReports, error: reportsError } = await ReportModel.countByUserId(user_id);
    if (reportsError) throw reportsError;

    // Obtener reportes del mes actual
    const { count: reportsThisMonth, error: monthError } = await ReportModel.countThisMonth(user_id);
    if (monthError) throw monthError;

    // Calcular fechas próximas y vencidas
    const year = new Date().getFullYear();
    const today = new Date();
    let upcomingDeadlines = 0;
    let overdueDeadlines = 0;

    // Obtener calendario tributario del año actual
    const { data: calendar } = await TaxCalendarModel.getByYear(year);

    if (calendar && clients) {
      for (const client of clients) {
        if (!client.nit) continue;

        const ultimoDigito = getLastDigit(client.nit);
        const { data: dates } = await TaxDateModel.getByCalendarAndDigit(
          calendar.id!,
          ultimoDigito
        );

        if (dates) {
          for (const date of dates) {
            const dueDate = new Date(date.fecha_vencimiento);
            const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
              overdueDeadlines++;
            } else if (diffDays <= 30) {
              upcomingDeadlines++;
            }
          }
        }
      }
    }

    const stats: DashboardStats = {
      total_clients: clients?.length || 0,
      total_reports: totalReports || 0,
      upcoming_deadlines: upcomingDeadlines,
      overdue_deadlines: overdueDeadlines,
      reports_this_month: reportsThisMonth || 0,
    };

    return res.status(200).json(stats);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Generar reporte de fechas tributarias próximas
 */
export const generateTaxDatesReport = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const daysAhead = req.query.days ? parseInt(req.query.days as string) : 30;

    // Obtener clientes del usuario
    const { data: clients, error: clientsError } = await ClientModel.getByUserId(user_id);
    if (clientsError) throw clientsError;

    if (!clients || clients.length === 0) {
      return res.status(200).json({
        message: "No hay clientes registrados",
        reports: [],
      });
    }

    // Obtener calendario tributario
    const { data: calendar } = await TaxCalendarModel.getByYear(year);
    if (!calendar) {
      return res.status(404).json({
        message: `No existe calendario tributario para el año ${year}`,
      });
    }

    const today = new Date();
    const reports: TaxDatesReport[] = [];

    // Generar reporte para cada cliente
    for (const client of clients) {
      if (!client.nit) continue;

      const ultimoDigito = getLastDigit(client.nit);
      const { data: dates } = await TaxDateModel.getByCalendarAndDigit(
        calendar.id!,
        ultimoDigito
      );

      if (!dates) continue;

      const upcomingDates = [];
      const overdueDates = [];

      for (const date of dates) {
        const dueDate = new Date(date.fecha_vencimiento);
        const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          // Fecha vencida
          overdueDates.push({
            tipo_obligacion: date.tipo_obligacion,
            fecha_vencimiento: date.fecha_vencimiento,
            descripcion: date.descripcion || "",
            days_overdue: Math.abs(diffDays),
          });
        } else if (diffDays <= daysAhead) {
          // Fecha próxima
          upcomingDates.push({
            tipo_obligacion: date.tipo_obligacion,
            fecha_vencimiento: date.fecha_vencimiento,
            descripcion: date.descripcion || "",
            days_until_due: diffDays,
          });
        }
      }

      if (upcomingDates.length > 0 || overdueDates.length > 0) {
        reports.push({
          client_id: client.id!,
          client_name: client.nombre,
          nit: client.nit,
          ultimo_digito: ultimoDigito,
          upcoming_dates: upcomingDates,
          overdue_dates: overdueDates,
        });
      }
    }

    return res.status(200).json({
      year,
      days_ahead: daysAhead,
      total_clients: reports.length,
      reports,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Obtener reportes de fechas vencidas
 */
export const getOverdueReport = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    // Obtener clientes del usuario
    const { data: clients, error: clientsError } = await ClientModel.getByUserId(user_id);
    if (clientsError) throw clientsError;

    if (!clients || clients.length === 0) {
      return res.status(200).json({
        message: "No hay clientes registrados",
        overdue_items: [],
      });
    }

    // Obtener calendario tributario
    const { data: calendar } = await TaxCalendarModel.getByYear(year);
    if (!calendar) {
      return res.status(404).json({
        message: `No existe calendario tributario para el año ${year}`,
      });
    }

    const today = new Date();
    const overdueItems = [];

    // Buscar fechas vencidas para cada cliente
    for (const client of clients) {
      if (!client.nit) continue;

      const ultimoDigito = getLastDigit(client.nit);
      const { data: dates } = await TaxDateModel.getByCalendarAndDigit(
        calendar.id!,
        ultimoDigito
      );

      if (!dates) continue;

      for (const date of dates) {
        const dueDate = new Date(date.fecha_vencimiento);
        const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          overdueItems.push({
            client_id: client.id,
            client_name: client.nombre,
            nit: client.nit,
            tipo_obligacion: date.tipo_obligacion,
            fecha_vencimiento: date.fecha_vencimiento,
            descripcion: date.descripcion,
            days_overdue: Math.abs(diffDays),
          });
        }
      }
    }

    // Ordenar por días de atraso (mayor a menor)
    overdueItems.sort((a, b) => b.days_overdue - a.days_overdue);

    return res.status(200).json({
      year,
      total_overdue: overdueItems.length,
      overdue_items: overdueItems,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Obtener reportes por tipo
 */
export const getReportsByType = async (req: Request, res: Response) => {
  try {
    const { user_id, report_type } = req.params;

    const { data, error } = await ReportModel.getByType(user_id, report_type);

    if (error) throw error;

    return res.status(200).json({
      report_type,
      reports: data || [],
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
