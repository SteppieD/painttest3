import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

let db: Database.Database;

try {
  // Use data directory if it exists (for Docker), otherwise use current directory
  const dataDir = path.join(process.cwd(), 'data');
  const dbPath = path.join(
    require('fs').existsSync(dataDir) ? dataDir : process.cwd(), 
    'paintquote.db'
  );
  console.log('Initializing SQLite database at:', dbPath);
  
  db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      logo TEXT,
      settings TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies (id)
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies (id),
      UNIQUE(company_id, email)
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      quote_number TEXT NOT NULL,
      project_type TEXT,
      status TEXT DEFAULT 'draft',
      surfaces TEXT DEFAULT '[]',
      paint_products TEXT DEFAULT '{}',
      settings TEXT DEFAULT '{}',
      materials TEXT DEFAULT '{}',
      labor TEXT DEFAULT '{}',
      subtotal REAL DEFAULT 0,
      overhead REAL DEFAULT 0,
      profit REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      description TEXT,
      notes TEXT,
      terms TEXT,
      created_by_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies (id),
      FOREIGN KEY (customer_id) REFERENCES customers (id),
      FOREIGN KEY (created_by_id) REFERENCES users (id)
    );
  `);

  // Initialize with test data if needed
  const initTestData = () => {
    try {
      const companyCount = db.prepare('SELECT COUNT(*) as count FROM companies').get() as { count: number };
      
      if (companyCount.count === 0) {
        console.log('Initializing test data...');
        
        // Create test company
        const insertCompany = db.prepare(`
          INSERT INTO companies (name, email, phone, address, settings)
          VALUES (?, ?, ?, ?, ?)
        `);
        
        const companyResult = insertCompany.run(
          'Test Paint Company',
          'test@paintquotepro.com',
          '555-0123',
          '123 Test St, Austin, TX 78701',
          JSON.stringify({
            chargeRates: {
              walls: 3.50,
              ceilings: 4.00,
              baseboards: 2.50,
              crownMolding: 5.00,
              doorsWithJams: 125.00,
              windows: 75.00,
              exteriorWalls: 4.50,
              fasciaBoards: 6.00,
              soffits: 5.00,
              exteriorDoors: 150.00,
              exteriorWindows: 100.00,
            },
            overheadPercent: 15,
            profitMargin: 30,
            taxRate: 8.25,
            defaultTerms: 'Payment due within 30 days.'
          })
        );
        
        // Create test user
        const hashedPassword = bcrypt.hashSync('test123', 10);
        const insertUser = db.prepare(`
          INSERT INTO users (company_id, email, password, name, role)
          VALUES (?, ?, ?, ?, ?)
        `);
        
        insertUser.run(
          companyResult.lastInsertRowid,
          'test@paintquotepro.com',
          hashedPassword,
          'Test User',
          'admin'
        );
        
        console.log('Test data initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing test data:', error);
    }
  };

  // Initialize test data
  initTestData();
  
} catch (error) {
  console.error('Failed to initialize database:', error);
  throw error;
}

export default db;