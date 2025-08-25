import { db } from './index'
import { users, surveys, surveySections, surveyQuestions, surveyResponses, surveyAnswers, reports, csvUploads, dashboards } from './schema'
import { faker } from '@faker-js/faker'

async function seed() {
  console.log('🌱 Starting database seed...')
  
  try {
    // Create demo users
    console.log('Creating users...')
    const [adminUser] = await db.insert(users).values({
      email: 'admin@demo.com',
      name: 'Demo Admin',
      role: 'admin',
    }).returning()
    
    const [regularUser] = await db.insert(users).values({
      email: 'user@demo.com',
      name: 'Demo User',
      role: 'user',
    }).returning()
    
    // Create sample surveys
    console.log('Creating surveys...')
    const [customerSurvey] = await db.insert(surveys).values({
      title: 'Customer Satisfaction Q4 2024',
      description: 'Quarterly customer satisfaction survey for product feedback and improvement',
      createdBy: adminUser.id,
      isPublished: true,
      allowAnonymous: true,
      multipleSubmissions: false,
      settings: {
        theme: 'blue',
        showProgressBar: true,
        randomizeQuestions: false,
      },
    }).returning()
    
    const [employeeSurvey] = await db.insert(surveys).values({
      title: 'Employee Engagement Survey',
      description: 'Annual employee engagement and workplace culture assessment',
      createdBy: adminUser.id,
      isPublished: true,
      allowAnonymous: true,
      multipleSubmissions: false,
      settings: {
        theme: 'green',
        showProgressBar: true,
        randomizeQuestions: false,
      },
    }).returning()
    
    // Create sections for customer survey
    console.log('Creating survey sections...')
    const [demographicsSection] = await db.insert(surveySections).values({
      surveyId: customerSurvey.id,
      title: 'Demographics',
      description: 'Tell us a bit about yourself',
      order: 1,
    }).returning()
    
    const [experienceSection] = await db.insert(surveySections).values({
      surveyId: customerSurvey.id,
      title: 'Product Experience',
      description: 'Your experience with our products',
      order: 2,
    }).returning()
    
    // Create questions
    console.log('Creating survey questions...')
    await db.insert(surveyQuestions).values([
      {
        sectionId: demographicsSection.id,
        type: 'dropdown',
        question: 'What is your age group?',
        required: true,
        order: 1,
        options: {
          choices: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
        },
      },
      {
        sectionId: demographicsSection.id,
        type: 'dropdown',
        question: 'Which region are you from?',
        required: true,
        order: 2,
        options: {
          choices: ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'],
        },
      },
      {
        sectionId: experienceSection.id,
        type: 'scale',
        question: 'How satisfied are you with our product?',
        description: 'Rate from 1 (Very Dissatisfied) to 5 (Very Satisfied)',
        required: true,
        order: 1,
        options: {
          min: 1,
          max: 5,
          labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
        },
      },
      {
        sectionId: experienceSection.id,
        type: 'multiple_choice',
        question: 'Which features do you use most? (Select all that apply)',
        required: false,
        order: 2,
        options: {
          choices: ['Dashboard', 'Reports', 'Analytics', 'Collaboration', 'Export'],
          multiSelect: true,
        },
      },
      {
        sectionId: experienceSection.id,
        type: 'text',
        question: 'What improvements would you like to see?',
        description: 'Please share your thoughts and suggestions',
        required: false,
        order: 3,
        validation: {
          maxLength: 500,
        },
      },
    ])
    
    // Generate sample responses
    console.log('Generating sample responses...')
    for (let i = 0; i < 50; i++) {
      const [response] = await db.insert(surveyResponses).values({
        surveyId: customerSurvey.id,
        userId: Math.random() > 0.5 ? regularUser.id : null,
        sessionId: faker.string.uuid(),
        completed: true,
        completedAt: faker.date.recent({ days: 30 }),
        metadata: {
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
        },
      }).returning()
      
      // Add some sample answers (simplified for demo)
      // In production, you'd match these to actual question IDs
    }
    
    // Create sample reports
    console.log('Creating sample reports...')
    const [salesReport] = await db.insert(reports).values({
      title: 'Q4 Sales Analysis',
      description: 'Quarterly sales performance report with regional breakdown',
      type: 'csv_upload',
      createdBy: adminUser.id,
      status: 'completed',
      config: {
        dateRange: { start: '2024-01-01', end: '2024-03-31' },
        metrics: ['revenue', 'units_sold', 'growth_rate'],
      },
      data: {
        summary: {
          totalRevenue: 1250000,
          totalUnits: 5420,
          growthRate: 12.5,
        },
      },
    }).returning()
    
    const [marketingReport] = await db.insert(reports).values({
      title: 'Marketing Campaign Performance',
      description: 'Campaign metrics and ROI analysis for Q4',
      type: 'custom',
      createdBy: adminUser.id,
      status: 'completed',
      config: {
        campaigns: ['Email', 'Social', 'PPC'],
        metrics: ['impressions', 'clicks', 'conversions', 'roi'],
      },
      data: {
        summary: {
          totalImpressions: 2500000,
          totalClicks: 125000,
          totalConversions: 2500,
          averageROI: 3.2,
        },
      },
    }).returning()
    
    // Create sample CSV uploads
    console.log('Creating CSV upload records...')
    await db.insert(csvUploads).values({
      reportId: salesReport.id,
      filename: 'sales_q4_2024.csv',
      originalName: 'Q4 Sales Data.csv',
      mimeType: 'text/csv',
      size: 2456789,
      status: 'completed',
      validationResult: {
        valid: true,
        errors: [],
        warnings: ['3 rows had missing region data'],
      },
      uploadedBy: adminUser.id,
      processedAt: new Date(),
    })
    
    // Create sample dashboards
    console.log('Creating sample dashboards...')
    await db.insert(dashboards).values({
      title: 'Executive Overview Dashboard',
      description: 'High-level metrics and KPIs for executive team',
      type: 'custom',
      createdBy: adminUser.id,
      isPublic: false,
      layout: {
        grid: [
          { i: 'kpi-1', x: 0, y: 0, w: 3, h: 2 },
          { i: 'kpi-2', x: 3, y: 0, w: 3, h: 2 },
          { i: 'kpi-3', x: 6, y: 0, w: 3, h: 2 },
          { i: 'kpi-4', x: 9, y: 0, w: 3, h: 2 },
          { i: 'chart-1', x: 0, y: 2, w: 6, h: 4 },
          { i: 'chart-2', x: 6, y: 2, w: 6, h: 4 },
        ],
      },
      widgets: {
        'kpi-1': { type: 'kpi', title: 'Total Revenue', metric: 'revenue' },
        'kpi-2': { type: 'kpi', title: 'Active Users', metric: 'users' },
        'kpi-3': { type: 'kpi', title: 'Completion Rate', metric: 'completion' },
        'kpi-4': { type: 'kpi', title: 'NPS Score', metric: 'nps' },
        'chart-1': { type: 'line', title: 'Revenue Trend', data: 'revenue_timeseries' },
        'chart-2': { type: 'bar', title: 'Product Performance', data: 'product_metrics' },
      },
      filters: {
        dateRange: 'last_30_days',
        region: 'all',
      },
    })
    
    console.log('✅ Database seed completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run seed if called directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default seed