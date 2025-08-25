// Demo mode utilities for API routes
export function isDemoMode(): boolean {
  return (
    process.env.DEMO_MODE === 'true' ||
    process.env.SKIP_AUTH === 'true' ||
    process.env.ENABLE_DEMO_MODE === 'true' ||
    !process.env.DATABASE_URL
  )
}

export const mockSurveys = [
  {
    id: 'demo-survey-1',
    title: 'Customer Satisfaction Survey',
    description: 'Help us improve our services by sharing your feedback',
    isPublished: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    settings: {
      allowAnonymous: true,
      showProgressBar: true,
      randomizeQuestions: false,
    },
  },
  {
    id: 'demo-survey-2',
    title: 'Employee Engagement Survey',
    description: 'Annual employee satisfaction and engagement assessment',
    isPublished: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    settings: {
      allowAnonymous: false,
      showProgressBar: true,
      randomizeQuestions: true,
    },
  },
  {
    id: 'demo-survey-3',
    title: 'Product Feedback Form',
    description: 'Share your thoughts on our latest product release',
    isPublished: false,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    settings: {
      allowAnonymous: true,
      showProgressBar: false,
      randomizeQuestions: false,
    },
  },
]

export const mockResponses = {
  responses: [
    {
      id: 'response-1',
      surveyId: 'demo-survey-1',
      userId: 'user-1',
      completed: true,
      completedAt: new Date('2024-01-21'),
      startedAt: new Date('2024-01-21'),
    },
    {
      id: 'response-2',
      surveyId: 'demo-survey-1',
      userId: 'user-2',
      completed: true,
      completedAt: new Date('2024-01-22'),
      startedAt: new Date('2024-01-22'),
    },
    {
      id: 'response-3',
      surveyId: 'demo-survey-1',
      userId: 'user-3',
      completed: false,
      startedAt: new Date('2024-01-23'),
    },
  ],
  stats: {
    totalResponses: 3,
    completedResponses: 2,
    avgCompletionTime: 300, // seconds
  },
}

export const mockReportData = {
  uploadId: 'demo-upload-1',
  reportId: 'demo-report-1',
  preview: [
    { date: '2024-01-01', value: 100, category: 'Sales' },
    { date: '2024-01-02', value: 150, category: 'Sales' },
    { date: '2024-01-03', value: 120, category: 'Sales' },
    { date: '2024-01-04', value: 180, category: 'Sales' },
    { date: '2024-01-05', value: 200, category: 'Sales' },
  ],
  validation: {
    valid: true,
    errors: [],
    warnings: [],
  },
}