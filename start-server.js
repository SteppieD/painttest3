// Simple script to start Next.js server with better error handling
const { spawn } = require('child_process');

console.log('Starting Next.js development server...');

const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3001' }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.kill();
  process.exit();
});