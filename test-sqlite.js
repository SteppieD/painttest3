// Test if better-sqlite3 works
try {
  const Database = require('better-sqlite3');
  const db = new Database(':memory:');
  console.log('SQLite loaded successfully');
  
  db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
  const stmt = db.prepare('INSERT INTO test (name) VALUES (?)');
  stmt.run('Hello World');
  
  const row = db.prepare('SELECT * FROM test').get();
  console.log('Test row:', row);
  
  db.close();
  console.log('SQLite test passed!');
} catch (error) {
  console.error('SQLite test failed:', error);
}