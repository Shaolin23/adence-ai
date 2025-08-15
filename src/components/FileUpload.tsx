// /src/components/FileUpload.tsx
'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone, FileRejection, DropzoneOptions } from 'react-dropzone'

interface FileUploadProps {
  onFileProcessed: (content: string) => void
  accept?: Record<string, string[]>
  maxSize?: number
}

interface ProcessedFile {
  file: File
  errors: string[]
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileProcessed, 
  accept = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt']
  },
  maxSize = 5 * 1024 * 1024 // 5MB
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const processFile = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf') {
      // For PDF processing, you'll need to implement PDF.js or similar
      // For now, return placeholder text
      return `PDF file processed: ${file.name}. Content extraction would go here.`
    }
    
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        return result.value
      } catch (error) {
        throw new Error('Failed to process Word document')
      }
    }
    
    if (file.type === 'text/plain') {
      return await file.text()
    }
    
    throw new Error('Unsupported file type')
  }

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError('')
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File too large. Maximum size is 5MB.')
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a PDF, DOCX, or TXT file.')
      } else {
        setError('File upload failed. Please try again.')
      }
      return
    }

    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploadedFile(file)
    setIsProcessing(true)

    try {
      const content = await processFile(file)
      onFileProcessed(content)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }, [onFileProcessed])

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: isProcessing
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions)

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setUploadedFile(null)
    setError('')
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden
          border-2 border-dashed rounded-lg p-8 
          text-center cursor-pointer 
          transition-all duration-300 ease-in-out
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]' 
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          }
          ${isProcessing 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }
          ${error 
            ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20' 
            : ''
          }
          ${uploadedFile && !error 
            ? 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-950/20' 
            : ''
          }
        `}
      >
        <input {...getInputProps()} />
        
        {/* Background animation for drag state */}
        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
        )}
        
        {isProcessing ? (
          <div className="flex flex-col items-center space-y-4 animate-fadeIn">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800"></div>
              <div className="absolute top-0 animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-600"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Processing file...</p>
            <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        ) : uploadedFile ? (
          <div className="flex flex-col items-center space-y-4 animate-slideUp">
            <div className="flex items-center justify-between w-full max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="ml-4 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 
                         hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
                aria-label="Remove file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              File processed successfully
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600">
              <svg stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path 
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                  strokeWidth={2} 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              <p className="text-lg font-medium mb-1">
                {isDragActive ? 'Drop your file here' : 'Upload your resume'}
              </p>
              <p className="text-sm">
                Drag and drop or <span className="text-blue-600 dark:text-blue-400 font-medium">browse files</span>
              </p>
            </div>
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF, DOCX, TXT
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h10m-7 5h4" />
                </svg>
                Max 5MB
              </span>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 
                      text-red-700 dark:text-red-400 rounded-lg flex items-start gap-3 animate-slideDown">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="font-medium">Upload Failed</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload