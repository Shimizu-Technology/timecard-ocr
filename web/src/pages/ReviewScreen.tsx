import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Save, ImageIcon, Loader } from 'lucide-react'
import { getTimecard, updatePunchEntry } from '../lib/api'
import type { PunchEntry } from '../types'

function confidenceDot(score: number) {
  if (score >= 0.9) return <span className="inline-block h-3 w-3 rounded-full bg-green-500" title={`${(score * 100).toFixed(0)}%`} />
  if (score >= 0.7) return <span className="inline-block h-3 w-3 rounded-full bg-yellow-500" title={`${(score * 100).toFixed(0)}%`} />
  return <span className="inline-block h-3 w-3 rounded-full bg-red-500" title={`${(score * 100).toFixed(0)}%`} />
}

export default function ReviewScreen() {
  const { id } = useParams<{ id: string }>()
  const [entries, setEntries] = useState<PunchEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [editedIds, setEditedIds] = useState<Set<string>>(new Set())

  const { data: timecard, isLoading, error } = useQuery({
    queryKey: ['timecard', id],
    queryFn: () => getTimecard(id!),
    enabled: !!id,
    select: (data) => {
      if (entries.length === 0 && data.punch_entries?.length > 0) {
        setEntries(data.punch_entries)
      }
      return data
    },
  })

  const handleChange = (entryId: string, field: keyof PunchEntry, value: string) => {
    setEntries(prev => prev.map(e =>
      e.id === entryId ? { ...e, [field]: value || null, manually_edited: true } : e
    ))
    setEditedIds(prev => new Set(prev).add(entryId))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const entry of entries) {
        if (editedIds.has(entry.id)) {
          await updatePunchEntry(entry.id, {
            clock_in: entry.clock_in,
            lunch_out: entry.lunch_out,
            lunch_in: entry.lunch_in,
            clock_out: entry.clock_out,
            notes: entry.notes,
          })
        }
      }
      setEditedIds(new Set())
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !timecard) {
    return (
      <div className="px-4 py-8 text-center text-red-600">
        Failed to load timecard.
      </div>
    )
  }

  return (
    <div className="px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {timecard.employee_name || 'Timecard'}
          </h1>
        </div>
        {timecard.period_start && timecard.period_end && (
          <span className="text-sm text-gray-500">{timecard.period_start} to {timecard.period_end}</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Image preview */}
        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4 min-h-[400px]">
          {timecard.image_url ? (
            <img src={timecard.image_url} alt="Timecard" className="max-h-[600px] w-auto rounded" />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <ImageIcon className="mb-2 h-16 w-16" />
              <p className="text-sm">No image available</p>
            </div>
          )}
        </div>

        {/* Editable table */}
        <div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Day</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Clock In</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Lunch Out</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Lunch In</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Clock Out</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Hours</th>
                  <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Conf.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {entries.map((entry) => (
                  <tr key={entry.id} className={editedIds.has(entry.id) ? 'bg-yellow-50' : ''}>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700">{entry.date}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{entry.day_of_week}</td>
                    <td className="px-3 py-2">
                      <input type="time" value={entry.clock_in || ''} onChange={(e) => handleChange(entry.id, 'clock_in', e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="time" value={entry.lunch_out || ''} onChange={(e) => handleChange(entry.id, 'lunch_out', e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="time" value={entry.lunch_in || ''} onChange={(e) => handleChange(entry.id, 'lunch_in', e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="time" value={entry.clock_out || ''} onChange={(e) => handleChange(entry.id, 'clock_out', e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none" />
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 text-center">
                      {entry.hours_worked != null ? entry.hours_worked.toFixed(1) : '-'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {confidenceDot(entry.confidence)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || editedIds.size === 0}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
