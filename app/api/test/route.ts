import { NextResponse } from 'next/server'
import { db } from '@/lib/database/adapter'

export async function GET() {
  const diagnostics = {
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      isVercel: process.env.VERCEL === '1'
    },
    database: {
      type: 'unknown',
      error: null,
      demoCompany: null
    }
  }

  // Determine database type
  if (diagnostics.env.hasSupabaseUrl && (diagnostics.env.hasSupabaseAnon || diagnostics.env.hasSupabaseService)) {
    diagnostics.database.type = 'Supabase'
  } else if (diagnostics.env.isVercel || diagnostics.env.nodeEnv === 'production') {
    diagnostics.database.type = 'Memory'
  } else {
    diagnostics.database.type = 'SQLite'
  }

  // Test database connection
  try {
    const demoCompany = await db.getCompanyByAccessCode('DEMO2024')
    if (demoCompany) {
      diagnostics.database.demoCompany = {
        id: demoCompany.id,
        name: demoCompany.company_name || demoCompany.name,
        accessCode: demoCompany.access_code
      }
    }
  } catch (error) {
    diagnostics.database.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json(diagnostics)
}