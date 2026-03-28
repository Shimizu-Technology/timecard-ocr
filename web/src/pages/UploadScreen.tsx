import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { getTimecards, createTimecard } from '../lib/api'
import type { Timecard } from '../types'

export default function UploadScreen() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState<string[]>([])

  const { data: timecards = [], refetch } = useQuery({
    queryKey: ['timecards'],
    queryFn: () => getTimecards(),
    refetchInterval: (query) => {
      const data = query.state.data as Timecard[] | undefined
      const hasPending = data?.some(t => t.ocr_status === 'pending' || t.ocr_status === 'processing')
      return hasPending ? 3000 : false
    },
  })

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files)
    const names = fileArray.map(f => f.name)
    setUploading(prev => [...prev, ...names])

    for (const file of fileArray) {
      try {
        await createTimecard(file)
        refetch()
      } catch (err) {
        console.error('Upload failed:', file.name, err)
      } finally {
        setUploading(prev => prev.filter(n => n !== file.name))
      }
    }
  }, [refetch])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const statusIcon = (status: Timecard['ocr_status']) => {
    switch (status) {
      case 'pending': return <FileText className="h-5 w-5 text-gray-400" />
      case 'processing': return <Loader className="h-5 w-5 text-blue-500 animate-spin" />
      case 'complete': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed': return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  const statusBadge = (status: Timecard['ocr_status']) => {
    const styles: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-600',
      processing: 'bg-blue-100 text-blue-700',
      complete: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Upload Timecards</h1>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <Upload className="mb-4 h-10 w-10 text-gray-400" />
        <p className="mb-2 text-sm font-medium text-gray-700">Drag and drop timecard images here</p>
        <p className="mb-4 text-xs text-gray-500">JPG, PNG, or HEIC</p>
        <label className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Browse Files
          <input
            type="file"
            className="hidden"
            multiple
            accept=".jpg,.jpeg,.png,.heic"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {uploading.length > 0 && (
        <div className="mt-4">
          {uploading.map(name => (
            <div key={name} className="flex items-center gap-2 text-sm text-blue-600">
              <Loader className="h-4 w-4 animate-spin" />
              Uploading {name}...
            </div>
          ))}
        </div>
      )}

      {timecards.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Timecards ({timecards.length})
          </h2>
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {timecards.map((tc) => (
              <li key={tc.id} className="flex items-center gap-3 px-4 py-3">
                {statusIcon(tc.ocr_status)}
                <div className="flex-1 min-w-0">
                  {tc.ocr_status === 'complete' ? (
                    <Link to={`/review/${tc.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate block">
                      {tc.employee_name || 'Unknown Employee'}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-700 truncate block">
                      {tc.employee_name || 'Processing...'}
                    </span>
                  )}
                  {tc.period_start && tc.period_end && (
                    <span className="text-xs text-gray-400">{tc.period_start} to {tc.period_end}</span>
                  )}
                </div>
                {tc.overall_confidence != null && (
                  <span className="text-xs text-gray-400">{(tc.overall_confidence * 100).toFixed(0)}%</span>
                )}
                {statusBadge(tc.ocr_status)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
