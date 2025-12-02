import { NextResponse } from 'next/server'
import { getLeetCodeSolution } from '../../../actions/leetcode'

export async function POST(req) {
  try {
    const body = await req.json();
    const { problemNumber, language } = body || {};
    if (!problemNumber) {
      return NextResponse.json({ success: false, error: 'missing problemNumber' }, { status: 400 });
    }

    const result = await getLeetCodeSolution(problemNumber, { language });
    return NextResponse.json(result, { status: result?.success ? 200 : 500 });
  } catch (err) {
    console.error('API /api/leetcode error:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
