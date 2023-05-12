import http from 'node:http';
import express from 'express';
import enforce from 'express-sslify';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import { createClient, commandOptions } from 'redis';
// import { fileURLToPath } from 'url';
// import path from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

import Utils from './utils/utils.mjs';
const utils = new Utils();

const dynamicEnvs = {
  YEAR: new Date().getFullYear(),
};

const limiterMiddleware = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

utils.patch_env(process.env, dynamicEnvs) && dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();
const middleware = [
  cors(),
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https: data:"],
      "script-src": ["'self'", "https: data:"],
      "default-src": ["'self'", "https: data:"],
    },
  }),
  express.urlencoded({ extended: true }),
  express.json(),
  morgan('combined'),
];
if (process.env.NODE_ENV === 'production') {
  app.use(enforce.HTTPS({ trustProtoHeader: true }))
}

app.disable('x-powered-by');
app.use(middleware);
app.use(/^(?!\/m*).*$/, limiterMiddleware);

const redisMiddleware = async (req, res, next) => {
  const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    },
    database: process.env.REDIS_DB,
  });

  redisClient.connect();
  // redisClient.on('connect', () => {
  //   console.log('Connesso a Redis!');
  // });
  // redisClient.on('end', () => {
  //   console.log('Disconnesso da Redis!');
  // });
  // redisClient.on('error', (error) => {
  //   console.error('Redis Server Error:', error);
  // });

  req.redis$ = redisClient;
  next();
}

const server = http.createServer(app);

app.get('/images/:file', redisMiddleware, async (req, res) => {
  const redis$ = await req.redis$;
  const pathRedis = "/images/";
  const cacheData = await redis$.get(commandOptions({ returnBuffers: true }), `${pathRedis}${req.params.file}`);

  if (cacheData) {
    const imageBuffer = Buffer.from(cacheData, 'binary');
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.write(imageBuffer);
    await redis$.disconnect();
    return res.end();
  }

  utils.parseImage(process.env, `${req.params.file}`, redis$, pathRedis, async (error, data) => {
    if (error) {
      res.status(500).send(error.message.split(", open './static/")[0]);
      return;
    }

    res.writeHead(200, {'Content-Type': 'image/png'});
    res.write(data);
    res.end();
  });
});

app.get('/assets/:file', redisMiddleware, async (req, res) => {
  const redis$ = await req.redis$;
  const pathRedis = "/assets/";
  const cacheData = await redis$.get(commandOptions({ returnBuffers: true }), `${pathRedis}${req.params.file}`);

  if (cacheData) {
    const imageBuffer = Buffer.from(cacheData, 'binary');
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.write(imageBuffer);
    await redis$.disconnect();
    return res.end();
  }

  utils.parseImage(process.env, `${req.params.file}`, redis$, pathRedis, async (error, data) => {
    if (error) {
      res.status(500).send(error.message.split(", open './static/")[0]);
      return;
    }

    res.writeHead(200, {'Content-Type': 'image/png'});
    res.write(data);
    res.end();
  });
});

app.get('/', redisMiddleware, async (req, res) => {
  const redis$ = await req.redis$;
  const pathRedis = "/html/";
  const cacheData = await redis$.get(`${pathRedis}coming_soon.html`);

  if (cacheData) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(cacheData);
    await redis$.disconnect();
    return res.end();
  }

  fs.readFile(`${process.env.HTML_DIR}coming_soon.html`, async (error, data) => {
    if (error) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('File non trovato');
      return res.end();
    }

    data = utils.htmlReplaceEnv(process.env, data);
    await redis$.set(`${pathRedis}coming_soon.html`, data, {
      EX: utils.secondsInHours(12),
      NX: true
    });
    await redis$.disconnect();

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

app.use(express.static(`${process.env.APP_DIR}app`)); // TODO* : To verify --> old ionic app
// app.use(express.static(__dirname + "/dist/")); // TODO* : remove --> old backoffice
/* app.use(express.static(path.join(__dirname, '/dist/'))); */

app.get('/m/*', (req, res) => {
  fs.readFile(`${process.env.APP_DIR}app/index.html`, (error, data) => {
    if (error) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('File non trovato');
      return res.end();
    }

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
});

const hostname = process.env.HOST || 'www.cashback-lefrecce.it';
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running at ${hostname}:${port}/`);
});