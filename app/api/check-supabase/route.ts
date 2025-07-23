import { NextResponse } from 'next/server';
import { db } from '@/lib/database/adapter';

export async function GET() {
  try {
    // Check environment
    const env = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      isVercel: process.env.VERCEL === '1',
      nodeEnv: process.env.NODE_ENV
    };

    // Try to fetch demo company
    let demoCompany = null;
    let dbType = 'Unknown';
    let error = null;

    try {
      demoCompany = await db.getCompanyByAccessCode('DEMO2024');
      // Determine which adapter is being used
      if (env.hasSupabaseUrl && (env.hasAnonKey || env.hasServiceKey)) {
        dbType = 'Supabase';
      } else if (env.isVercel || env.nodeEnv === 'production') {
        dbType = 'Memory';
      } else {
        dbType = 'SQLite';
      }
    } catch (dbError) {
      error = dbError instanceof Error ? dbError.message : 'Database connection failed';
    }

    // Try to fetch all companies to test connection
    let companiesCount = 0;
    try {
      const companies = await db.getAllCompanies();
      companiesCount = companies.length;
    } catch (e) {
      // Ignore, just for testing
    }

    return NextResponse.json({
      success: !error,
      environment: env,
      databaseType: dbType,
      demoCompany: demoCompany ? {
        id: demoCompany.id,
        name: demoCompany.company_name || demoCompany.name,
        accessCode: demoCompany.access_code
      } : null,
      companiesCount,
      error,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        process.env.NEXT_PUBLIC_SUPABASE_URL.split('.')[0] + '.supabase.co' : null
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}