# 🚀 Placement Preparation Tracker

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-Semantic-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Custom%20Properties-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://placement-preparation-tracker-tavq.onrender.com/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](./package.json)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Rishikajain123-tech/Placement-Preparation-tracker)

A full-stack web application to help students organise and track their DSA placement preparation efficiently. Built with **Node.js + Express** on the backend and **HTML, CSS, Vanilla JavaScript** on the frontend — following a clean **MVC architecture** with a RESTful API.

| | Link |
|---|---|
| 🟢 **Live App (Render — Full Stack)** | https://placement-preparation-tracker-tavq.onrender.com/ |
| 🔵 **Static Demo (GitHub Pages)** | https://rishikajain123-tech.github.io/Placement-Preparation-tracker/ |

> ⚠️ The Render deployment runs the full Express server. GitHub Pages serves only the static UI without the API.

---

## 📸 Project Preview

<img width="1665" height="898" alt="Dashboard View" src="https://github.com/user-attachments/assets/84733802-d596-4f2b-bfe6-6cd035b32281" />
<img width="1483" height="807" alt="Question List" src="https://github.com/user-attachments/assets/fd396d70-360d-4ba5-87ae-01e247d4984f" />

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ✅ Add Questions | Log DSA questions with company, topic, difficulty & status |
| ✏️ Edit Questions | In-place editing via the same form |
| 🗑️ Delete Questions | Confirm-then-delete with instant table update |
| 🔍 Live Search | Instant results as you type (title, company, topic) |
| 🏢 Company Filter | Filter by Amazon, Google, Microsoft, Adobe, Flipkart… |
| 📚 Topic Filter | Filter by Arrays, Trees, DP, Graphs and 9 more topics |
| 📊 Dashboard | Live stats — total, solved, remaining, % progress bar |
| 🚫 Duplicate Guard | Server-side check prevents same company + title twice |
| 🍞 Toast Alerts | Non-blocking success / warning / error notifications |
| 📱 Responsive | Works on desktop, tablet and mobile |
| 🔌 REST API | Clean JSON API — ready for mobile clients or CLI tools |

---

## 🛠️ Tech Stack

### Backend
| Technology | Role |
|-----------|------|
| Node.js | Runtime |
| Express 5 | HTTP server + routing |
| dotenv | Environment variable management |
| cors | Cross-origin requests |
| nodemon | Dev auto-restart |

### Frontend
| Technology | Role |
|-----------|------|
| HTML5 (semantic) | Structure |
| CSS3 + Custom Properties | Styling & design system |
| Vanilla JavaScript (ES6) | UI logic + `fetch()` API calls |
| Font Awesome 6 | Icons |
| Google Fonts — Poppins | Typography |

---

## 📂 Project Structure

```
Placement Tracker/
│
├── server.js                   ← Entry point — boots Express
├── package.json
├── .env                        ← PORT config (not committed)
├── .gitignore
│
├── src/                        ← All server-side source code
│   ├── config/
│   │   └── index.js            ← Central config (reads .env)
│   ├── models/
│   │   └── questionModel.js    ← Data layer (in-memory, DB-ready)
│   ├── controllers/
│   │   └── questionController.js  ← Business logic + HTTP responses
│   ├── routes/
│   │   └── questionRoutes.js   ← URL → controller mapping
│   └── middleware/
│       ├── errorHandler.js     ← Global error handler
│       └── validateQuestion.js ← Input validation + sanitisation
│
├── public/                     ← Static frontend (served by Express)
│   ├── index.html
│   ├── style.css
│   └── script.js               ← fetch()-based API client
│
└── README.md
```

---

## 🏗️ Architecture — MVC

