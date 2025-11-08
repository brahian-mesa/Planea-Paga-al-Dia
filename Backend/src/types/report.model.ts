export interface Report {
  id?: string;
  client_id?: string;
  user_id: string;
  title: string; // Corregido de "tittle" a "title"
  report_type: string; // "tax_dates", "financial", "compliance", "custom"
  description?: string;
  report_url?: string;
  period_start?: string; // Fecha de inicio del período del reporte
  period_end?: string; // Fecha de fin del período del reporte
  status?: string; // "draft", "completed", "sent"
  created_at?: string;
  updated_at?: string;
}

// Estadísticas del dashboard
export interface DashboardStats {
  total_clients: number;
  total_reports: number;
  upcoming_deadlines: number;
  overdue_deadlines: number;
  reports_this_month: number;
}

// Reporte de fechas tributarias
export interface TaxDatesReport {
  client_id: string;
  client_name: string;
  nit: string;
  ultimo_digito: number;
  upcoming_dates: Array<{
    tipo_obligacion: string;
    fecha_vencimiento: string;
    descripcion: string;
    days_until_due: number;
  }>;
  overdue_dates: Array<{
    tipo_obligacion: string;
    fecha_vencimiento: string;
    descripcion: string;
    days_overdue: number;
  }>;
}
