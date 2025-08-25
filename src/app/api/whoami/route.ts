import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export const runtime = 'nodejs'

export async function GET() {
  const { userId, sessionId, orgId } = auth()

  if (!userId) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 401 }
    )
  }

  const user = await currentUser()
  return NextResponse.json(
    {
      authenticated: true,
      user: {
        id: user?.id ?? userId,
        email: user?.primaryEmailAddress?.emailAddress ?? null,
        firstName: user?.firstName ?? null,
        lastName: user?.lastName ?? null,
      },
      sessionId,
      orgId: orgId ?? null,
    },
    { status: 200 }
  )
}