```
┌─────────────────────────────────────────────────────────────┐
│                        MVC LAYERS                           │
│                                                             │
│  VIEW               CONTROLLER              MODEL           │
│  ──────────         ───────────────         ──────────────  │
│  public/            questionController      questionModel   │
│  index.html         .js                     .js             │
│  style.css                                                  │
│  script.js ──────►  Receives HTTP req  ───► Owns data       │
│  (fetch API)        Applies business        CRUD methods    │
│                     rules                   In-memory now   │
│                     Sends response          DB-ready later  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Program Flow

### Application Boot

```mermaid
flowchart TD
    A([npm run dev]) --> B[nodemon starts server.js]
    B --> C[Load .env\nread PORT]
    C --> D[Create Express app]
    D --> E[Register middleware\ncors · json · static]
    E --> F[Mount /api/questions router]
    F --> G[app.listen PORT 3000]
    G --> H([Server ready ✅\nlocalhost:3000])
```

### Browser First Load

```mermaid
sequenceDiagram
    participant Browser
    participant Express
    participant Controller
    participant Model

    Browser->>Express: GET /
    Express-->>Browser: 200 index.html + style.css + script.js

    Note over Browser: init() runs
    Browser->>Express: GET /api/questions
    Express->>Controller: getAllQuestions()
    Controller->>Model: getAll()
    Model-->>Controller: Question[]
    Controller-->>Browser: 200 JSON array

    Note over Browser: renderQuestions()\nupdateDashboard()
```

### Full CRUD Request Lifecycle

```mermaid
flowchart TD
    Browser([Browser\nfetch API]) -->|HTTP Request| Router

    subgraph Server [Express Server]
        Router[Router\nquestionRoutes.js] --> Middleware
        Middleware[Middleware\nvalidateQuestion.js] --> Controller
        Controller[Controller\nquestionController.js] --> Model
        Model[Model\nquestionModel.js] --> Store

        subgraph Store [Data Store]
            InMem[In-Memory Array\n— current]
            DB[Database\n— future swap]
        end
    end

    Model -->|data| Controller
    Controller -->|res.json| Browser
```

### Add Question Flow

```mermaid
flowchart LR
    A([User submits form]) --> B[script.js\nfetch POST /api/questions]
    B --> C[validateQuestion\nmiddleware]
    C -- 400 Bad Request --> D[Toast: field errors]
    C -- Valid --> E[questionController\ncreateQuestion]
    E --> F{Duplicate\ncheck}
    F -- 409 Conflict --> G[Toast: already exists]
    F -- Unique --> H[questionModel.create]
    H --> I[201 Created]
    I --> J[Toast success\nrenderQuestions\nupdateDashboard]
```

### Edit & Delete Flow

```mermaid
flowchart LR
    subgraph Edit
        A([Click Edit]) --> B[enterEditMode\npopulate form]
        B --> C([Submit Update])
        C --> D[fetch PUT /api/questions/:id]
        D --> E[Controller\nvalidate + update]
        E --> F[200 OK]
        F --> G[exitEditMode\nrefresh table]
    end

    subgraph Delete
        H([Click Delete]) --> I[confirm dialog]
        I -- Cancel --> J([No change])
        I -- OK --> K[fetch DELETE /api/questions/:id]
        K --> L[Controller\nremove from store]
        L --> M[204 No Content]
        M --> N[refresh table\nupdateDashboard]
    end
```

---

## 🔌 REST API Reference

**Base URL:** `http://localhost:3000/api`

| Method | Endpoint | Description | Body | Response |
|--------|----------|-------------|------|----------|
| `GET` | `/questions` | Get all questions | — | `200 Question[]` |
| `GET` | `/questions/:id` | Get one question | — | `200 Question` |
| `POST` | `/questions` | Create question | `QuestionInput` | `201 Question` |
| `PUT` | `/questions/:id` | Update question | `QuestionInput` | `200 Question` |
| `DELETE` | `/questions/:id` | Delete question | — | `204 No Content` |

### Query Parameters (`GET /questions`)

