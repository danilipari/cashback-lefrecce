import http from 'node:http';
import express from 'express';
import sslRedirect from 'heroku-ssl-redirect';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import Utils from './utils/utils.mjs';
const utils = new Utils();

const dynamicEnvs = {
  YEAR: new Date().getFullYear(),
};

utils.patch_env(process.env, dynamicEnvs) && dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();
const server = http.createServer(app);

const middleware = [
  cors(),
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https: data:"],
      "script-src": ["'self'", "https: data:"],
    },
  }),
  express.urlencoded({ extended: true }),
  express.json(),
  morgan('combined'),
  express.sslRedirect(),
];

app.use(middleware);

app.get('/images/:file', (req, res) => {
  utils.parseImage(process.env, `${req.params.file}`, (error, data) => {
    if (error) {
      res.status(500).send(error.message.split(', open \'./static/')[0]);
      return;
    }

    res.writeHead(200, {'Content-Type': 'image/png'});
    res.write(data);
    res.end();
  });
});

app.get('/', (req, res) => {
  fs.readFile(`${process.env.HTML_DIR}coming_soon.html`, (error, data) => {
    if (error) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('File non trovato');
      return res.end();
    }

    data = utils.htmlReplaceEnv(process.env, data);

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
});

app.get('/alive', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(`Hello, cashback-lefrecce mode:${process.env.NODE_ENV}\n`);
});

const hostname = process.env.HOST || 'www.cashback-lefrecce.it';
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running at ${hostname}:${port}/`);
});