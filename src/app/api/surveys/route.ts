import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { surveys, surveySections, surveyQuestions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    let query = db.select().from(surveys)
    
    if (status) {
      // Add status filter if provided
      query = query.where(eq(surveys.isPublished, status === 'active'))
    }
    
    const allSurveys = await query
    
    return NextResponse.json({
      success: true,
      data: allSurveys,
    })
  } catch (error) {
    console.error('Error fetching surveys:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch surveys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, sections, settings } = body
    
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
    return NextResponse.json(
      { success: false, error: 'Failed to create survey' },
      { status: 500 }
    )
  }
}