// Test if better-sqlite3 is causing the crash
console.log('Testing database module...');

try {
  const Database = require('better-sqlite3');
  console.log('better-sqlite3 loaded successfully');
  
  const db = new Database(':memory:');
  console.log('In-memory database created');
  
  db.close();
  console.log('Database test completed successfully');
} catch (error) {
  console.error('Database test failed:', error);
}

export default {};