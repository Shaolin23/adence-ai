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
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Processing file...</p>
          </div>
        ) : uploadedFile ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-md mx-auto">
              <div className="flex items-center">
                <svg className="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-green-600 mt-2">File processed successfully</p>
          </div>
        ) : (
          <div>
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-gray-600">
              <p className="mb-2">
                {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports PDF, DOCX, TXT files up to 5MB
              </p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  )
}

export default FileUpload