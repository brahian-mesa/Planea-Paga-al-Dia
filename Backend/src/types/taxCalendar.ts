// Calendario Tributario Anual
export interface TaxCalendar {
    id?: string;
    year: number;
    file_name: string;
    file_url: string;
    uploaded_by: string; // user_id del contador
    created_at?: string;
}

// Fechas tributarias por último dígito del NIT
export interface TaxDate {
    id?: string;
    tax_calendar_id: string;
    ultimo_digito: number; // 0-9
    tipo_obligacion: string; // IVA, Renta, Retención, etc.
    fecha_vencimiento: string; // formato: YYYY-MM-DD
    descripcion?: string;
    created_at?: string;
}

// Interface para la respuesta de fechas por NIT
export interface TaxDatesByNit {
    nit: string;
    ultimo_digito: number;
    year: number;
    fechas: TaxDate[];
}
