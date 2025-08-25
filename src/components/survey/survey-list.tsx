'use client'

import { useState } from 'react'
import { MoreVertical, Eye, Edit, Copy, Trash, BarChart3 } from 'lucide-react'
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

interface Survey {
  id: string
  title: string
  description: string
  status: 'active' | 'draft' | 'completed'
  responses: number
  createdAt: Date
  updatedAt: Date
  completionRate: number
}

const mockSurveys: Survey[] = [
  {
    id: '1',
    title: 'Customer Satisfaction Q4 2024',
    description: 'Quarterly customer satisfaction survey for product feedback',
    status: 'active',
    responses: 234,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    completionRate: 89,
  },
  {
    id: '2',
    title: 'Employee Engagement Survey',
    description: 'Annual employee engagement and workplace culture assessment',
    status: 'active',
    responses: 567,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    completionRate: 92,
  },
  {
    id: '3',
    title: 'Product Feature Prioritization',
    description: 'Gather user input on upcoming feature priorities',
    status: 'draft',
    responses: 0,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    completionRate: 0,
  },
]

export function SurveyList({ status }: { status: string }) {
  const [surveys] = useState<Survey[]>(
    mockSurveys.filter(s => status === 'all' || s.status === status)
  )

  return (
    <div className="space-y-4">
      {surveys.map((survey) => (
        <Card key={survey.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{survey.title}</CardTitle>
                  <Badge variant={survey.status === 'active' ? 'default' : 'secondary'}>
                    {survey.status}
                  </Badge>
                </div>
                <CardDescription>{survey.description}</CardDescription>
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
                  <Link href={`/survey/${survey.id}`}>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Survey
                    </DropdownMenuItem>
                  </Link>
                  <Link href={`/survey/${survey.id}/edit`}>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Survey
                    </DropdownMenuItem>
                  </Link>
                  <Link href={`/survey/${survey.id}/analytics`}>
                    <DropdownMenuItem>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Analytics
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
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
                <p className="text-gray-600">Responses</p>
                <p className="font-semibold">{survey.responses}</p>
              </div>
              <div>
                <p className="text-gray-600">Completion Rate</p>
                <p className="font-semibold">{survey.completionRate}%</p>
              </div>
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-semibold">{formatDate(survey.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="font-semibold">{formatDate(survey.updatedAt)}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href={`/survey/${survey.id}/responses`}>
                <Button size="sm" variant="outline">
                  View Responses
                </Button>
              </Link>
              <Link href={`/survey/${survey.id}/share`}>
                <Button size="sm" variant="outline">
                  Share Survey
                </Button>
              </Link>
              {survey.status === 'draft' && (
                <Button size="sm">Publish Survey</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}