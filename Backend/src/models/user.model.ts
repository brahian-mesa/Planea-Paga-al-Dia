import { supabase } from "../config/supabaseClient";
import { User } from "../types/user";

export const UserModel = {
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data as User;
  },

  async create(name: string, email: string, password: string): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email, password }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as User;
  },

  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as User;
  },
};
