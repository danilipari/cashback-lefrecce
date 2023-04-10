const http = require('node:http');

const hostname = process.env.HOST || 'cashback-lefrecce.herokuapp.com';
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, cashback-lefrecce coming soon!\n');
});

server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});