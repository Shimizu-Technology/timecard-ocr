import axios from 'axios'
import type { PunchEntry, Timecard, PayrollRun } from '../types'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' }
})

export const getTimecards = (status?: string) =>
  client.get<Timecard[]>('/api/v1/timecards', { params: { status } }).then(r => r.data)

export const getTimecard = (id: string) =>
  client.get<Timecard>(`/api/v1/timecards/${id}`).then(r => r.data)

export const createTimecard = (file: File) => {
  const form = new FormData()
  form.append('image', file)
  return client.post<Timecard>('/api/v1/timecards', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}

export const updatePunchEntry = (id: string, data: Partial<PunchEntry>) =>
  client.patch<PunchEntry>(`/api/v1/punch_entries/${id}`, { punch_entry: data }).then(r => r.data)

export const createPayrollRun = (params: { period_start: string; period_end: string; ot_threshold?: number; ot_multiplier?: number }) =>
  client.post<PayrollRun>('/api/v1/payroll_runs', { payroll_run: params }).then(r => r.data)

export const getPayrollRun = (id: string) =>
  client.get<PayrollRun>(`/api/v1/payroll_runs/${id}`).then(r => r.data)

export const exportPayrollRun = (id: string) =>
  client.get(`/api/v1/payroll_runs/${id}/export`, { responseType: 'blob' }).then(r => r.data)
