import { supabase } from "../config/supabaseClient";
import { Report } from "../types/report.model";

export const ReportModel = {
  // Crear nuevo reporte
  async create(report: Report) {
    return await supabase
      .from("reports")
      .insert(report)
      .select()
      .single();
  },

  // Obtener reportes por usuario (contador)
  async getByUserId(user_id: string) {
    return await supabase
      .from("reports")
      .select(`
        *,
        clients(id, nombre, nit)
      `)
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
  },

  // Obtener reportes por cliente
  async getByClientId(client_id: string) {
    return await supabase
      .from("reports")
      .select("*")
      .eq("client_id", client_id)
      .order("created_at", { ascending: false });
  },

  // Obtener reporte por ID
  async getById(id: string) {
    return await supabase
      .from("reports")
      .select(`
        *,
        clients(id, nombre, nit, tipo_client)
      `)
      .eq("id", id)
      .single();
  },

  // Actualizar reporte
  async update(id: string, data: Partial<Report>) {
    return await supabase
      .from("reports")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
  },

  // Eliminar reporte
  async delete(id: string) {
    return await supabase
      .from("reports")
      .delete()
      .eq("id", id)
      .select();
  },

  // Obtener reportes por tipo
  async getByType(user_id: string, report_type: string) {
    return await supabase
      .from("reports")
      .select(`
        *,
        clients(id, nombre, nit)
      `)
      .eq("user_id", user_id)
      .eq("report_type", report_type)
      .order("created_at", { ascending: false });
  },

  // Obtener reportes por período
  async getByPeriod(user_id: string, start_date: string, end_date: string) {
    return await supabase
      .from("reports")
      .select(`
        *,
        clients(id, nombre, nit)
      `)
      .eq("user_id", user_id)
      .gte("period_start", start_date)
      .lte("period_end", end_date)
      .order("created_at", { ascending: false });
  },

  // Contar reportes por usuario
  async countByUserId(user_id: string) {
    return await supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user_id);
  },

  // Contar reportes del mes actual
  async countThisMonth(user_id: string) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return await supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user_id)
      .gte("created_at", firstDay.toISOString())
      .lte("created_at", lastDay.toISOString());
  },
};
