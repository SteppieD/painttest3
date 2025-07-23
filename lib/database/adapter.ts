import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import { initDatabase } from './init';
import { MemoryAdapter } from './memory-adapter';

// Database adapter interface
export interface DatabaseAdapter {
  // Company operations
  getCompanyByAccessCode(accessCode: string): Promise<any>;
  getCompany(id: number): Promise<any>;
  getAllCompanies(): Promise<any[]>;
  createCompany(data: any): Promise<any>;
  updateCompany(id: number, data: any): Promise<any>;
  
  // Quote operations
  createQuote(data: any): Promise<any>;
  getQuote(quoteId: string): Promise<any>;
  getQuotesByCompanyId(companyId: number): Promise<any[]>;
  getQuotesCount(companyId: number, since?: Date): Promise<number>;
  updateQuote(id: number, data: any): Promise<any>;
  
  // User operations
  createUser(data: any): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  getAllUsers(): Promise<any[]>;
  
  // Generic query method
  query(sql: string, params?: any[]): Promise<any>;
}

// SQLite adapter for local development
export class SQLiteAdapter implements DatabaseAdapter {
  private db: Database.Database;

  constructor() {
    this.db = initDatabase();
  }

  async getCompanyByAccessCode(accessCode: string): Promise<any> {
    const stmt = this.db.prepare('SELECT * FROM companies WHERE access_code = ?');
    return stmt.get(accessCode);
  }

  async getCompany(id: number): Promise<any> {
    const stmt = this.db.prepare('SELECT * FROM companies WHERE id = ?');
    return stmt.get(id);
  }

  async getAllCompanies(): Promise<any[]> {
    const stmt = this.db.prepare('SELECT * FROM companies');
    return stmt.all();
  }

  async createCompany(data: any): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const stmt = this.db.prepare(
      `INSERT INTO companies (${keys.join(', ')}) VALUES (${placeholders})`
    );
    const result = stmt.run(...values);
    
    return this.db.prepare('SELECT * FROM companies WHERE id = ?').get(result.lastInsertRowid);
  }

  async updateCompany(id: number, data: any): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const stmt = this.db.prepare(
      `UPDATE companies SET ${setClause} WHERE id = ?`
    );
    stmt.run(...values, id);
    
    return this.db.prepare('SELECT * FROM companies WHERE id = ?').get(id);
  }

  async createQuote(data: any): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    console.log('[SQLiteAdapter] Creating quote with', keys.length, 'fields');
    console.log('[SQLiteAdapter] SQL:', `INSERT INTO quotes (${keys.join(', ')}) VALUES (${placeholders})`);
    console.log('[SQLiteAdapter] Values count:', values.length);
    
    try {
      const stmt = this.db.prepare(
        `INSERT INTO quotes (${keys.join(', ')}) VALUES (${placeholders})`
      );
      const result = stmt.run(...values);
      
      return this.db.prepare('SELECT * FROM quotes WHERE id = ?').get(result.lastInsertRowid);
    } catch (error) {
      console.error('[SQLiteAdapter] Error creating quote:', error);
      console.error('[SQLiteAdapter] Keys:', keys);
      console.error('[SQLiteAdapter] Values:', values);
      throw error;
    }
  }

  async getQuote(quoteId: string): Promise<any> {
    const stmt = this.db.prepare('SELECT * FROM quotes WHERE quote_id = ?');
    return stmt.get(quoteId);
  }

  async getQuotesByCompanyId(companyId: number): Promise<any[]> {
    const stmt = this.db.prepare('SELECT * FROM quotes WHERE company_id = ? ORDER BY created_at DESC');
    return stmt.all(companyId);
  }

  async getQuotesCount(companyId: number, since?: Date): Promise<number> {
    if (since) {
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM quotes WHERE company_id = ? AND created_at >= ?');
      const result = stmt.get(companyId, since.toISOString()) as { count: number };
      return result.count;
    } else {
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM quotes WHERE company_id = ?');
      const result = stmt.get(companyId) as { count: number };
      return result.count;
    }
  }

  async getAll(query: string, params: any[] = []): Promise<any[]> {
    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  async get(query: string, params: any[] = []): Promise<any> {
    const stmt = this.db.prepare(query);
    return stmt.get(...params);
  }

  async run(query: string, params: any[] = []): Promise<any> {
    const stmt = this.db.prepare(query);
    return stmt.run(...params);
  }

  async updateQuote(id: number, data: any): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const stmt = this.db.prepare(
      `UPDATE quotes SET ${setClause} WHERE id = ?`
    );
    stmt.run(...values, id);
    
    return this.db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
  }

  async createUser(data: any): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const stmt = this.db.prepare(
      `INSERT INTO users (${keys.join(', ')}) VALUES (${placeholders})`
    );
    const result = stmt.run(...values);
    
    return this.db.prepare('SELECT * FROM users WHERE rowid = ?').get(result.lastInsertRowid);
  }

  async getUserByEmail(email: string): Promise<any> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  async getAllUsers(): Promise<any[]> {
    const stmt = this.db.prepare('SELECT * FROM users');
    return stmt.all();
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return this.db.prepare(sql).all(...params);
    } else {
      return this.db.prepare(sql).run(...params);
    }
  }
}

