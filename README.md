# 🚀 Placement Preparation Tracker

A full-stack web application to help students organise and track their DSA placement preparation efficiently. Built with **Node.js + Express** on the backend and **HTML, CSS, Vanilla JavaScript** on the frontend — following a clean **MVC architecture** with a RESTful API.

> 🔗 **Live Demo (static version):** https://rishikajain123-tech.github.io/Placement-Preparation-tracker/

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
