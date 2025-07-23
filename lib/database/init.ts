import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Database instance
let db: Database.Database | null = null;

// Initialize database connection
export function initDatabase(): Database.Database {
  if (db) return db;

  const dbPath = process.env.DATABASE_PATH || './painting_quotes_app.db';
  
  try {
    console.log('Initializing database at:', dbPath);
    
    // Check if we're in a read-only filesystem (like Vercel)
    try {
      db = new Database(dbPath, { verbose: console.log });
    } catch (dbError) {
      console.error('Failed to create SQLite database:', dbError);
      throw new Error('SQLite not available in this environment');
    }
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Run schema if database is new
    const schemaPath = path.join(process.cwd(), 'lib', 'database', 'unified-schema.sql');
    console.log('Looking for schema at:', schemaPath);
    console.log('Schema exists:', fs.existsSync(schemaPath));
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      console.log('Schema loaded, length:', schema.length);
      
      // Execute the entire schema at once to preserve order
      console.log('Executing schema...');
      
      try {
        db.exec(schema);
        console.log('Schema executed successfully');
      } catch (error) {
        console.error('Error executing schema:', error);
        throw error;
      }
      
      console.log('Database schema initialized successfully');
    } else {
      console.error('Schema file not found at:', schemaPath);
    }
    
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Get database instance
export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

// Close database connection
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// Export database type for use in other modules
export type { Database };