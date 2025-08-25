'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  preview: any[]
}

export function CSVUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0]
    if (csvFile) {
      setFile(csvFile)
      validateFile(csvFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  })

  const validateFile = async (file: File) => {
    // Simulate validation
    setTimeout(() => {
      setValidation({
        valid: true,
        errors: [],
        warnings: ['Column "Region" has 3 empty values', 'Date format varies across rows'],
        preview: [
          { date: '2024-01-01', sales: 45000, region: 'North', product: 'Widget A' },
          { date: '2024-01-02', sales: 52000, region: 'South', product: 'Widget B' },
          { date: '2024-01-03', sales: 38000, region: 'East', product: 'Widget A' },
        ],
      })
    }, 1000)
  }

  const handleUpload = async () => {
    if (!file || !validation?.valid) return

    setUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const downloadTemplate = () => {
    const template = 'date,sales,region,product\n2024-01-01,45000,North,Widget A'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Download Template */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Download Template</CardTitle>
          <CardDescription>
            Start by downloading our CSV template with the correct format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download CSV Template
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Upload File */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Upload Your Data</CardTitle>
          <CardDescription>
            Drag and drop your CSV file or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop your CSV file here...</p>
            ) : (
              <>
                <p className="text-lg mb-2">Drag & drop your CSV file here</p>
                <p className="text-sm text-gray-600">or click to browse</p>
              </>
            )}
          </div>

          {file && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{file.name}</span>
                <span className="text-sm text-gray-600">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Validation Results */}
      {validation && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Validation Results</CardTitle>
            <CardDescription>
              Review validation results before processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {validation.valid ? (
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Validation Successful</AlertTitle>
                <AlertDescription>
                  Your CSV file is valid and ready to be processed
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Validation Failed</AlertTitle>
                <AlertDescription>
                  Please fix the errors below and try again
                </AlertDescription>
              </Alert>
            )}

            {validation.warnings.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle>Warnings</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2">
                    {validation.warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validation.preview.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Data Preview</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(validation.preview[0]).map((key) => (
                          <th
                            key={key}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {validation.preview.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((value: any, j) => (
                            <td key={j} className="px-4 py-2 text-sm">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {validation.valid && !uploading && (
              <div className="flex gap-2">
                <Button onClick={handleUpload} disabled={uploadProgress === 100}>
                  {uploadProgress === 100 ? 'Processing Complete' : 'Process File'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    setValidation(null)
                    setUploadProgress(0)
                  }}
                >
                  Reset
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}