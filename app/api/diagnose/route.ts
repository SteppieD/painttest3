import { NextResponse } from 'next/server';
import { db } from '@/lib/database/adapter';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0] + '.supabase.co'
    },
    tests: {
      databaseType: null,
      companiesTable: { exists: false, error: null, count: 0 },
      quotesTable: { exists: false, error: null, count: 0 },
      demoCompany: { exists: false, error: null, data: null },
      canCreateQuote: { success: false, error: null }
    }
  };

  // Determine database type
  if (diagnostics.environment.hasSupabaseUrl && 
      (diagnostics.environment.hasSupabaseAnon || diagnostics.environment.hasSupabaseService)) {
    diagnostics.tests.databaseType = 'Supabase';
  } else if (diagnostics.environment.VERCEL || diagnostics.environment.NODE_ENV === 'production') {
    diagnostics.tests.databaseType = 'Memory';
  } else {
    diagnostics.tests.databaseType = 'SQLite';
  }

  // Test 1: Check if companies table exists and has data
  try {
    const companies = await db.getAllCompanies();
    diagnostics.tests.companiesTable.exists = true;
    diagnostics.tests.companiesTable.count = companies.length;
  } catch (error) {
    diagnostics.tests.companiesTable.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test 2: Check if quotes table exists
  try {
    const quotes = await db.getQuotesByCompanyId(1);
    diagnostics.tests.quotesTable.exists = true;
    diagnostics.tests.quotesTable.count = quotes.length;
  } catch (error) {
    diagnostics.tests.quotesTable.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test 3: Check if demo company exists
  try {
    const demoCompany = await db.getCompanyByAccessCode('DEMO2024');
    if (demoCompany) {
      diagnostics.tests.demoCompany.exists = true;
      diagnostics.tests.demoCompany.data = {
        id: demoCompany.id,
        name: demoCompany.company_name || demoCompany.name,
        accessCode: demoCompany.access_code
      };
    }
  } catch (error) {
    diagnostics.tests.demoCompany.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Test 4: Try to create a test quote
  if (diagnostics.tests.demoCompany.exists && diagnostics.tests.demoCompany.data) {
    try {
      const testQuote = {
        company_id: diagnostics.tests.demoCompany.data.id,
        quote_id: `TEST-${Date.now()}`,
        customer_name: 'Diagnostic Test',
        customer_email: 'test@diagnostic.com',
        customer_phone: '(555) 000-0000',
        address: '123 Test Street',
        project_type: 'interior',
        rooms: JSON.stringify(['Test Room']),
        paint_quality: 'test',
        timeline: 'test',
        final_price: 100,
        status: 'test',
        conversation_summary: 'Diagnostic test quote'
      };
      
      const result = await db.createQuote(testQuote);
      diagnostics.tests.canCreateQuote.success = true;
      
      // Clean up test quote
      if (result && result.id) {
        try {
          await db.updateQuote(result.id, { status: 'deleted' });
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    } catch (error) {
      diagnostics.tests.canCreateQuote.error = error instanceof Error ? error.message : 'Unknown error';
    }
  } else {
    diagnostics.tests.canCreateQuote.error = 'Demo company not found - cannot test quote creation';
  }

  // Determine overall status
  const allTestsPassed = 
    diagnostics.tests.companiesTable.exists &&
    diagnostics.tests.quotesTable.exists &&
    diagnostics.tests.demoCompany.exists &&
    diagnostics.tests.canCreateQuote.success;

  return NextResponse.json({
    success: allTestsPassed,
    diagnostics,
    recommendations: !allTestsPassed ? [
      'Run the Supabase migration script at /supabase-setup.sql',
      'Ensure all environment variables are properly set in Vercel',
      'Check Vercel function logs for detailed error messages'
    ] : []
  });
}