import { NextRequest, NextResponse } from 'next/server'
import { pendingReviewsService } from '@/lib/supabase-service'

export async function GET(req: NextRequest) {
  try {
    const minDaysParam = req.nextUrl.searchParams.get('minDays')
    const minDays = minDaysParam ? Number(minDaysParam) : Number(process.env.NEXT_PUBLIC_STALLED_DAYS ?? 7)
    const data = await pendingReviewsService.getStalledCandidates({ minDays })
    return NextResponse.json({ success: true, count: data.length, items: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}


