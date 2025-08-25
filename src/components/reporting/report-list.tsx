'use client'

import { useState } from 'react'
import { MoreVertical, Download, Eye, Edit, Trash, Share2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface Report {
  id: string
  title: string
  description: string
  type: 'csv_upload' | 'survey_based' | 'custom'
  status: 'draft' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
  dataPoints: number
  fileSize?: string
}

const mockReports: Report[] = [
  {
    id: '1',
    title: 'Q4 Sales Analysis',
    description: 'Quarterly sales performance report with regional breakdown',
    type: 'csv_upload',
    status: 'completed',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19'),
    dataPoints: 15420,
    fileSize: '2.3 MB',
  },
  {
    id: '2',
    title: 'Customer Feedback Summary',
    description: 'Aggregated customer feedback from multiple surveys',
    type: 'survey_based',
    status: 'completed',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-17'),
    dataPoints: 8934,
  },
  {
    id: '3',
    title: 'Marketing Campaign Performance',
    description: 'Campaign metrics and ROI analysis',
    type: 'csv_upload',
    status: 'processing',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    dataPoints: 5621,
    fileSize: '1.8 MB',
  },
  {
    id: '4',
    title: 'Employee Productivity Metrics',
    description: 'Team performance and productivity analysis',
    type: 'custom',
    status: 'draft',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
    dataPoints: 3240,
  },
]

export function ReportList() {
  const [reports] = useState<Report[]>(mockReports)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'processing':
        return 'secondary'
      case 'draft':
        return 'outline'
      case 'failed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'csv_upload':
        return '📊'
      case 'survey_based':
        return '📋'
      case 'custom':
        return '⚙️'
      default:
        return '📄'
    }
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getTypeIcon(report.type)}</span>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <Badge variant={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                </div>
                <CardDescription>{report.description}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href={`/reporting/${report.id}/view`}>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Report
                    </DropdownMenuItem>
                  </Link>
                  <Link href={`/reporting/${report.id}/edit`}>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Report
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Data Points</p>
                <p className="font-semibold">{report.dataPoints.toLocaleString()}</p>
              </div>
              {report.fileSize && (
                <div>
                  <p className="text-gray-600">File Size</p>
                  <p className="font-semibold">{report.fileSize}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-semibold">{formatDate(report.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="font-semibold">{formatDate(report.updatedAt)}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {report.status === 'completed' && (
                <>
                  <Link href={`/reporting/${report.id}/dashboard`}>
                    <Button size="sm">
                      View Dashboard
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </>
              )}
              {report.status === 'processing' && (
                <Button size="sm" disabled>
                  Processing...
                </Button>
              )}
              {report.status === 'draft' && (
                <Button size="sm">
                  Complete Setup
                </Button>
              )}
              {report.status === 'failed' && (
                <Button size="sm" variant="destructive">
                  Retry Processing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}