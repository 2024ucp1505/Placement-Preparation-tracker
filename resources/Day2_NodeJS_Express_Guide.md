# 📗 Day 2 — Node.js + Express: Backend Foundation
> **7-Day Full Stack Interview Prep** | Theory AM · Build PM

---

## 📚 Table of Contents

### 📖 Node.js Core
1. [How Node Works — Single Thread](#1-how-node-works--single-thread)
2. [V8 + libuv](#2-v8--libuv)
3. [Event Loop in Node — 6 Phases](#3-event-loop-in-node--6-phases)
4. [Non-Blocking I/O](#4-non-blocking-io)
5. [Streams & Buffers](#5-streams--buffers)
6. [CommonJS vs ESM in Node](#6-commonjs-vs-esm-in-node)
7. [process Object](#7-process-object)
8. [global vs window](#8-global-vs-window)
9. [child_process](#9-child_process)
10. [cluster Module](#10-cluster-module)
11. [worker_threads](#11-worker_threads)
12. [npm vs npx](#12-npm-vs-npx)
13. [package.json](#13-packagejson)
14. [node_modules](#14-node_modules)
15. [__dirname / __filename](#15-__dirname--__filename)
16. [fs / path / os / http Modules](#16-fs--path--os--http-modules)

### ⚡ Express Core
17. [Middleware Chain](#17-middleware-chain)
18. [app.use vs app.get](#18-appuse-vs-appget)
19. [Request Lifecycle](#19-request-lifecycle)
20. [req.params vs req.query vs req.body](#20-reqparams-vs-reqquery-vs-reqbody)
21. [Error Handling Middleware — 4 Args](#21-error-handling-middleware--4-args)
22. [Router Module](#22-router-module)
23. [CORS](#23-cors)
24. [helmet](#24-helmet)
25. [Rate Limiting](#25-rate-limiting)
26. [express-validator](#26-express-validator)
27. [multer — File Upload](#27-multer--file-upload)
28. [Serving Static Files](#28-serving-static-files)
29. [Template Engines](#29-template-engines)

### 🔥 Must-Know Concepts
30. [REST Principles](#30-rest-principles)
31. [HTTP Methods + Status Codes](#31-http-methods--status-codes)
32. [Stateless vs Stateful](#32-stateless-vs-stateful)
33. [JWT Auth](#33-jwt-auth)
34. [Session vs Token Auth](#34-session-vs-token-auth)
35. [OAuth Basics](#35-oauth-basics)
36. [Environment Variables (.env)](#36-environment-variables-env)
37. [MVC Pattern](#37-mvc-pattern)
38. [SOLID Principles](#38-solid-principles)
39. [API Versioning](#39-api-versioning)
40. [Pagination Strategies](#40-pagination-strategies)
41. [Compression](#41-compression)
42. [Caching Headers](#42-caching-headers)

### [🏗️ Build Project](#build-project)
### [🧪 Quiz — 25 Questions](#quiz--25-questions)

---

# NODE.JS CORE

---

## 1. How Node Works — Single Thread

Node.js runs on a **single thread** — meaning only one piece of JavaScript runs at any given moment. Yet it handles thousands of concurrent connections. How?

> The secret: **Node doesn't wait**. When an operation (file read, DB query, HTTP request) would take time, Node hands it off to the OS/thread pool and moves on to the next thing. When that operation completes, the result comes back via the event loop.

```
Your JS Code
     │
     ▼
┌─────────────────┐
│   Single Thread  │  ← your JS runs here
│   (V8 Engine)   │
└────────┬────────┘
         │ async call (fs.readFile, http.get, etc.)
         ▼
┌─────────────────┐
│  libuv Thread   │  ← handles I/O in background threads
│  Pool (4-128)   │
└────────┬────────┘
         │ done! fires callback
         ▼
┌─────────────────┐
│   Event Loop    │  ← picks up callback and puts it on call stack
└─────────────────┘
```

**Why is this good?**
- No thread management overhead
- No deadlocks / race conditions in user code
- Perfect for I/O-heavy apps (APIs, chat servers)

**Where does it struggle?**
- CPU-intensive tasks (image processing, complex math) **block the single thread**
- Solution: `worker_threads` or offload to a child process

---

## 2. V8 + libuv

| Component | What it does |
|---|---|
| **V8** | Google's JS engine — compiles JS to machine code, manages memory, garbage collection |
| **libuv** | C library — provides the event loop, thread pool, and async I/O abstractions across OS platforms |

```
Node.js = V8 (JS execution) + libuv (async I/O) + Node APIs (fs, http, etc.)
```

- **V8** handles: executing your JS, JIT compilation, the call stack, the heap
- **libuv** handles: file system, networking, DNS, child processes, thread pool (default 4 threads)

```js
// You write JS (V8 runs this)
const fs = require('fs');

// libuv delegates this to the OS / thread pool:
fs.readFile('./data.txt', 'utf8', (err, data) => {
  // This callback is queued by libuv when the OS finishes reading
  console.log(data);
});

console.log('This runs BEFORE the file is read'); // sync, runs immediately
```

---

## 3. Event Loop in Node — 6 Phases

Node's event loop has **6 distinct phases**, each with its own queue. It cycles through them continuously.

```
   ┌─────────────────────────────┐
   │          timers             │  phase 1: setTimeout, setInterval callbacks
   └──────────────┬──────────────┘
                  │
   ┌──────────────▼──────────────┐
   │     pending callbacks       │  phase 2: I/O errors from previous cycle
   └──────────────┬──────────────┘
                  │
   ┌──────────────▼──────────────┐
   │       idle, prepare         │  phase 3: internal use only
   └──────────────┬──────────────┘
                  │
   ┌──────────────▼──────────────┐
   │           poll              │  phase 4: retrieve new I/O events, execute callbacks
   └──────────────┬──────────────┘
                  │
   ┌──────────────▼──────────────┐
   │           check             │  phase 5: setImmediate callbacks
   └──────────────┬──────────────┘
                  │
   ┌──────────────▼──────────────┐
   │      close callbacks        │  phase 6: socket.on('close', ...) etc.
   └─────────────────────────────┘
         ↑ loops back to top
```

**Between EVERY phase transition → microtasks drain completely** (Promise callbacks, `process.nextTick`)

```js
setTimeout(() => console.log('setTimeout'),   0); // timers phase
setImmediate(() => console.log('setImmediate'));   // check phase
Promise.resolve().then(() => console.log('Promise')); // microtask
process.nextTick(() => console.log('nextTick'));    // microtask (highest priority)

// Output order:
// nextTick     ← process.nextTick runs before any other microtask
// Promise      ← other microtasks
// setTimeout   ← timers phase (order vs setImmediate is non-deterministic at top level)
// setImmediate ← check phase
```

> **Interview tip:** `process.nextTick` is NOT part of the event loop phases — it runs after the current operation completes, before the event loop continues. It has higher priority than Promise microtasks.

---

## 4. Non-Blocking I/O

**Blocking (synchronous):** The thread waits until the operation completes.  
**Non-blocking (asynchronous):** The thread initiates the operation, registers a callback, and moves on.

```js
const fs = require('fs');

// ❌ BLOCKING — synchronous, freezes the event loop
const data = fs.readFileSync('./big-file.txt', 'utf8');
console.log('Got data'); // only runs after file is fully read

// ✅ NON-BLOCKING — asynchronous, event loop is free
fs.readFile('./big-file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log('Got data'); // runs when OS is done, not before
});
console.log('This runs immediately'); // doesn't wait for file

// ✅ BETTER — async/await with fs.promises
const { readFile } = require('fs').promises;

async function loadFile() {
  try {
    const data = await readFile('./big-file.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

> **Rule:** Never use `*Sync` methods in a server. They block the event loop and every other pending request suffers.

---

## 5. Streams & Buffers

### Buffers
A **Buffer** is a raw binary data storage — like a byte array. Used when working with binary data (files, network packets).

```js
const buf = Buffer.from('Hello', 'utf8');
console.log(buf);           // <Buffer 48 65 6c 6c 6f>
console.log(buf.toString()); // "Hello"
console.log(buf.length);     // 5 (bytes)

const buf2 = Buffer.alloc(10); // 10 zero bytes
```

### Streams
Streams process data **piece by piece** instead of loading it all into memory at once.

| Type | Direction | Example |
|---|---|---|
| Readable | Source → your code | `fs.createReadStream`, `http.IncomingMessage` |
| Writable | Your code → destination | `fs.createWriteStream`, `http.ServerResponse` |
| Duplex | Both directions | `net.Socket` |
| Transform | Read + transform + write | `zlib.createGzip` |

```js
const fs = require('fs');

// ❌ Bad — loads entire 1GB file into memory
fs.readFile('huge.mp4', (err, data) => {
  res.end(data); // 1GB in memory!
});

// ✅ Good — streams chunk by chunk, memory stays low
const readStream  = fs.createReadStream('huge.mp4');
const writeStream = fs.createWriteStream('copy.mp4');

readStream.pipe(writeStream); // pipe: readable → writable

// HTTP use case — stream a file directly to the response
const http = require('http');
http.createServer((req, res) => {
  const stream = fs.createReadStream('./video.mp4');
  stream.pipe(res); // no need to load full file
}).listen(3000);
```

---

## 6. CommonJS vs ESM in Node

Already covered deeply in Day 1, but here's the Node-specific angle:

```js
// CJS — default in Node (no config needed)
const express = require('express');
module.exports = { myRouter };

// ESM — need "type": "module" in package.json OR .mjs extension
import express from 'express';
export { myRouter };

// Interop issue: you CAN import CJS from ESM, but NOT the reverse
// In ESM, __dirname and __filename don't exist — use import.meta.url:
import { fileURLToPath } from 'url';
import { dirname }       from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
```

---

## 7. process Object

The `process` global object provides info and control over the current Node process.

```js
// Process info
console.log(process.pid);       // process ID
console.log(process.version);   // Node version e.g. "v20.0.0"
console.log(process.platform);  // "linux" | "win32" | "darwin"
console.log(process.env.PORT);  // environment variables
console.log(process.argv);      // command-line args: ["node", "app.js", "--port", "3000"]
console.log(process.cwd());     // current working directory
console.log(process.memoryUsage()); // { rss, heapTotal, heapUsed, external }

// Process control
process.exit(0);   // exit with success code
process.exit(1);   // exit with error code

// Graceful shutdown — listen for termination signals
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => process.exit(0));
});

// Catch unhandled exceptions (last resort — don't rely on this)
process.on('uncaughtException', (err) => {
  console.error('Uncaught:', err);
  process.exit(1); // must exit — state is unreliable
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
```

---

## 8. global vs window

| | Browser | Node.js |
|---|---|---|
| Global object | `window` | `global` |
| Global this | `window` | `global` (or `globalThis` in both) |
| `document`, `localStorage` | ✅ | ❌ |
| `process`, `__dirname` | ❌ | ✅ |
| `fetch` | ✅ | ✅ (Node 18+) |

```js
// In browser:
window.myVar = 42;
console.log(myVar); // 42 (window is the default scope)

// In Node:
global.myVar = 42;
console.log(myVar); // 42

// globalThis — works in BOTH environments
globalThis.myVar = 42; // safe in browser and Node

// Important: variables declared with var at module top level
// are NOT on global in Node (unlike browser where var → window.var)
var x = 10;
console.log(global.x); // undefined in Node!
```

---

## 9. child_process

Run shell commands or other scripts from within Node.

```js
const { exec, spawn, fork } = require('child_process');

// exec — runs shell command, buffers output (good for small outputs)
exec('ls -la', (err, stdout, stderr) => {
  if (err) { console.error(err); return; }
  console.log(stdout);
});

// spawn — streams output, better for large/long-running processes
const ls = spawn('ls', ['-la']);
ls.stdout.on('data', (data) => process.stdout.write(data));
ls.on('close', (code) => console.log(`Exited with ${code}`));

// fork — specifically for running another Node.js script
// creates a new Node process with IPC channel for messaging
const child = fork('./worker.js');
child.send({ task: 'compute', data: [1,2,3] });
child.on('message', (result) => console.log('Result:', result));
```

> **When to use:** Image processing, running Python scripts, CPU-intensive work you want to offload.

---

## 10. cluster Module

Takes advantage of **multi-core CPUs** by forking multiple Node processes, each handling connections independently.

```js
const cluster = require('cluster');
const http    = require('http');
const os      = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length; // e.g. 8 cores = 8 workers
  console.log(`Primary ${process.pid} forking ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork(); // auto-restart dead workers
  });

} else {
  // Each worker runs this
  http.createServer((req, res) => {
    res.end(`Handled by worker ${process.pid}`);
  }).listen(3000);

  console.log(`Worker ${process.pid} started`);
}
```

> **Real world:** PM2 does this automatically (`pm2 start app.js -i max`).

---

## 11. worker_threads

Unlike `cluster` (separate processes), `worker_threads` runs JS in **parallel threads within the same process**. Shares memory via `SharedArrayBuffer`.

```js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // Main thread — spawn a worker
  const worker = new Worker(__filename, {
    workerData: { numbers: [1, 2, 3, 4, 5] }
  });
  worker.on('message', result => console.log('Sum:', result)); // 15
  worker.on('error', console.error);

} else {
  // Worker thread — runs in parallel
  const sum = workerData.numbers.reduce((a, b) => a + b, 0);
  parentPort.postMessage(sum); // send result back to main
}
```

> **cluster vs worker_threads:**
> - `cluster` → multiple processes (separate memory) → good for handling more HTTP connections
> - `worker_threads` → parallel JS threads (shared memory possible) → good for CPU computation

---

## 12. npm vs npx

| | npm | npx |
|---|---|---|
| **Purpose** | Install packages | Execute packages |
| **Installs** | Yes (locally or globally) | Temporarily (if not installed) |
| **Common use** | `npm install express` | `npx create-react-app ./` |

```bash
# npm — install packages
npm install express          # local, adds to node_modules
npm install -g nodemon       # global install
npm install --save-dev jest  # dev dependency

# npx — execute without installing globally
npx nodemon app.js           # uses local nodemon OR downloads temporarily
npx create-next-app@latest . # runs the CLI tool without installing it globally

# Useful npm commands
npm init -y           # create package.json with defaults
npm run dev           # run "dev" script from package.json
npm list              # list installed packages
npm outdated          # check for outdated packages
npm audit             # check for security vulnerabilities
npm ci                # clean install (faster, for CI/CD — uses package-lock.json exactly)
```

---

## 13. package.json

The **manifest** of your Node project.

```json
{
  "name": "blog-api",
  "version": "1.0.0",
  "description": "REST API for a blog",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start":   "node index.js",
    "dev":     "nodemon index.js",
    "test":    "jest --coverage",
    "lint":    "eslint ."
  },
  "dependencies": {
    "express":    "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "dotenv":     "^16.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "jest":    "^29.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

> **`^` vs `~`:** `^4.18.2` allows `4.x.x` updates (minor+patch). `~4.18.2` allows only `4.18.x` (patch only). No prefix = exact version.

> **`package-lock.json`:** Locks exact versions of ALL dependencies (including nested). Commit this to git — ensures everyone on the team gets the same versions. `npm ci` installs from this file exactly.

---

## 14. node_modules

The directory where all installed packages live. **Never commit to git** — add to `.gitignore`.

```bash
node_modules/
  express/
    index.js
    package.json
    node_modules/   ← nested deps (older npm) or hoisted (modern npm)
  ...
```

```gitignore
# .gitignore
node_modules/
.env
dist/
*.log
```

> **Why is it so large?** `express` depends on 50+ packages, each of which has its own dependencies. `node_modules` is famously massive — this is why `npm ci` and `.gitignore` matter.

---

## 15. __dirname / __filename

`__dirname` = absolute path to the **directory** of the current file  
`__filename` = absolute path to the **current file** itself

```js
// CJS (works out of the box)
console.log(__filename); // /home/user/project/src/routes/users.js
console.log(__dirname);  // /home/user/project/src/routes

// Common use — reliable path construction (avoid hardcoded paths)
const path = require('path');
const filePath = path.join(__dirname, '..', 'config', 'db.js');
// → /home/user/project/src/config/db.js  (works on any OS)

// ESM equivalent (since __dirname doesn't exist in ESM)
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
```

---

## 16. fs / path / os / http Modules

### fs (File System)
```js
const fs = require('fs');
const fsp = require('fs').promises; // promise-based API

// Read
const data = fs.readFileSync('./file.txt', 'utf8'); // sync
fsp.readFile('./file.txt', 'utf8').then(data => console.log(data)); // async

// Write
fs.writeFileSync('./output.txt', 'Hello!');
await fsp.writeFile('./output.txt', 'Hello!');

// Append
fs.appendFileSync('./log.txt', `[${new Date()}] Event\n`);

// Check existence
fs.existsSync('./file.txt'); // true/false

// Delete, rename, mkdir
fs.unlinkSync('./old.txt');
fs.renameSync('./old.txt', './new.txt');
fs.mkdirSync('./uploads', { recursive: true }); // recursive: won't error if exists
```

### path
```js
const path = require('path');

path.join('/home', 'user', 'docs');       // "/home/user/docs" (cross-platform)
path.resolve('./src', '../config');        // absolute path
path.basename('/home/user/file.js');      // "file.js"
path.extname('file.js');                  // ".js"
path.dirname('/home/user/file.js');       // "/home/user"
path.parse('/home/user/file.js');
// { root: '/', dir: '/home/user', base: 'file.js', ext: '.js', name: 'file' }
```

### os
```js
const os = require('os');

os.cpus().length;    // number of CPU cores
os.totalmem();       // total RAM in bytes
os.freemem();        // free RAM in bytes
os.platform();       // "linux" | "win32" | "darwin"
os.homedir();        // "/home/username"
os.tmpdir();         // "/tmp"
os.hostname();       // machine name
```

### http (raw — usually you use Express on top)
```js
const http = require('http');

const server = http.createServer((req, res) => {
  // req = IncomingMessage (Readable stream)
  // res = ServerResponse (Writable stream)

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello!' }));
});

server.listen(3000, () => console.log('Server on port 3000'));
```

---

# EXPRESS CORE

---

## 17. Middleware Chain

**Middleware** = a function that has access to `req`, `res`, and `next`. It sits between the request coming in and the response going out.

```
Request ──► MW1 ──► MW2 ──► MW3 ──► Route Handler ──► Response
                                     (final handler)
```

```js
const express = require('express');
const app = express();

// Middleware signature: (req, res, next)
function logger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // MUST call next() or the request hangs!
}

function addTimestamp(req, res, next) {
  req.timestamp = Date.now(); // attach data to req for downstream use
  next();
}

// Register middleware with app.use
app.use(logger);
app.use(addTimestamp);
app.use(express.json()); // built-in: parses JSON body

app.get('/api/hello', (req, res) => {
  res.json({ msg: 'Hello', ts: req.timestamp }); // uses data from middleware
});

// ⚠️ ORDER MATTERS — middleware runs in the order it's registered
```

---

## 18. app.use vs app.get

```js
// app.use — matches ANY method (GET, POST, PUT, DELETE...) and ANY path prefix
app.use('/api', myRouter);       // matches /api, /api/users, /api/anything
app.use(express.json());         // global, no path = matches everything
app.use('/admin', authMiddleware); // all /admin/* routes require auth

// app.get/post/put/delete/patch — matches SPECIFIC method + EXACT path
app.get('/api/users',       getAllUsers); // only GET /api/users
app.post('/api/users',      createUser);
app.put('/api/users/:id',   updateUser); // :id is a route param
app.delete('/api/users/:id',deleteUser);
app.patch('/api/users/:id', patchUser);  // partial update
```

---

## 19. Request Lifecycle

From client sending a request to server sending a response:

```
1. TCP Connection established
2. HTTP Request parsed by Node's http module
3. Express receives req and res objects
4. Express matches URL + method to route
5. Middleware chain executes (in order)
6. Route handler runs (final middleware)
7. res.send() / res.json() sends response
8. Connection closed (or kept alive for HTTP/1.1)
```

```js
app.use((req, res, next) => {
  // req has: method, url, headers, body (after json parser), params, query
  // res has: status(), json(), send(), redirect(), cookie(), set()
  next();
});
```

---

## 20. req.params vs req.query vs req.body

```js
// Route: GET /api/posts/:id/comments?page=2&limit=10
// Body (POST): { "title": "Hello", "content": "World" }

app.get('/api/posts/:id/comments', (req, res) => {
  console.log(req.params); // { id: "42" }         ← from :id in path
  console.log(req.query);  // { page: "2", limit: "10" } ← from ?key=value
  console.log(req.body);   // undefined (GET has no body)
});

app.post('/api/posts', (req, res) => {
  console.log(req.params); // {} (no params in this route)
  console.log(req.query);  // {} (no query string)
  console.log(req.body);   // { title: "Hello", content: "World" } ← JSON body
  // ⚠️ body only works after express.json() middleware is applied!
});
```

| | Source | Example | Parsed by |
|---|---|---|---|
| `req.params` | URL path | `/users/:id` → `/users/42` | Express routing |
| `req.query` | URL query string | `/users?page=2` | Express built-in |
| `req.body` | Request body | JSON / form data | `express.json()` or `multer` |
| `req.headers` | HTTP headers | `Authorization: Bearer ...` | Node http module |

---

## 21. Error Handling Middleware — 4 Args

Normal middleware has 3 args `(req, res, next)`. Error handling middleware has **4 args** `(err, req, res, next)` — Express identifies it by the signature.

```js
// Regular middleware
app.use((req, res, next) => {
  next(); // or next(new Error('something broke'))
});

// Error handling — MUST be registered LAST (after all routes)
app.use((err, req, res, next) => {
  console.error(err.stack);

  const status  = err.statusCode || 500;
  const message = err.message    || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Custom error class — makes error handling clean
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // vs programming errors
  }
}

// In a route handler — throw to trigger error middleware
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    res.json(user);
  } catch (err) {
    next(err); // ← pass to error middleware
  }
});
```

> **Rule:** 4-arg error middleware MUST be last in the middleware chain.

---

## 22. Router Module

Organize routes into separate files using `express.Router()`.

```
project/
├── index.js
└── routes/
    ├── users.js
    ├── posts.js
    └── auth.js
```

```js
// routes/users.js
const express = require('express');
const router  = express.Router();

router.get('/',    getAllUsers);   // matches GET /api/users
router.get('/:id', getUser);      // matches GET /api/users/:id
router.post('/',   createUser);   // matches POST /api/users

module.exports = router;

// index.js — mount routers
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');

app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

// You can also add router-level middleware
router.use(authMiddleware); // applies to all routes in this router
```

---

## 23. CORS

**Cross-Origin Resource Sharing** — a browser security mechanism that blocks requests from a different origin (domain/port/protocol) unless the server explicitly allows it.

```js
const cors = require('cors');

// Allow ALL origins (development only — NOT for production)
app.use(cors());

// Allow specific origins (production)
app.use(cors({
  origin: ['https://myapp.com', 'https://admin.myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,         // allow cookies to be sent
  maxAge: 86400              // preflight cache for 24 hours
}));

// Dynamic origin (e.g., whitelist from DB)
app.use(cors({
  origin: function (origin, callback) {
    const whitelist = ['https://myapp.com'];
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

> **What's a preflight?** Before a complex request (non-GET/POST or custom headers), the browser sends an `OPTIONS` request to check if CORS is allowed. Express/cors handles this automatically.

---

## 24. helmet

Adds security HTTP headers to protect against common attacks.

```js
const helmet = require('helmet');

app.use(helmet()); // enable all defaults

// What helmet sets (you can customize each):
// Content-Security-Policy    — prevent XSS
// X-Frame-Options: DENY      — prevent clickjacking
// X-Content-Type-Options     — prevent MIME sniffing
// Strict-Transport-Security  — force HTTPS
// X-XSS-Protection           — legacy XSS filter
// Referrer-Policy            — control referrer header

// Custom config
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "cdn.jsdelivr.net"]
    }
  }
}));
```

---

## 25. Rate Limiting

Prevent abuse by limiting how many requests a client can make in a time window.

```js
const rateLimit = require('express-rate-limit');

// General limiter — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,     // send RateLimit-* headers
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,                   // 10 login attempts per hour
  message: { error: 'Too many login attempts, account temporarily locked.' }
});
app.use('/api/auth/login', authLimiter);
```

---

## 26. express-validator

Validate and sanitize request input.

```js
const { body, param, validationResult } = require('express-validator');

// Validation rules as middleware array
const createUserRules = [
  body('email')
    .isEmail().withMessage('Must be a valid email')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 chars')
    .matches(/\d/).withMessage('Must contain a number'),

  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name too long'),
];

// Middleware to check validation results
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

// Use in route
app.post('/api/users', createUserRules, validate, createUser);
```

---

## 27. multer — File Upload

Handles `multipart/form-data` (file uploads).

```js
const multer = require('multer');
const path   = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // where to save
  },
  filename: (req, file, cb) => {
    // avoid filename conflicts — add timestamp
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

// File filter — only allow images
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);  // accept
  } else {
    cb(new Error('Only JPEG, PNG, WebP allowed'), false); // reject
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Single file upload
app.post('/api/upload', upload.single('avatar'), (req, res) => {
  console.log(req.file); // { fieldname, originalname, filename, path, size... }
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Multiple files
app.post('/api/gallery', upload.array('photos', 10), (req, res) => {
  console.log(req.files); // array of file objects
});
```

---

## 28. Serving Static Files

```js
// Serve files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Now: GET /logo.png → serves public/logo.png

// With options
app.use('/assets', express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',        // cache for 1 day
  etag: true,          // enable ETags for conditional requests
  index: 'index.html'  // default file for directory requests
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

---

## 29. Template Engines

Server-side rendering HTML. Less common with SPA frameworks but still asked about.

```js
// EJS — most popular, syntax feels like JSP
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    user: { name: 'Alice' },
    posts: [{ id: 1, title: 'Hello' }]
  });
});
```

```ejs
<!-- views/dashboard.ejs -->
<h1><%= title %></h1>
<p>Welcome, <%= user.name %>!</p>
<% posts.forEach(post => { %>
  <article><h2><%= post.title %></h2></article>
<% }) %>
```

---

# MUST-KNOW CONCEPTS

---

## 30. REST Principles

REST = **RE**presentational **S**tate **T**ransfer. 6 constraints:

| Constraint | What it means |
|---|---|
| **Stateless** | Each request contains all info needed; server stores no client session |
| **Client-Server** | Separation of concerns; client handles UI, server handles data |
| **Uniform Interface** | Consistent resource-based URLs, standard HTTP methods |
| **Cacheable** | Responses must declare if cacheable or not |
| **Layered System** | Client doesn't know if talking to server or load balancer |
| **Code on Demand** (optional) | Server can send executable code (e.g., JS) |

```
RESTful URL design:

GET    /api/posts          → list all posts
POST   /api/posts          → create a post
GET    /api/posts/:id      → get one post
PUT    /api/posts/:id      → replace a post (full update)
PATCH  /api/posts/:id      → update part of a post
DELETE /api/posts/:id      → delete a post

❌ Non-RESTful (RPC style — avoid):
POST /api/getPosts
POST /api/createPost
POST /api/deletePost?id=5
```

---

## 31. HTTP Methods + Status Codes

### Methods

| Method | Use | Body? | Idempotent? |
|---|---|---|---|
| GET | Read data | ❌ | ✅ |
| POST | Create | ✅ | ❌ |
| PUT | Replace (full update) | ✅ | ✅ |
| PATCH | Partial update | ✅ | ✅* |
| DELETE | Delete | Optional | ✅ |
| OPTIONS | CORS preflight | ❌ | ✅ |

### Status Codes (must memorize these)

```
2xx — Success
  200 OK              — standard success
  201 Created         — resource created (POST)
  204 No Content      — success, no body (DELETE)

3xx — Redirection
  301 Moved Permanently
  302 Found (temp redirect)
  304 Not Modified    — use cached version

4xx — Client Error
  400 Bad Request     — malformed request / validation failed
  401 Unauthorized    — not authenticated (no/invalid token)
  403 Forbidden       — authenticated but not allowed
  404 Not Found       — resource doesn't exist
  409 Conflict        — e.g., email already exists
  422 Unprocessable Entity — validation failed (some prefer over 400)
  429 Too Many Requests — rate limited

5xx — Server Error
  500 Internal Server Error — unexpected server crash
  502 Bad Gateway           — upstream server down
  503 Service Unavailable   — server overloaded / maintenance
```

---

## 32. Stateless vs Stateful

```
STATELESS (REST API):
- Server stores NO session data between requests
- Every request must include auth credentials (JWT token)
- Easy to scale horizontally — any server can handle any request

Request 1: GET /posts  → Headers: { Authorization: "Bearer eyJhbG..." }
Request 2: POST /posts → Headers: { Authorization: "Bearer eyJhbG..." }
(token sent EVERY time)

STATEFUL (Session-based):
- Server stores session in memory or Redis
- Client gets a session ID cookie, sent automatically
- Harder to scale — need sticky sessions or shared session store

Request 1: Login → Server creates session, sends sessionId cookie
Request 2: GET /dashboard → Cookie: sessionId=abc123 → server looks up session
```

---

## 33. JWT Auth

**JSON Web Token** — a self-contained token that carries claims (user data) and a signature.

```
Structure: header.payload.signature

Header:    Base64({"alg":"HS256","typ":"JWT"})
Payload:   Base64({"userId":1,"role":"admin","exp":1719244800})
Signature: HMACSHA256(header + "." + payload, SECRET_KEY)
```

```js
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET; // keep in .env!

// SIGN — create a token after login
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId, role: 'user' },          // payload
    SECRET,                             // secret
    { expiresIn: '15m' }               // short-lived
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }                // long-lived
  );

  return { accessToken, refreshToken };
}

// VERIFY — middleware to protect routes
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // attach user to request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// REFRESH TOKEN FLOW:
// 1. Client sends expired accessToken → gets 401
// 2. Client sends refreshToken to /api/auth/refresh
// 3. Server verifies refreshToken (check against DB — it can be revoked!)
// 4. Server issues a new accessToken (and optionally a new refreshToken)
// 5. Client uses new accessToken going forward
```

> **Why short-lived access tokens?** If an access token is stolen, it expires in 15 minutes. The refresh token lets users stay logged in without re-entering credentials, but it's stored securely (httpOnly cookie) and can be revoked server-side.

---

## 34. Session vs Token Auth

| | Session-Based | JWT Token-Based |
|---|---|---|
| Storage | Server (memory/Redis) | Client (localStorage/cookie) |
| Scalability | Needs shared store | Stateless — easy to scale |
| Revocation | Instant (delete session) | Hard (need blacklist or short expiry) |
| Size | Small cookie (ID only) | Larger (token carries data) |
| Security | httpOnly cookie (XSS safe) | Vulnerable if in localStorage |
| Best for | Monolith, single server | Distributed systems, microservices |

```js
// Session-based (express-session + connect-redis)
const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

app.post('/login', (req, res) => {
  // after validating credentials:
  req.session.userId = user.id; // stored server-side
  res.json({ message: 'Logged in' });
});
```

---

## 35. OAuth Basics

**OAuth 2.0** = authorization framework. Allows third-party apps to access user data without exposing passwords ("Login with Google").

```
Flow (Authorization Code — most common):

1. User clicks "Login with Google"
2. Your app redirects to Google's auth page
3. User logs in and approves permissions
4. Google redirects back to your app with an AUTHORIZATION CODE
5. Your server exchanges the code for an ACCESS TOKEN (server-to-server)
6. Your server uses the access token to fetch user info from Google
7. Your app creates/finds the user in your DB and issues your own JWT
```

> **Key point:** Your app never sees the user's Google password. You only receive a token to access their Google profile with their consent.

---

## 36. Environment Variables (.env)

Store secrets and configuration outside your code.

```bash
# .env — NEVER commit to git!
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-key-here
DB_URL=mongodb://localhost:27017/mydb
REDIS_URL=redis://localhost:6379
```

```js
require('dotenv').config(); // load .env into process.env (call once at top of entry file)

const port   = process.env.PORT   || 3000;
const secret = process.env.JWT_SECRET;
const dbUrl  = process.env.DB_URL;

// ❌ Never hardcode secrets:
const secret = 'my-secret-123'; // terrible — visible in git history!

// Different .env per environment:
// .env.development
// .env.production
// .env.test

// On production servers: set env vars through the platform
// (Heroku config vars, AWS Parameter Store, Docker secrets, etc.)
```

---

## 37. MVC Pattern

**Model-View-Controller** — separates concerns into 3 layers.

```
Request → Controller → Model → Database
                    ← Controller ← Model
Response ← View ←
```

```
project/
├── controllers/    ← business logic (what to do with the request)
│   └── userController.js
├── models/         ← data shape + DB interaction
│   └── User.js
├── routes/         ← URL mapping to controllers
│   └── userRoutes.js
├── views/          ← templates (or just send JSON in APIs)
│   └── users.ejs
├── middleware/     ← auth, logging, validation
│   └── auth.js
└── index.js        ← entry point, app setup
```

```js
// routes/userRoutes.js — routing only
router.get('/:id', userController.getUser);

// controllers/userController.js — logic only
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id); // delegates to model
    if (!user) throw new AppError('User not found', 404);
    res.json(user);
  } catch (err) { next(err); }
};

// models/User.js — data shape only
const userSchema = new Schema({ name: String, email: String });
module.exports = mongoose.model('User', userSchema);
```

---

## 38. SOLID Principles

| Principle | Meaning | Quick example |
|---|---|---|
| **S** — Single Responsibility | One class/function does ONE thing | `userController` only handles HTTP, `UserService` handles business logic |
| **O** — Open/Closed | Open for extension, closed for modification | Add new features via plugins/subclasses, not editing existing code |
| **L** — Liskov Substitution | Subclasses should be swappable with parent | `MySQLDB` and `MongoDB` both implement `DB.find()` interface |
| **I** — Interface Segregation | Don't force classes to implement unused methods | Separate `Readable` and `Writable` interfaces vs one huge `Stream` |
| **D** — Dependency Inversion | Depend on abstractions, not concretions | Inject `db` dependency vs hardcode `mongoose` inside controller |

```js
// ❌ Violates D — controller tightly coupled to mongoose
const Post = require('../models/Post'); // hardcoded dependency

// ✅ Follows D — inject the repository
class PostController {
  constructor(postRepository) { // accepts any object with .findAll()
    this.repo = postRepository;
  }
  async getAll(req, res) {
    const posts = await this.repo.findAll();
    res.json(posts);
  }
}
```

---

## 39. API Versioning

Allows you to evolve your API without breaking existing clients.

```js
// URL versioning (most common, most explicit)
app.use('/api/v1/users', v1UserRouter);
app.use('/api/v2/users', v2UserRouter);

// Header versioning
app.use((req, res, next) => {
  req.apiVersion = req.headers['api-version'] || '1';
  next();
});

// Query string versioning
// GET /api/users?version=2
```

> **Best practice:** URL versioning (`/api/v1/`) is the most common in interviews. Always deprecate old versions with a sunset date in the response headers.

---

## 40. Pagination Strategies

Never return thousands of records at once. Always paginate.

```js
// Strategy 1: Offset-based (simplest, most common)
// GET /api/posts?page=2&limit=10
app.get('/api/posts', async (req, res) => {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find().skip(skip).limit(limit),
    Post.countDocuments()
  ]);

  res.json({
    data: posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  });
});

// Strategy 2: Cursor-based (better for large datasets, real-time data)
// GET /api/posts?cursor=<lastId>&limit=10
// Uses the last item's ID as a cursor — no skip(), better performance
app.get('/api/posts', async (req, res) => {
  const { cursor, limit = 10 } = req.query;
  const query = cursor ? { _id: { $gt: cursor } } : {};
  const posts = await Post.find(query).limit(Number(limit) + 1);
  const hasNext = posts.length > limit;
  if (hasNext) posts.pop();
  res.json({ data: posts, nextCursor: hasNext ? posts.at(-1)._id : null });
});
```

> **Offset vs Cursor:** Offset is simple but slow on large datasets (SKIP scans all preceding rows). Cursor is fast and handles real-time data insertions gracefully (no duplicate/missing items).

---

## 41. Compression

Compress HTTP responses to reduce bandwidth.

```js
const compression = require('compression');

// Enable gzip/deflate/brotli compression for all responses
app.use(compression({
  level: 6,           // compression level 1-9 (6 is a good default)
  threshold: 1024,    // only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false; // allow bypass
    return compression.filter(req, res); // default filter
  }
}));

// Result: a 100KB JSON response might compress to 15-20KB
// Significant bandwidth savings for large API responses
```

---

## 42. Caching Headers

Tell clients and CDNs how to cache responses.

```js
// Cache-Control
res.set('Cache-Control', 'no-store');                // never cache (auth responses)
res.set('Cache-Control', 'public, max-age=86400');   // cache 24h, CDN can cache
res.set('Cache-Control', 'private, max-age=3600');   // cache 1h, only browser

// ETag — fingerprint of the response content
// Client sends: If-None-Match: "abc123"
// If unchanged: server responds 304 Not Modified (no body = saves bandwidth)
res.set('ETag', generateEtag(data));
if (req.headers['if-none-match'] === etag) {
  return res.status(304).end();
}

// Last-Modified
res.set('Last-Modified', post.updatedAt.toUTCString());
if (req.headers['if-modified-since']) {
  const since = new Date(req.headers['if-modified-since']);
  if (post.updatedAt <= since) return res.status(304).end();
}
```

---

# 🏗️ Build Project

**REST API for a Blog** — in-memory storage, no DB needed yet.

## Project structure:
```
DAY2_Project/
├── index.js          ← app entry point
├── routes/
│   ├── posts.js      ← CRUD routes
│   └── auth.js       ← login/register routes
├── middleware/
│   ├── auth.js       ← JWT verification middleware
│   ├── validate.js   ← validation result checker
│   └── errorHandler.js ← 4-arg error middleware
├── data/
│   └── store.js      ← in-memory "database" (arrays)
└── .env
```

## What to implement:
- ✅ `POST /api/auth/register` — store user in array (hash password with bcrypt)
- ✅ `POST /api/auth/login` — verify + issue JWT
- ✅ `GET /api/posts` — list all posts (public, paginated with ?page=&limit=)
- ✅ `GET /api/posts/:id` — get one post (public)
- ✅ `POST /api/posts` — create post (protected — JWT required)
- ✅ `PUT /api/posts/:id` — update post (protected + author only)
- ✅ `DELETE /api/posts/:id` — delete post (protected + author only)
- ✅ Rate limiting on `/api/auth/`
- ✅ express-validator on register + create post
- ✅ 4-arg error middleware
- ✅ Correct status codes everywhere
- ✅ CORS + helmet

## Test with Thunder Client or Postman

---

# 🧪 Quiz — 25 Questions

---

### Section A — Node.js Core

**Q1.** Node.js is single-threaded but handles 10,000 concurrent connections. How?

<details>
<summary>Answer</summary>

Node uses a **non-blocking event loop model**. When an async operation (file read, DB query) is initiated, Node hands it to the OS/libuv thread pool and immediately moves to the next request. When the operation completes, the callback is queued and the event loop picks it up when the call stack is empty.

The single thread **never blocks waiting** — it's always free to handle the next request. This makes Node excellent for I/O-bound workloads.

</details>

---

**Q2.** What are the 6 phases of Node's event loop in order?

<details>
<summary>Answer</summary>

1. **Timers** — executes `setTimeout` and `setInterval` callbacks
2. **Pending callbacks** — I/O error callbacks from previous cycle
3. **Idle, prepare** — internal Node use only
4. **Poll** — retrieves new I/O events; executes I/O callbacks
5. **Check** — `setImmediate` callbacks
6. **Close callbacks** — `socket.on('close', ...)` etc.

Between **every phase**, the microtask queues drain completely: `process.nextTick` first, then Promise callbacks.

</details>

---

**Q3.** What is the output?
```js
setImmediate(() => console.log('immediate'));
setTimeout(() => console.log('timeout'), 0);
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));
```
<details>
<summary>Answer</summary>

```
nextTick
promise
timeout   (or immediate — these two are non-deterministic at top level)
immediate
```

`process.nextTick` has the highest priority (runs before the event loop continues). Promise callbacks are microtasks that run after `nextTick`. `setTimeout(fn, 0)` vs `setImmediate` order is non-deterministic at the top level (depends on OS timer resolution), but inside an I/O callback, `setImmediate` always runs first.

</details>

---

**Q4.** Why should you NEVER use `fs.readFileSync` in an Express route handler?

<details>
<summary>Answer</summary>

`readFileSync` is **blocking** — it freezes the Node.js event loop until the file is fully read. During that time, no other requests can be processed. If the file takes 500ms to read, every pending request waits 500ms.

Always use the async version (`fs.readFile` or `fs.promises.readFile`) which uses the OS and libuv thread pool, keeping the event loop free to handle other requests.

</details>

---

**Q5.** What is the difference between `spawn`, `exec`, and `fork` in `child_process`?

<details>
<summary>Answer</summary>

- **`exec`** — runs a shell command, **buffers** the entire output, delivers it in the callback. Good for small outputs (`git status`, `ls`). Risk: large output can run out of buffer.
- **`spawn`** — runs a command, **streams** stdout/stderr. Better for large or long-running commands. No shell by default.
- **`fork`** — specifically for running another **Node.js script**. Creates a new V8 instance with a built-in IPC channel (`.send()`/`.on('message')`). Used for offloading CPU-intensive work.

</details>

---

**Q6.** When would you use `worker_threads` vs `cluster`?

<details>
<summary>Answer</summary>

- **`cluster`** — forks multiple Node **processes** (separate memory). Best for: handling more HTTP connections by utilizing all CPU cores. Each worker is a full Node process.
- **`worker_threads`** — runs parallel JS in **threads within the same process**. Can share memory via `SharedArrayBuffer`. Best for: CPU-intensive operations (image processing, crypto, number crunching) without the overhead of a full process.

Rule of thumb: `cluster` for web server scaling, `worker_threads` for CPU work.

</details>

---

**Q7.** What is the difference between `npm install` and `npm ci`?

<details>
<summary>Answer</summary>

- **`npm install`** — installs deps, can update `package-lock.json`, creates `node_modules` from `package.json` ranges.
- **`npm ci`** — "clean install". **Deletes** existing `node_modules`, installs **exactly** what's in `package-lock.json`. Faster, deterministic, fails if `package-lock.json` is missing or doesn't match `package.json`.

Use `npm ci` in CI/CD pipelines for reproducible builds.

</details>

---

### Section B — Express Core

**Q8.** What is middleware? Explain how the chain works.

<details>
<summary>Answer</summary>

Middleware is a function with signature `(req, res, next)`. Express processes middleware **in registration order**. Each middleware can:
1. **Modify `req` or `res`** (e.g., parse body, add user from token)
2. **End the request** (e.g., `res.json(...)`)
3. **Pass to the next middleware** via `next()`
4. **Pass an error** via `next(err)` — goes to 4-arg error handler

If `next()` is not called and `res` is not ended, the request **hangs**. This is the most common Express bug.

</details>

---

**Q9.** What is the output of the following (which route matches `GET /api/users/me`)?
```js
app.get('/api/users/:id', (req, res) => res.send('param route'));
app.get('/api/users/me',  (req, res) => res.send('literal route'));
```
<details>
<summary>Answer</summary>

**`"param route"`** — Express matches routes **in registration order**. `/api/users/:id` is registered first, so `:id` captures `"me"`. `req.params.id` would be `"me"`.

**Fix:** Register the literal route BEFORE the param route:
```js
app.get('/api/users/me',  (req, res) => res.send('literal route'));
app.get('/api/users/:id', (req, res) => res.send('param route'));
```

</details>

---

**Q10.** What is the difference between `req.params`, `req.query`, and `req.body`?

<details>
<summary>Answer</summary>

For route `PUT /api/posts/42?draft=true` with body `{ "title": "Hello" }`:

- **`req.params`** = `{ id: "42" }` — values from the URL path (`:id`)
- **`req.query`** = `{ draft: "true" }` — values from the query string after `?`
- **`req.body`** = `{ title: "Hello" }` — parsed request body (requires `express.json()` middleware for JSON)

Note: all values from params and query are **strings** — parse them if you need numbers.

</details>

---

**Q11.** How do you create an error handling middleware in Express? What makes it different from regular middleware?

<details>
<summary>Answer</summary>

Error handling middleware has **4 parameters** `(err, req, res, next)`. Express identifies it by the 4-arg signature.

```js
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});
```

Rules:
1. Must have exactly 4 parameters (even if `next` isn't used)
2. Must be registered **after all routes and middleware**
3. Triggered by `next(err)` calls anywhere in the chain
4. Triggered automatically by `throw` inside async route handlers if you wrap them with a try/catch that calls `next(err)`

</details>

---

**Q12.** What is CORS and when does the browser enforce it?

<details>
<summary>Answer</summary>

**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism. The browser blocks a web page from making requests to a **different origin** (different domain, port, or protocol) than the one that served the page.

It's a **browser-only** restriction — tools like Postman don't enforce CORS.

The browser sends an `OPTIONS` **preflight request** first for "complex" requests (custom headers, non-GET/POST). The server must respond with appropriate `Access-Control-Allow-*` headers for the browser to proceed.

```js
app.use(cors({ origin: 'https://myapp.com' }));
// Sets: Access-Control-Allow-Origin: https://myapp.com
```

</details>

---

### Section C — Must-Know Concepts

**Q13.** What are the 6 constraints of REST?

<details>
<summary>Answer</summary>

1. **Stateless** — each request is self-contained; no server-side session
2. **Client-Server** — separation of UI and data concerns
3. **Uniform Interface** — consistent resource URLs + standard HTTP methods
4. **Cacheable** — responses declare cacheability
5. **Layered System** — client can't tell if it's talking to the actual server or a proxy
6. **Code on Demand** (optional) — server can send executable code

The most important for interviews: **Stateless** and **Uniform Interface**.

</details>

---

**Q14.** What is the difference between `401 Unauthorized` and `403 Forbidden`?

<details>
<summary>Answer</summary>

- **401 Unauthorized** — the request is **not authenticated**. "I don't know who you are." Send a token or log in first. Despite the name, it means "unauthenticated".
- **403 Forbidden** — the request **is authenticated**, but the user lacks permission. "I know who you are, but you're not allowed here."

Example:
- No token → 401
- Valid token but user is not admin → 403

</details>

---

**Q15.** Explain the JWT structure and what each part contains.

<details>
<summary>Answer</summary>

A JWT has 3 Base64URL-encoded parts separated by dots: `header.payload.signature`

- **Header** — algorithm and token type: `{ "alg": "HS256", "typ": "JWT" }`
- **Payload** — claims (user data + standard claims): `{ "userId": 1, "role": "admin", "iat": 1234, "exp": 1234 }`. NOT encrypted — anyone can decode it, so never put passwords here.
- **Signature** — `HMACSHA256(base64(header) + "." + base64(payload), SECRET)`. Proves the token wasn't tampered with. Only the server (with the secret) can verify it.

</details>

---

**Q16.** How does the JWT refresh token flow work?

<details>
<summary>Answer</summary>

1. **Login** → server issues a short-lived **access token** (15 min) + a long-lived **refresh token** (7 days). Refresh token stored in httpOnly cookie.
2. **API call** → client sends access token in `Authorization: Bearer <token>` header.
3. **Token expires** → server returns `401 Token expired`.
4. **Refresh** → client automatically calls `POST /api/auth/refresh` with the refresh token (from cookie).
5. **Server verifies** refresh token → checks it exists in DB (so it can be revoked) → issues a new access token.
6. **Client retries** the original request with the new access token.

If refresh token is also expired/revoked → force re-login.

</details>

---

**Q17.** What is the difference between offset-based and cursor-based pagination?

<details>
<summary>Answer</summary>

**Offset-based** (`?page=2&limit=10`):
- Uses `SKIP` + `LIMIT` in the query
- ✅ Simple, allows jumping to any page
- ❌ Slow on large datasets (SKIP must scan all prior records)
- ❌ Prone to duplicates/missing items when data changes between pages

**Cursor-based** (`?cursor=<lastId>&limit=10`):
- Uses the last item's ID as a starting point (`WHERE id > cursor LIMIT 10`)
- ✅ Fast (uses index, no scan)
- ✅ No duplicate/missing items on data change
- ❌ Can't jump to a specific page
- Best for: infinite scroll, feeds, large datasets

</details>

---

**Q18.** What is the MVC pattern? Map it to an Express application.

<details>
<summary>Answer</summary>

**Model-View-Controller** separates application logic into 3 layers:

- **Model** — data layer. Defines schema, handles DB queries. In Express: Mongoose/Sequelize models.
- **View** — presentation layer. In REST APIs: the JSON response. In SSR apps: template files.
- **Controller** — business logic layer. Receives request, calls model, returns response. In Express: route handler functions.

```
Request → Router → Controller → Model → DB
                             ← Model
Response ← Controller (JSON)
```

Separating these makes the code testable (you can unit test controllers with mocked models) and maintainable.

</details>

---

**Q19.** What's the SOLID principle you'd most likely apply in a Node.js API? Give an example.

<details>
<summary>Answer</summary>

**Single Responsibility (S)** and **Dependency Inversion (D)** are most common in Node interviews.

**S example:** Keep route handlers thin — controller does NOT contain SQL queries. Controller calls a service, service calls a repository.

**D example:**
```js
// Instead of:
const User = require('../models/User'); // hard dependency

// Inject the dependency:
class UserController {
  constructor(userService) { this.userService = userService; }
  async getUser(req, res) {
    const user = await this.userService.findById(req.params.id);
    res.json(user);
  }
}
// Now you can swap UserService with a mock in tests easily
```

</details>

---

### Section D — Tricky / Advanced

**Q20.** What is the output?
```js
const http = require('http');
const server = http.createServer((req, res) => {
  console.log('Request received');
  res.end('Hello');
});
server.listen(3000, () => {
  console.log('Server started');
});
console.log('After listen call');
```
<details>
<summary>Answer</summary>

```
After listen call
Server started
Request received  (only when a request comes in)
```

`server.listen()` is **non-blocking**. The callback fires when the server is actually listening, but `console.log('After listen call')` runs synchronously immediately after. The event loop then processes the "listening" event and fires the callback.

</details>

---

**Q21.** You have a route handler with an async function. What happens if the promise rejects and you DON'T catch it?

<details>
<summary>Answer</summary>

```js
app.get('/api/users', async (req, res) => {
  const users = await User.findAll(); // throws!
  res.json(users);
});
```

In Express 4.x — the error is an **unhandled promise rejection**. The request **hangs** (no response sent). The error is NOT passed to your error middleware.

**Fix — wrap with try/catch:**
```js
app.get('/api/users', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) { next(err); }
});
```

**Or use a wrapper utility:**
```js
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/api/users', asyncHandler(async (req, res) => {
  const users = await User.findAll();
  res.json(users);
}));
```

Note: Express 5 (in progress) handles this automatically.

</details>

---

**Q22.** What happens if you call `res.json()` twice in a route handler?

<details>
<summary>Answer</summary>

You'll get an error: **"Cannot set headers after they are sent to the client"**. HTTP responses can only be sent once. Once `res.json()` or `res.send()` is called, the response stream is closed.

Common mistake:
```js
app.get('/api/user', (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' }); // sends response
    // ⚠️ missing return — code continues!
  }
  res.json(req.user); // ❌ Error: headers already sent!
});

// Fix: always return after sending
if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
res.json(req.user);
```

</details>

---

**Q23.** What does `app.use(express.json())` do exactly? What happens without it?

<details>
<summary>Answer</summary>

`express.json()` is a **body parser middleware**. It reads the raw request body stream, parses it as JSON, and attaches the result to `req.body`.

Without it, `req.body` is **`undefined`** even when the client sends a JSON payload. You'd get `Cannot read property 'email' of undefined` when accessing `req.body.email`.

Internally it:
1. Checks `Content-Type: application/json` header
2. Reads the request stream with a size limit (default 100kb)
3. Parses JSON
4. Sets `req.body`
5. Calls `next()`

</details>

---

**Q24.** How would you handle file uploads in Express? What middleware do you use?

<details>
<summary>Answer</summary>

Use **multer** middleware for `multipart/form-data` requests.

Key concepts:
- `multer.diskStorage` — configure where and what to name the file
- `fileFilter` — validate MIME type before accepting
- `limits.fileSize` — reject oversized files
- `upload.single('fieldName')` — single file; `upload.array('fieldName', max)` — multiple
- After the middleware: `req.file` (single) or `req.files` (multiple) has file info
- For cloud storage: use `multer-s3` to stream directly to S3 without saving locally

Security: always validate MIME type AND extension, set a size limit, generate unique filenames to prevent collisions/overwrites.

</details>

---

**Q25.** Design question: You're building an API that needs to be secure. What middleware stack would you set up in Express and why?

<details>
<summary>Answer</summary>

```js
// 1. helmet — security headers (XSS, clickjacking, MIME sniffing)
app.use(helmet());

// 2. cors — restrict cross-origin access
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));

// 3. rate limiting — prevent brute force and DDoS
app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 100 }));

// 4. compression — reduce response size
app.use(compression());

// 5. body parser — with size limit to prevent DoS via large payloads
app.use(express.json({ limit: '10kb' }));

// 6. request logging (morgan or custom)
app.use(morgan('combined'));

// 7. routes
app.use('/api/auth', authRouter);
app.use('/api/posts', authMiddleware, postsRouter); // protected

// 8. 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// 9. error handler — LAST
app.use(errorHandler);
```

Order matters: security headers first, then rate limiting (fail fast), then body parsing.

</details>

---

## 🎯 Quick Cheat Sheet

```
📌 Node = V8 (JS engine) + libuv (async I/O) + Node APIs
📌 Single thread + event loop = handles many connections without blocking
📌 Event loop order: timers → pending I/O → poll → check(setImmediate) → close
📌 process.nextTick > Promise microtasks > macrotasks
📌 Streams = chunk-by-chunk processing (low memory for large data)
📌 Middleware = (req, res, next) — runs in registration order
📌 Error middleware = (err, req, res, next) — 4 args, registered LAST
📌 req.params = :id | req.query = ?key=val | req.body = parsed JSON body
📌 JWT: short-lived access token + long-lived refresh token in httpOnly cookie
📌 401 = not authenticated | 403 = not authorized
📌 CORS = browser security | helmet = HTTP headers security
📌 Rate limiting = prevent brute force/DDoS
📌 Offset pagination = simple, slow at scale | Cursor = fast, no duplicates
📌 MVC: Model (data) + Controller (logic) + View (response)
📌 Always return after res.send() — sending twice crashes the request
📌 Never use *Sync in route handlers — blocks the event loop
```

---

*Proud of you for pushing through Day 2! 💪*

> **Next:** [Day 3 — React: UI That Makes Sense](./Day3_React_Guide.md)  
> **Previous:** [Day 1 — JavaScript: The Full Picture](./Day1_JavaScript_Complete_Guide.md)
