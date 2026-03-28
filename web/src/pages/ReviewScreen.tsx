import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, ImageIcon } from 'lucide-react';
import type { PunchEntry } from '../types';

const SAMPLE_ENTRIES: PunchEntry[] = [
  {
    id: '1',
    timecard_id: '1',
    date: '2026-03-23',
    time_in: '08:00',
    time_out: '17:00',
    break_start: '12:00',
    break_end: '12:30',
    hours_worked: 8.5,
    confidence_score: 0.95,
    manually_edited: false,
  },
  {
    id: '2',
    timecard_id: '1',
    date: '2026-03-24',
    time_in: '08:15',
    time_out: '16:45',
    break_start: '12:00',
    break_end: '12:30',
    hours_worked: 8.0,
    confidence_score: 0.72,
    manually_edited: false,
  },
  {
    id: '3',
    timecard_id: '1',
    date: '2026-03-25',
    time_in: '09:00',
    time_out: '17:30',
    break_start: '12:30',
    break_end: '13:00',
    hours_worked: 8.0,
    confidence_score: 0.45,
    manually_edited: false,
  },
];

function confidenceDot(score: number) {
  if (score >= 0.8) return <span className="inline-block h-3 w-3 rounded-full bg-green-500" title={`${(score * 100).toFixed(0)}%`} />;
  if (score >= 0.6) return <span className="inline-block h-3 w-3 rounded-full bg-yellow-500" title={`${(score * 100).toFixed(0)}%`} />;
  return <span className="inline-block h-3 w-3 rounded-full bg-red-500" title={`${(score * 100).toFixed(0)}%`} />;
}

export default function ReviewScreen() {
  const { id } = useParams<{ id: string }>();
  const [entries, setEntries] = useState<PunchEntry[]>(SAMPLE_ENTRIES);

  const handleChange = (index: number, field: keyof PunchEntry, value: string) => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value, manually_edited: true } : entry,
      ),
    );
  };

  const handleSave = () => {
    // TODO: call API to save entries
    console.log('Saving entries for timecard', id, entries);
  };

  return (
    <div className="px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Review Timecard #{id}</h1>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <button className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Image preview */}
        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8 min-h-[400px]">
          <div className="flex flex-col items-center text-gray-400">
            <ImageIcon className="mb-2 h-16 w-16" />
            <p className="text-sm">Timecard image preview</p>
          </div>
        </div>

        {/* Editable table */}
        <div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Time In</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Time Out</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Break Start</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Break End</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Hours</th>
                  <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Conf.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {entries.map((entry, idx) => (
                  <tr key={entry.id} className={entry.manually_edited ? 'bg-yellow-50' : ''}>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={entry.date}
                        onChange={(e) => handleChange(idx, 'date', e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="time"
                        value={entry.time_in}
                        onChange={(e) => handleChange(idx, 'time_in', e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="time"
                        value={entry.time_out}
                        onChange={(e) => handleChange(idx, 'time_out', e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="time"
                        value={entry.break_start}
                        onChange={(e) => handleChange(idx, 'break_start', e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="time"
                        value={entry.break_end}
                        onChange={(e) => handleChange(idx, 'break_end', e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 text-center">
                      {entry.hours_worked.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {confidenceDot(entry.confidence_score)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
