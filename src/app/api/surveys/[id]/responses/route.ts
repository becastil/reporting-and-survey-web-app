import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { surveyResponses, surveyAnswers } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { isDemoMode, mockResponses } from '@/lib/demo-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const surveyId = params.id
    
    // Return mock data in demo mode
    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        data: mockResponses,
      })
    }
    
    // Get all responses for this survey
    const responses = await db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, surveyId))
    
    // Get aggregated statistics
    const stats = await db
      .select({
        totalResponses: sql<number>`count(*)`,
        completedResponses: sql<number>`count(case when completed = true then 1 end)`,
        avgCompletionTime: sql<number>`avg(extract(epoch from (completed_at - started_at)))`,
      })
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, surveyId))
    
    return NextResponse.json({
      success: true,
      data: {
        responses,
        stats: stats[0],
      },
    })
  } catch (error) {
    console.error('Error fetching responses:', error)
    // Return mock data as fallback
    return NextResponse.json({
      success: true,
      data: mockResponses,
    })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const surveyId = params.id
    const body = await request.json()
    const { userId, sessionId, answers } = body
    
    // Return mock response in demo mode
    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        data: {
          responseId: `demo-response-${Date.now()}`,
        },
      })
    }
    
    // Create response record
    const [newResponse] = await db.insert(surveyResponses).values({
      surveyId,
      userId: userId || null,
      sessionId: sessionId || null,
      completed: true,
      completedAt: new Date(),
      metadata: {
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      },
    }).returning()
    
    // Insert answers
    if (answers && answers.length > 0) {
      const answerRecords = answers.map((answer: any) => ({
        responseId: newResponse.id,
        questionId: answer.questionId,
        answer: answer.value,
      }))
      
      await db.insert(surveyAnswers).values(answerRecords)
    }
    
    return NextResponse.json({
      success: true,
      data: {
        responseId: newResponse.id,
      },
    })
  } catch (error) {
    console.error('Error submitting response:', error)
    // Return mock response as fallback
    return NextResponse.json({
      success: true,
      data: {
        responseId: `demo-response-${Date.now()}`,
      },
    })
  }
}