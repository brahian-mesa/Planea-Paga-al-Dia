import { supabase } from "../config/supabaseClient";
import { Client } from "../types/client";

export const ClientModel = {
  async getByUserId(user_id: string) {
    return await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
  },
  async getById(id: string) {
    return await supabase.from("clients").select("*").eq("id", id).single();
  },
  async create(client: Client) {
    return await supabase.from("clients").insert(client).select().single();
  },
  async update(id: string, data: Client) {
    return await supabase
      .from("clients")
      .update(data)
      .eq("id", id)
      .select()
      .single();
  },
  async delete(id: string) {
    return await supabase.from("clients").delete().eq("id", id).select();
  },
};
