const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Test Server Working on Port 8081</h1>');
});

server.listen(8081, () => {
  console.log('Test server running on http://localhost:8081');
});