import http from 'node:http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();
const server = http.createServer(app);

const middleware = [
  cors(),
  helmet(),
  express.urlencoded({ extended: true }),
  express.json(),
  morgan('combined')
];

app.use(middleware);

app.get('/', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(`Hello, cashback-lefrecce mode:${process.env.NODE_ENV} coming soon!\n`);
});

const hostname = process.env.HOST || 'www.cashback-lefrecce.it';
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});