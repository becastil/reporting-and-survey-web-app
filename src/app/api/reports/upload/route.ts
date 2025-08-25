import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { csvUploads, reports } from '@/lib/db/schema'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const reportId = formData.get('reportId') as string
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Read file content
    const text = await file.text()
    
    // Parse CSV
    const parseResult = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    })
    
    // Validate CSV structure
    const validation = validateCSV(parseResult)
    
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        errors: validation.errors,
        warnings: validation.warnings,
      }, { status: 400 })
    }
    
    // Create or update report if reportId provided
    let finalReportId = reportId
    if (!finalReportId) {
      const [newReport] = await db.insert(reports).values({
        title: `CSV Import - ${file.name}`,
        description: `Imported from ${file.name} on ${new Date().toLocaleDateString()}`,
        type: 'csv_upload',
        status: 'processing',
        data: {},
      }).returning()
      finalReportId = newReport.id
    }
    
    // Save upload record
    const [upload] = await db.insert(csvUploads).values({
      reportId: finalReportId,
      filename: file.name,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      status: 'processing',
      validationResult: validation,
      processedData: parseResult.data,
    }).returning()
    
    // Process data asynchronously (in production, this would be a background job)
    processCSVData(upload.id, parseResult.data)
    
    return NextResponse.json({
      success: true,
      data: {
        uploadId: upload.id,
        reportId: finalReportId,
        preview: parseResult.data.slice(0, 5),
        validation,
      },
    })
  } catch (error) {
    console.error('Error uploading CSV:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload CSV' },
      { status: 500 }
    )
  }
}

function validateCSV(parseResult: any) {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Check if CSV has data
  if (!parseResult.data || parseResult.data.length === 0) {
    errors.push('CSV file is empty')
  }
  
  // Check for parsing errors
  if (parseResult.errors && parseResult.errors.length > 0) {
    parseResult.errors.forEach((error: any) => {
      errors.push(`Row ${error.row}: ${error.message}`)
    })
  }
  
  // Check for required columns (example)
  const requiredColumns = ['date', 'value']
  const headers = parseResult.meta?.fields || []
  const missingColumns = requiredColumns.filter(col => !headers.includes(col))
  
  if (missingColumns.length > 0) {
    warnings.push(`Missing recommended columns: ${missingColumns.join(', ')}`)
  }
  
  // Check for empty values
  if (parseResult.data && parseResult.data.length > 0) {
    const emptyFields: { [key: string]: number } = {}
    parseResult.data.forEach((row: any) => {
      Object.keys(row).forEach(key => {
        if (row[key] === null || row[key] === '') {
          emptyFields[key] = (emptyFields[key] || 0) + 1
        }
      })
    })
    
    Object.entries(emptyFields).forEach(([field, count]) => {
      if (count > 0) {
        warnings.push(`Column "${field}" has ${count} empty values`)
      }
    })
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

async function processCSVData(uploadId: string, data: any[]) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Update upload status
  await db
    .update(csvUploads)
    .set({
      status: 'completed',
      processedAt: new Date(),
    })
    .where(eq(csvUploads.id, uploadId))
  
  // Update report status
  const [upload] = await db
    .select()
    .from(csvUploads)
    .where(eq(csvUploads.id, uploadId))
  
  if (upload && upload.reportId) {
    await db
      .update(reports)
      .set({
        status: 'completed',
        data: {
          processedRows: data.length,
          columns: Object.keys(data[0] || {}),
          summary: generateDataSummary(data),
        },
      })
      .where(eq(reports.id, upload.reportId))
  }
}

function generateDataSummary(data: any[]) {
  // Generate basic summary statistics
  const summary: any = {
    totalRows: data.length,
    columns: {},
  }
  
  if (data.length > 0) {
    Object.keys(data[0]).forEach(column => {
      const values = data.map(row => row[column]).filter(v => v !== null && v !== '')
      const numericValues = values.filter(v => typeof v === 'number')
      
      if (numericValues.length > 0) {
        summary.columns[column] = {
          type: 'numeric',
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          nullCount: data.length - values.length,
        }
      } else {
        summary.columns[column] = {
          type: 'text',
          uniqueValues: new Set(values).size,
          nullCount: data.length - values.length,
        }
      }
    })
  }
  
  return summary
}

import { eq } from 'drizzle-orm'