| Param | Example | Effect |
|-------|---------|--------|
| `search` | `?search=two+sum` | Full-text match on title, company, topic |
| `company` | `?company=Google` | Filter by company |
| `topic` | `?topic=Arrays` | Filter by topic |
| `difficulty` | `?difficulty=Hard` | Filter by difficulty |
| `status` | `?status=Solved` | Filter by status |

### Question Schema

```json
{
  "id": 1724609400000,
  "company": "Google",
  "topic": "Arrays",
  "title": "Two Sum",
  "link": "https://leetcode.com/problems/two-sum/",
  "difficulty": "Easy",
  "status": "Solved"
}
```

### Error Response Schema

```json
{
  "error": "Validation failed. Please fix the following fields.",
  "fields": {
    "company": "Company is required.",
    "title": "Question title is required."
  }
}
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node)

### 1 — Clone the repository

```bash
git clone https://github.com/Rishikajain123-tech/Placement-Preparation-tracker.git
cd Placement-Preparation-tracker
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Create the environment file

```bash
# Create a .env file in the project root
echo PORT=3000 > .env
```

Or manually create `.env`:
```
PORT=3000
```

### 4 — Start the server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

### 5 — Open the app

```
http://localhost:3000
```

> The server serves the frontend automatically — no separate frontend server needed.

---

## 🌐 Deployment Guide

> **Important:** GitHub Pages only hosts **static files** — it cannot run Node.js.
> The live demo link above serves the old static version.
> To deploy the full Express backend, use one of the platforms below.

---

### Deployment Options at a Glance

| Platform | Supports Node.js | Free Tier | Custom Domain | Best For |
|----------|-----------------|-----------|---------------|----------|
| **GitHub Pages** | ❌ Static only | ✅ Always free | ✅ | Frontend-only demo |
| **Railway** | ✅ | ✅ $5 credit/mo | ✅ | Full-stack, easiest setup |
| **Render** | ✅ | ✅ Free tier | ✅ | Full-stack, spins down on idle |
| **Heroku** | ✅ | ❌ Paid only | ✅ | Full-stack, mature platform |

---

### Deployment Flow

```mermaid
flowchart TD
    Dev([Local Development\nnpm run dev]) --> Push[git push origin main]

    Push --> GHP
    Push --> Railway
    Push --> Render

    subgraph GHP [GitHub Pages — Static Only]
        G1[Settings → Pages] --> G2[Source: main branch / root]
        G2 --> G3([Serves public/ HTML+CSS+JS\nNo server. No API.])
    end

    subgraph Railway [Railway — Full Stack]
        R1[Connect GitHub repo] --> R2[Auto-detect Node.js]
        R2 --> R3[Set PORT env var] --> R4([npm start runs\nFull API + Frontend])
    end

    subgraph Render [Render — Full Stack]
        N1[New Web Service] --> N2[Connect GitHub repo]
        N2 --> N3[Build: npm install\nStart: npm start]
        N3 --> N4([Deployed URL\nFull API + Frontend])
    end
```

---

### Option A — GitHub Pages *(Current — Static Frontend Only)*

> ⚠️ GitHub Pages **cannot** run the Express server. It only serves the files in `public/`.
> The API will **not work** on GitHub Pages — this option is suitable only as a static UI demo.

**Steps:**

1. Go to your repository on GitHub
2. Click **Settings → Pages**
3. Under **Source**, select branch `main` and folder `/ (root)` or `/public`
4. Click **Save**
5. Your site is live at:
   ```
   https://rishikajain123-tech.github.io/Placement-Preparation-tracker/
   ```

**What works:** The UI renders.  
**What doesn't:** All `fetch()` API calls fail — no data will be saved or loaded.

---

### Option B — Railway *(Recommended — Full Stack)*

Railway auto-detects Node.js and deploys with zero config.

**Steps:**

