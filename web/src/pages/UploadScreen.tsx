import { useState, useCallback } from 'react';
import { Upload, FileImage, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import type { OcrStatus } from '../types';

interface UploadedFile {
  file: File;
  status: OcrStatus;
}

export default function UploadScreen() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles: UploadedFile[] = Array.from(incoming).map((file) => ({
      file,
      status: 'pending' as OcrStatus,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleProcessAll = () => {
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'pending' ? { ...f, status: 'processing' as OcrStatus } : f,
      ),
    );
    // TODO: call API to process files
  };

  const statusIcon = (status: OcrStatus) => {
    switch (status) {
      case 'pending':
        return <FileImage className="h-5 w-5 text-gray-400" />;
      case 'processing':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const statusBadge = (status: OcrStatus) => {
    const styles: Record<OcrStatus, string> = {
      pending: 'bg-gray-100 text-gray-600',
      processing: 'bg-blue-100 text-blue-700',
      complete: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Upload Timecards</h1>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <Upload className="mb-4 h-10 w-10 text-gray-400" />
        <p className="mb-2 text-sm font-medium text-gray-700">
          Drag and drop timecard images here
        </p>
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

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Uploaded Files ({files.length})
            </h2>
            <button
              onClick={handleProcessAll}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Process All
            </button>
          </div>

          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {files.map((f, idx) => (
              <li key={idx} className="flex items-center gap-3 px-4 py-3">
                {statusIcon(f.status)}
                <span className="flex-1 truncate text-sm text-gray-700">
                  {f.file.name}
                </span>
                <span className="text-xs text-gray-400">
                  {(f.file.size / 1024).toFixed(0)} KB
                </span>
                {statusBadge(f.status)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
