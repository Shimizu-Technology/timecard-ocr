export interface PunchEntry {
  id: string
  timecard_id: string
  date: string
  day_of_week: string
  clock_in: string | null
  lunch_out: string | null
  lunch_in: string | null
  clock_out: string | null
  hours_worked: number | null
  confidence: number
  manually_edited: boolean
  notes: string | null
}

export interface Timecard {
  id: string
  employee_name: string | null
  period_start: string | null
  period_end: string | null
  image_url: string
  ocr_status: 'pending' | 'processing' | 'complete' | 'failed'
  overall_confidence: number | null
  punch_entries: PunchEntry[]
  created_at: string
}

export interface PayrollSummary {
  id: string
  employee_name: string
  regular_hours: number
  overtime_hours: number
  total_hours: number
  flags: string[]
}

export interface PayrollRun {
  id: string
  period_start: string
  period_end: string
  ot_threshold: number
  ot_multiplier: number
  rounding_rule: string
  generated_at: string
  payroll_summaries: PayrollSummary[]
}