1. Sign up at [railway.app](https://railway.app) (free tier available)

2. Click **New Project → Deploy from GitHub repo**

3. Select `Placement-Preparation-tracker`

4. Railway auto-detects `package.json` and runs `npm start`

5. Add the environment variable:
   ```
   PORT = 3000
   ```
   *(Railway injects its own `PORT` automatically — you can skip this)*

6. Click **Deploy** — Railway gives you a public URL like:
   ```
   https://placement-tracker-production.up.railway.app
   ```

**Deployment flow:**
```mermaid
flowchart LR
    A[git push origin main] --> B[Railway detects push]
    B --> C[npm install]
    C --> D[npm start → node server.js]
    D --> E([Public URL live\nFull API + Frontend])
```

---

### Option C — Render ✅ *(Currently Deployed Here)*

> 🟢 **This project is live at:** https://placement-preparation-tracker-tavq.onrender.com/

**Steps:**

1. Sign up at [render.com](https://render.com)

2. Click **New → Web Service**

   > ⚠️ **Critical:** You MUST choose **Web Service**, NOT "Static Site".  
   > A Static Site cannot run Node.js — Express will never start and all API calls will return 404.

3. Connect your GitHub account and select `Placement-Preparation-tracker`

4. Fill in the service settings:

   | Field | Value |
   |-------|-------|
   | **Language** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | `Free` |

5. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `PORT` | `10000` |
   | `NODE_ENV` | `production` |

   *(Render injects its own `PORT` automatically — the value above is a safe fallback)*

6. Click **Create Web Service** — Render gives you a URL like:
   ```
   https://your-app-name.onrender.com
   ```

7. **Verify the deployment is working:**
   ```
   # Should return [] (empty array, not a 404)
   curl https://your-app-name.onrender.com/api/questions
   ```

> ⚠️ **Free tier note:** Render spins the service down after 15 minutes of inactivity. The first request after idle takes ~30 seconds to cold-start. Upgrade to a **Starter** instance ($7/mo) to keep it always-on.

---

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Port the server listens on |
| `NODE_ENV` | No | `development` | Set to `production` on live servers |
| `DB_URL` | Future | — | Database connection string (when added) |

Create a `.env` file locally (never commit it — it's in `.gitignore`):
```
PORT=3000
NODE_ENV=development
```

On Railway / Render, set these in the platform's **Environment Variables** dashboard instead of a `.env` file.

---

### Pre-Deployment Checklist

```
[ ] npm install runs without errors
[ ] npm start launches the server without crashing
[ ] GET http://localhost:3000/api/questions returns []
[ ] PORT env variable is set on the platform
[ ] node_modules/ is in .gitignore (never commit it)
[ ] .env is in .gitignore (never commit secrets)
```

---

## 🗂️ Supported Data Values

### Companies
`Amazon` · `Google` · `Microsoft` · `Adobe` · `Flipkart` · `Walmart` · `Other`

### Topics
`Arrays` · `Strings` · `Linked List` · `Stack` · `Queue` · `Binary Search` · `Trees` · `Graphs` · `DP` · `Greedy` · `Backtracking` · `Heap` · `Other`

### Difficulty
`Easy` · `Medium` · `Hard`

### Status
`Solved` · `Unsolved`

---

## 🔮 Future Improvements

| Feature | Status |
|---------|--------|
| Database integration (SQLite / MongoDB) | Planned — model interface is ready |
| User authentication | Planned |
| Dark mode | Planned |
| Export progress as PDF / CSV | Planned |
| Weekly analytics charts | Planned |
| Calendar-based study planner | Planned |
| Notes / hints per question | Planned |
| Coding streak tracker | Planned |

> The data layer (`src/models/questionModel.js`) is designed for a zero-friction DB swap — only that one file changes when a database is added.

---

## 👩‍💻 Author

**Rishika Jain**
- GitHub: [@Rishikajain123-tech](https://github.com/Rishikajain123-tech)

---

## ⭐ Support

If you found this project useful, give it a ⭐ on GitHub — it means a lot!
