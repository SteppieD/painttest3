import { NextResponse } from 'next/server'
import { initDatabase } from '@/lib/database/init'

export async function GET() {
  try {
    console.log('Manually initializing database...')
    const db = initDatabase()
    console.log('Database initialized successfully')
    
    return NextResponse.json({
      status: 'success',
      message: 'Database initialized'
    })
  } catch (error: any) {
    console.error('Database initialization error:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Unknown error'
    }, { status: 500 })
  }
}