// Supabase adapter for production
export class SupabaseAdapter implements DatabaseAdapter {
  private client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async getCompanyByAccessCode(accessCode: string): Promise<any> {
    const { data, error } = await this.client
      .from('companies')
      .select('*')
      .eq('access_code', accessCode)
      .single();

    if (error) throw error;
    return data;
  }

  async getCompany(id: number): Promise<any> {
    const { data, error } = await this.client
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  }

  async getAllCompanies(): Promise<any[]> {
    const { data, error } = await this.client
      .from('companies')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  async createCompany(data: any): Promise<any> {
    const { data: result, error } = await this.client
      .from('companies')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async updateCompany(id: number, data: any): Promise<any> {
    const { data: result, error } = await this.client
      .from('companies')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async createQuote(data: any): Promise<any> {
    const { data: result, error } = await this.client
      .from('quotes')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getQuote(quoteId: string): Promise<any> {
    const { data, error } = await this.client
      .from('quotes')
      .select('*')
      .eq('quote_id', quoteId)
      .single();

    if (error) throw error;
    return data;
  }

  async getQuotesByCompanyId(companyId: number): Promise<any[]> {
    const { data, error } = await this.client
      .from('quotes')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getQuotesCount(companyId: number, since?: Date): Promise<number> {
    let query = this.client
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    if (since) {
      query = query.gte('created_at', since.toISOString());
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  async updateQuote(id: number, data: any): Promise<any> {
    const { data: result, error } = await this.client
      .from('quotes')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async createUser(data: any): Promise<any> {
    const { data: result, error } = await this.client
      .from('users')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getUserByEmail(email: string): Promise<any> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  }

  async getAllUsers(): Promise<any[]> {
    const { data, error } = await this.client
      .from('users')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    // For Supabase, we use RPC functions or direct table operations
    // This is a fallback for complex queries
    const { data, error } = await this.client.rpc('execute_sql', {
      query: sql,
      params: params
    });

    if (error) throw error;
    return data;
  }
}

// Factory function to get the appropriate adapter
export function getDatabaseAdapter(): DatabaseAdapter {
  const useSupabase = process.env.USE_SUPABASE === 'true';
  const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Check if we're running on Vercel or in a serverless environment
  const isVercel = process.env.VERCEL === '1';
  const isProduction = process.env.NODE_ENV === 'production';

  if (useSupabase && hasSupabase) {
    console.log('Using Supabase database adapter');
    return new SupabaseAdapter();
  } else if (isVercel || isProduction) {
    console.log('Using Memory database adapter for serverless environment');
    return new MemoryAdapter();
  } else {
    try {
      console.log('Using SQLite database adapter');
      return new SQLiteAdapter();
    } catch (error) {
      console.warn('SQLite initialization failed, falling back to memory adapter:', error);
      return new MemoryAdapter();
    }
  }
}

// Create a singleton instance with lazy initialization
let dbInstance: DatabaseAdapter | null = null;

export function getDb(): DatabaseAdapter {
  if (!dbInstance) {
    dbInstance = getDatabaseAdapter();
  }
  return dbInstance;
}

// Export the database instance getter
export const db = getDb();