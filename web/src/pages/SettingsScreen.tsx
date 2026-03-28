import { useState, useEffect } from 'react'
import { Save, CheckCircle } from 'lucide-react'

interface Settings {
  otWeeklyThreshold: number
  otMultiplier: number
  roundingRule: string
  payPeriodType: string
  timeFormat: string
}

const DEFAULTS: Settings = {
  otWeeklyThreshold: 40,
  otMultiplier: 1.5,
  roundingRule: '15min',
  payPeriodType: 'bi-weekly',
  timeFormat: '12hr',
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('timecard-settings')
    if (stored) {
      setSettings({ ...DEFAULTS, ...JSON.parse(stored) })
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('timecard-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="otThreshold" className="block text-sm font-medium text-gray-700">
              Overtime Weekly Threshold (hours)
            </label>
            <input id="otThreshold" type="number" min={0} step={1}
              value={settings.otWeeklyThreshold}
              onChange={(e) => setSettings({ ...settings, otWeeklyThreshold: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label htmlFor="otMultiplier" className="block text-sm font-medium text-gray-700">
              Overtime Multiplier
            </label>
            <input id="otMultiplier" type="number" min={1} step={0.1}
              value={settings.otMultiplier}
              onChange={(e) => setSettings({ ...settings, otMultiplier: parseFloat(e.target.value) || 1 })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none" />
          </div>

          <div>
            <label htmlFor="roundingRule" className="block text-sm font-medium text-gray-700">
              Rounding Rule
            </label>
            <select id="roundingRule" value={settings.roundingRule}
              onChange={(e) => setSettings({ ...settings, roundingRule: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none">
              <option value="15min">15 minutes</option>
              <option value="6min">6 minutes</option>
              <option value="exact">Exact</option>
            </select>
          </div>

          <div>
            <label htmlFor="payPeriodType" className="block text-sm font-medium text-gray-700">
              Pay Period Type
            </label>
            <select id="payPeriodType" value={settings.payPeriodType}
              onChange={(e) => setSettings({ ...settings, payPeriodType: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none">
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
            </select>
          </div>

          <div>
            <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700">
              Time Format
            </label>
            <select id="timeFormat" value={settings.timeFormat}
              onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none">
              <option value="12hr">12-hour</option>
              <option value="24hr">24-hour</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" /> Saved
            </span>
          )}
          <button onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <Save className="h-4 w-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
