import { useState } from 'react';
import { Download } from 'lucide-react';
import type { PayrollSummary } from '../types';

const SAMPLE_DATA: PayrollSummary[] = [
  {
    id: '1',
    payroll_run_id: '1',
    employee_name: 'Alice Johnson',
    regular_hours: 40,
    overtime_hours: 5,
    total_hours: 45,
    flags: ['overtime'],
  },
  {
    id: '2',
    payroll_run_id: '1',
    employee_name: 'Bob Smith',
    regular_hours: 38,
    overtime_hours: 0,
    total_hours: 38,
    flags: [],
  },
  {
    id: '3',
    payroll_run_id: '1',
    employee_name: 'Carol Davis',
    regular_hours: 40,
    overtime_hours: 12,
    total_hours: 52,
    flags: ['overtime', 'exceeds-50'],
  },
];

const FLAG_STYLES: Record<string, string> = {
  overtime: 'bg-amber-100 text-amber-800',
  'exceeds-50': 'bg-red-100 text-red-800',
  'missing-punch': 'bg-orange-100 text-orange-800',
};

export default function PayrollSummaryScreen() {
  const [periodStart, setPeriodStart] = useState('2026-03-16');
  const [periodEnd, setPeriodEnd] = useState('2026-03-29');
  const [summaries] = useState<PayrollSummary[]>(SAMPLE_DATA);

  const handleExport = () => {
    // TODO: call API to generate CSV export
    console.log('Exporting CSV for period', periodStart, '-', periodEnd);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Summary</h1>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Pay period selector */}
      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:gap-4">
        <label className="text-sm font-medium text-gray-700">Pay Period:</label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <span className="text-sm text-gray-500">to</span>
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Summary table */}
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
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                  {s.employee_name}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700">
                  {s.regular_hours.toFixed(1)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700">
                  {s.overtime_hours.toFixed(1)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {s.total_hours.toFixed(1)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {s.flags.map((flag) => (
                      <span
                        key={flag}
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${FLAG_STYLES[flag] || 'bg-gray-100 text-gray-700'}`}
                      >
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
    </div>
  );
}
