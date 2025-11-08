export interface Client {
    id?: string;
    user_id: string;
    nombre: string;  // Columna en Supabase es "nombre", no "name"
    nit: string;
    tipo_client: string;  // Columna en Supabase es "tipo_client", no "tipo_cliente"
    created_at?: string;
}
