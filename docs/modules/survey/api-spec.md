# Survey Module API Specification

## API Endpoints

### Upload Endpoints

#### POST /api/survey/upload
Upload and process a CSV survey file.

**Request:**
```typescript
Content-Type: multipart/form-data

{
  file: File,
  organizationId: string,
  period: string, // YYYY-MM
  options?: {
    validateOnly?: boolean,
    skipDuplicateCheck?: boolean,
    encoding?: string
  }
}
```

**Response:**
```typescript
{
  success: boolean,
  data: {
    uploadId: string,
    status: 'processing' | 'completed' | 'failed',
    file: {
      name: string,
      size: number,
      encoding: string,
      rows: number,
      columns: number
    },
    validation: {
      valid: boolean,
      errors: ValidationError[],
      warnings: ValidationWarning[],
      summary: {
        totalRows: number,
        validRows: number,
        errorRows: number,
        warningRows: number
      }
    },
    processing: {
      startedAt: string,
      completedAt?: string,
      duration?: number
    }
  },
  meta: {
    timestamp: string,
    requestId: string
  }
}
```

#### GET /api/survey/upload/:uploadId
Get upload status and results.

**Response:**
```typescript
{
  success: boolean,
  data: {
    uploadId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    progress: number, // 0-100
    file: FileMetadata,
    validation?: ValidationResult,
    errors?: ProcessingError[]
  }
}
```

#### POST /api/survey/validate
Validate a CSV file without processing.

**Request:**
```typescript
Content-Type: multipart/form-data

{
  file: File,
  schema?: 'standard' | 'extended' | 'custom',
  rules?: ValidationRule[]
}
```

**Response:**
```typescript
{
  success: boolean,
  data: {
    valid: boolean,
    errors: Array<{
      row: number,
      column: string,
      value: any,
      error: string,
      suggestion?: string
    }>,
    warnings: Array<{
      row: number,
      column: string,
      message: string
    }>,
    schema: {
      matched: boolean,
      missingRequired: string[],
      extraColumns: string[]
    }
  }
}
```

### History Endpoints

#### GET /api/survey/history
Get upload history for an organization.

**Query Parameters:**
- `organizationId`: string (required)
- `startDate`: string (YYYY-MM-DD)
- `endDate`: string (YYYY-MM-DD)
- `status`: 'all' | 'completed' | 'failed'
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response:**
```typescript
{
  success: boolean,
  data: {
    uploads: Upload[],
    pagination: {
      total: number,
      page: number,
      pages: number,
      limit: number
    }
  }
}
```

#### DELETE /api/survey/upload/:uploadId
Delete an upload and its associated data.

**Response:**
```typescript
{
  success: boolean,
  message: string,
  data: {
    deletedRows: number,
    deletedFiles: string[]
  }
}
```

### Template Endpoints

#### GET /api/survey/template
Download a CSV template for survey data.

**Query Parameters:**
- `type`: 'standard' | 'extended'
- `format`: 'csv' | 'xlsx'

**Response:**
- Content-Type: text/csv or application/vnd.openxmlformats
- Content-Disposition: attachment; filename="survey-template.csv"

#### GET /api/survey/mapping
Get current header mapping configuration.

**Response:**
```typescript
{
  success: boolean,
  data: {
    mappings: Array<{
      pattern: string,
      regex: string,
      field: string,
      type: 'required' | 'optional',
      transform?: string
    }>,
    version: string,
    lastUpdated: string
  }
}
```

## WebSocket Events

### Upload Progress Tracking
```typescript
// Client connects
ws.connect('/ws/survey/upload/:uploadId')

// Server events
{
  event: 'progress',
  data: {
    stage: 'uploading' | 'validating' | 'processing' | 'storing',
    progress: number, // 0-100
    message: string
  }
}

{
  event: 'validation',
  data: {
    row: number,
    status: 'valid' | 'error' | 'warning',
    message?: string
  }
}

{
  event: 'complete',
  data: {
    success: boolean,
    summary: ProcessingSummary
  }
}

{
  event: 'error',
  data: {
    error: string,
    recoverable: boolean
  }
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| SURV001 | File too large | File exceeds 500MB limit |
| SURV002 | Invalid format | File is not CSV/TSV |
| SURV003 | Missing required columns | Required columns not found |
| SURV004 | Encoding detection failed | Unable to detect file encoding |
| SURV005 | Validation failed | Business rule validation failed |
| SURV006 | Duplicate upload | Same file uploaded recently |
| SURV007 | Processing timeout | Processing exceeded time limit |
| SURV008 | Storage error | Failed to store processed data |

## Rate Limiting

- Upload endpoint: 10 requests per minute per user
- Validation endpoint: 20 requests per minute per user
- History endpoint: 100 requests per minute per user
- WebSocket connections: 5 concurrent per user

## Security

### Authentication
All endpoints require authentication via JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Permissions
- `survey:upload` - Required for upload endpoints
- `survey:validate` - Required for validation
- `survey:history` - Required for history access
- `survey:delete` - Required for deletion

### File Security
- MIME type validation
- Magic number checking
- Virus scanning via ClamAV
- Filename sanitization
- Secure temporary storage with auto-cleanup

---

**API Version:** 1.0.0
**Last Updated:** January 2025