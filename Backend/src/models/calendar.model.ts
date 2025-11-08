import { supabase } from "../config/supabaseClient";
import { Calendar } from "../types/calendar";

export const CalendarModel = {
  async getByUserId(user_id: string) {
    const { data, error } = await supabase
      .from("calendar")
      .select(`
        *,
        clients!inner(user_id)
      `)
      .eq("clients.user_id", user_id)
      .order("fecha_limite", { ascending: true });
    if (error) {
      throw error;
    }
    return data;
  },

  async getByClientId(client_id: string) {
    const { data, error } = await supabase
      .from("calendar")
      .select("*")
      .eq("client_id", client_id)
      .order("fecha_limite", { ascending: true });

    if (error) {
      throw error;
    }
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("calendar")
      .select("*")
      .eq("id", id);

    if (error) {
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  },

  async addEvent(event: Calendar) {
    const { data, error } = await supabase
      .from("calendar")
      .insert(event)
      .select();

    if (error) {
      throw error;
    }
    if (!data || data.length === 0) {
      throw new Error("No se pudo crear el evento");
    }
    return data[0];
  },

  async deleteEvent(id: string) {
    const { data, error } = await supabase
      .from("calendar")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }
    return data && data.length > 0 ? data[0] : null;
  },
  async updateEventById(id: string, updateEvent: Calendar) {
    const { data, error } = await supabase
      .from("calendar")
      .update(updateEvent)
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }
    return data && data.length > 0 ? data[0] : null;
  },
};
