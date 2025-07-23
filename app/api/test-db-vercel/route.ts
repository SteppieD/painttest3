import { NextResponse } from 'next/server';
import { db } from '@/lib/database/adapter';

export async function GET() {
  try {
    const dbType = process.env.VERCEL ? 'Memory' : 'SQLite';
    const company = await db.getCompanyByAccessCode('DEMO2024');
    
    return NextResponse.json({
      success: true,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        databaseType: dbType
      },
      demoCompany: company ? {
        id: company.id,
        name: company.company_name || company.name,
        accessCode: company.access_code
      } : null,
      message: `Database is working! Using ${dbType} adapter.`
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL
      }
    }, { status: 500 });
  }
}