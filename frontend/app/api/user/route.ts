import { NextResponse } from 'next/server';
 
export async function GET() {
  // In a real app, fetch user info from session or database
  return NextResponse.json({ name: 'John Doe' });
} 