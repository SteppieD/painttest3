import { DatabaseAdapter } from './adapter';

// In-memory storage for Vercel/serverless environments
const memoryStore = {
  companies: new Map<number, any>(),
  quotes: new Map<number, any>(),
  users: new Map<string, any>(),
  quoteCounter: 1000,
  initialized: false
};

// Initialize with demo data
function initializeMemoryStore() {
  if (memoryStore.initialized) return;
  
  // Add demo company
  memoryStore.companies.set(1, {
    id: 1,
    access_code: 'DEMO2024',
    company_name: 'Demo Painting Company',
    name: 'Demo Painting Company',
    phone: '(555) 123-4567',
    email: 'demo@paintingcompany.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  memoryStore.initialized = true;
  console.log('[MemoryAdapter] Initialized with demo data');
}

// Memory adapter for serverless environments
export class MemoryAdapter implements DatabaseAdapter {
  constructor() {
    initializeMemoryStore();
  }

  async getCompanyByAccessCode(accessCode: string): Promise<any> {
    for (const company of memoryStore.companies.values()) {
      if (company.access_code === accessCode) {
        return company;
      }
    }
    return null;
  }

  async getCompany(id: number): Promise<any> {
    return memoryStore.companies.get(id) || null;
  }

  async getAllCompanies(): Promise<any[]> {
    return Array.from(memoryStore.companies.values());
  }

  async createCompany(data: any): Promise<any> {
    const id = memoryStore.companies.size + 1;
    const company = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.companies.set(id, company);
    return company;
  }

  async updateCompany(id: number, data: any): Promise<any> {
    const existing = memoryStore.companies.get(id);
    if (!existing) throw new Error('Company not found');
    
    const updated = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString()
    };
    memoryStore.companies.set(id, updated);
    return updated;
  }

  async createQuote(data: any): Promise<any> {
    const id = memoryStore.quotes.size + 1;
    const quote = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.quotes.set(id, quote);
    console.log('[MemoryAdapter] Quote created:', quote);
    return quote;
  }

  async getQuote(quoteId: string): Promise<any> {
    for (const quote of memoryStore.quotes.values()) {
      if (quote.quote_id === quoteId) {
        return quote;
      }
    }
    return null;
  }

  async getQuotesByCompanyId(companyId: number): Promise<any[]> {
    const quotes = [];
    for (const quote of memoryStore.quotes.values()) {
      if (quote.company_id === companyId) {
        quotes.push(quote);
      }
    }
    return quotes.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getQuotesCount(companyId: number, since?: Date): Promise<number> {
    let count = 0;
    for (const quote of memoryStore.quotes.values()) {
      if (quote.company_id === companyId) {
        if (!since || new Date(quote.created_at) >= since) {
          count++;
        }
      }
    }
    return count;
  }

  async updateQuote(id: number, data: any): Promise<any> {
    const existing = memoryStore.quotes.get(id);
    if (!existing) throw new Error('Quote not found');
    
    const updated = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString()
    };
    memoryStore.quotes.set(id, updated);
    return updated;
  }

  async createUser(data: any): Promise<any> {
    const id = data.id || `user_${Date.now()}`;
    const user = {
      ...data,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.users.set(id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<any> {
    for (const user of memoryStore.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async getAllUsers(): Promise<any[]> {
    return Array.from(memoryStore.users.values());
  }

  async query(sql: string, params?: any[]): Promise<any> {
    console.warn('[MemoryAdapter] Raw SQL queries not supported in memory mode');
    return [];
  }
}