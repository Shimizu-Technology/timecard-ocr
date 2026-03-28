import { useState } from 'react'
import { Download, Loader, Play } from 'lucide-react'
import { createPayrollRun, exportPayrollRun } from '../lib/api'
import type { PayrollRun } from '../types'

export default function PayrollSummaryScreen() {
  const [periodStart, setPeriodStart] = useState('2026-03-16')
  const [periodEnd, setPeriodEnd] = useState('2026-03-29')
  const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)

  const settings = JSON.parse(localStorage.getItem('timecard-settings') || '{}')

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const run = await createPayrollRun({
        period_start: periodStart,
        period_end: periodEnd,
        ot_threshold: settings.otWeeklyThreshold || 40,
        ot_multiplier: settings.otMultiplier || 1.5,
      })
      setPayrollRun(run)
    } catch (err) {
      console.error('Generate failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  const handleExport = async () => {
    if (!payrollRun) return
    setExporting(true)
    try {
      const blob = await exportPayrollRun(payrollRun.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payroll-${payrollRun.period_start}-${payrollRun.period_end}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  const summaries = payrollRun?.payroll_summaries || []

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Summary</h1>
        {payrollRun && (
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {exporting ? <Loader className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:gap-4">
        <label className="text-sm font-medium text-gray-700">Pay Period:</label>
        <div className="flex items-center gap-2">
          <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
          <span className="text-sm text-gray-500">to</span>
          <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {generating ? <Loader className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Generate
        </button>
      </div>

      {summaries.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Employee</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Regular Hrs</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">OT Hrs</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total Hrs</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {summaries.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{s.employee_name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700">{s.regular_hours.toFixed(1)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700">{s.overtime_hours.toFixed(1)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">{s.total_hours.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.flags.map((flag, i) => (
                        <span key={i} className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {payrollRun && summaries.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-8">No payroll data found for this period.</p>
      )}
    </div>
  )
}
