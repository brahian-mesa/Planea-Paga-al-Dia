import { supabase } from "../config/supabaseClient";
import { TaxCalendar, TaxDate } from "../types/taxCalendar";

export const TaxCalendarModel = {
  // Obtener calendario tributario por año
  async getByYear(year: number) {
    return await supabase
      .from("tax_calendars")
      .select("*")
      .eq("year", year)
      .single();
  },

  // Crear nuevo calendario tributario
  async create(calendar: TaxCalendar) {
    return await supabase
      .from("tax_calendars")
      .insert(calendar)
      .select()
      .single();
  },

  // Obtener todos los calendarios
  async getAll() {
    return await supabase
      .from("tax_calendars")
      .select("*")
      .order("year", { ascending: false });
  },

  // Eliminar calendario por ID
  async delete(id: string) {
    return await supabase.from("tax_calendars").delete().eq("id", id);
  },
};

export const TaxDateModel = {
  // Crear fechas tributarias (bulk insert)
  async createMany(dates: TaxDate[]) {
    return await supabase.from("tax_dates").insert(dates).select();
  },

  // Obtener fechas por calendario y último dígito
  async getByCalendarAndDigit(calendarId: string, ultimoDigito: number) {
    return await supabase
      .from("tax_dates")
      .select("*")
      .eq("tax_calendar_id", calendarId)
      .eq("ultimo_digito", ultimoDigito)
      .order("fecha_vencimiento", { ascending: true });
  },

  // Obtener todas las fechas de un calendario
  async getByCalendar(calendarId: string) {
    return await supabase
      .from("tax_dates")
      .select("*")
      .eq("tax_calendar_id", calendarId)
      .order("ultimo_digito", { ascending: true });
  },

  // Eliminar fechas por calendario
  async deleteByCalendar(calendarId: string) {
    return await supabase
      .from("tax_dates")
      .delete()
      .eq("tax_calendar_id", calendarId);
  },
};
