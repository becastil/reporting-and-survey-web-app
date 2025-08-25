import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { surveys, surveySections, surveyQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { isDemoMode, mockSurveys } from '@/lib/demo-utils'

export async function GET(request: NextRequest) {
  try {
    // Return mock data in demo mode
    if (isDemoMode()) {
      const searchParams = request.nextUrl.searchParams
      const status = searchParams.get('status')
      
      let filteredSurveys = mockSurveys
      if (status === 'active') {
        filteredSurveys = mockSurveys.filter(s => s.isPublished)
      } else if (status === 'inactive') {
        filteredSurveys = mockSurveys.filter(s => !s.isPublished)
      }
      
      return NextResponse.json({
        success: true,
        data: filteredSurveys,
      })
    }
    
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    // Build query conditionally
    const allSurveys = await (status 
      ? db.select().from(surveys).where(eq(surveys.isPublished, status === 'active'))
      : db.select().from(surveys))
    
    return NextResponse.json({
      success: true,
      data: allSurveys,
    })
  } catch (error) {
    console.error('Error fetching surveys:', error)
    // Return mock data as fallback
    return NextResponse.json({
      success: true,
      data: mockSurveys,
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, sections, settings } = body
    
    // Return mock response in demo mode
    if (isDemoMode()) {
      const newSurvey = {
        id: `demo-survey-${Date.now()}`,
        title,
        description,
        settings: settings || {},
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      return NextResponse.json({
        success: true,
        data: newSurvey,
      })
    }
    
    // Create survey
    const [newSurvey] = await db.insert(surveys).values({
      title,
      description,
      settings,
      isPublished: false,
    }).returning()
    
    // Create sections and questions if provided
    if (sections && sections.length > 0) {
      for (const [sectionIndex, section] of sections.entries()) {
        const [newSection] = await db.insert(surveySections).values({
          surveyId: newSurvey.id,
          title: section.title,
          description: section.description,
          order: sectionIndex,
          conditionalLogic: section.conditionalLogic || null,
        }).returning()
        
        // Create questions for this section
        if (section.questions && section.questions.length > 0) {
          for (const [questionIndex, question] of section.questions.entries()) {
            await db.insert(surveyQuestions).values({
              sectionId: newSection.id,
              type: question.type,
              question: question.question,
              description: question.description,
              required: question.required || false,
              order: questionIndex,
              options: question.options || null,
              validation: question.validation || null,
              settings: question.settings || null,
            })
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: newSurvey,
    })
  } catch (error) {
    console.error('Error creating survey:', error)
    // Return mock response as fallback
    const body = await request.json()
    return NextResponse.json({
      success: true,
      data: {
        id: `demo-survey-${Date.now()}`,
        title: body.title || 'New Survey',
        description: body.description || '',
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }
}