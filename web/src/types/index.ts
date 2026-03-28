export type OcrStatus = 'pending' | 'processing' | 'complete' | 'failed';

export interface PunchEntry {
  id: string;
  timecard_id: string;
  date: string;
  time_in: string;
  time_out: string;
  break_start: string;
  break_end: string;
  hours_worked: number;
  confidence_score: number;
  manually_edited: boolean;
}

export interface Timecard {
  id: string;
  employee_name: string;
  period_start: string;
  period_end: string;
  image_url: string;
  ocr_status: OcrStatus;
  created_at: string;
  punch_entries: PunchEntry[];
}

export interface PayrollSummary {
  id: string;
  payroll_run_id: string;
  employee_name: string;
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
  flags: string[];
}

export interface PayrollRun {
  id: string;
  period_start: string;
  period_end: string;
  generated_at: string;
  export_url: string;
  payroll_summaries: PayrollSummary[];
}
