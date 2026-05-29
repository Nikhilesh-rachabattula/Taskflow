# TaskFlow – Team Task Manager

A full-stack team task management application built with React, Node.js/Express, and PostgreSQL.

## 🔗 Live Demo

- **Frontend:** https://frontend-production-73f7.up.railway.app
- **Backend API:** https://backend-production-88ca.up.railway.app/api/health
- **GitHub:** https://github.com/Nikhilesh-rachabattula/Taskflow

## ✨ Features

- **Auth** — JWT-based signup/login with bcrypt password hashing and protected routes
- **Projects** — Create projects, invite members via email, role-based access (Admin/Member)
- **Tasks** — Create, assign, filter, and update tasks with priority levels and due dates
- **Dashboard** — Real-time stats: total tasks, tasks by status, per-user breakdown, overdue count
- **Role-Based Access** — Admins manage everything; Members can only update status of their own tasks
- **Kanban View** — My Tasks page shows tasks grouped by status in a Kanban layout

## 🛠 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, Vite     |
| Backend    | Node.js, Express 4                  |
| Database   | PostgreSQL                          |
| Auth       | JWT (jsonwebtoken), bcryptjs        |
| Deployment | Railway                             |

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/       # DB connection & schema init
│   │   ├── controllers/  # Business logic (auth, projects, tasks)
│   │   ├── middleware/   # JWT auth middleware
│   │   └── routes/       # API route definitions
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/   # React components (auth, dashboard, projects, tasks)
    │   ├── context/      # Auth context (global user state)
    │   └── utils/        # Axios instance with JWT interceptor
    ├── .env.example
    └── package.json
```

## 🔌 API Endpoints

### Auth
| Method | Endpoint         | Description      | Auth Required |
|--------|------------------|------------------|---------------|
| POST   | /api/auth/signup | Register user    | ❌            |
| POST   | /api/auth/login  | Login user       | ❌            |
| GET    | /api/auth/me     | Get current user | ✅            |

### Projects
| Method | Endpoint                          | Description           | Role  |
|--------|-----------------------------------|-----------------------|-------|
| GET    | /api/projects                     | Get my projects       | Any   |
| POST   | /api/projects                     | Create project        | Any   |
| GET    | /api/projects/:id                 | Get project details   | Any   |
| DELETE | /api/projects/:id                 | Delete project        | Admin |
| GET    | /api/projects/:id/members         | Get members           | Any   |
| POST   | /api/projects/:id/members         | Add member            | Admin |
| DELETE | /api/projects/:id/members/:userId | Remove member         | Admin |

### Tasks
| Method | Endpoint                            | Description         | Role         |
|--------|-------------------------------------|---------------------|--------------|
| GET    | /api/tasks/my                       | My assigned tasks   | Any          |
| GET    | /api/tasks/dashboard                | Dashboard stats     | Any          |
| GET    | /api/tasks/projects/:id             | Project tasks       | Any          |
| POST   | /api/tasks/projects/:id             | Create task         | Admin        |
| PUT    | /api/tasks/projects/:id/:taskId     | Update task         | Admin/Member |
| DELETE | /api/tasks/projects/:id/:taskId     | Delete task         | Admin        |

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DB credentials and JWT secret
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

App runs at: `http://localhost:5173`

## 🚀 Railway Deployment

### 1. Push code to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

### 2. Create Railway project
- Go to [railway.app](https://railway.app) → New Project → Empty Project
- Add a **PostgreSQL** database service first

### 3. Deploy Backend
- Add Service → GitHub Repo → select your repo
- Settings → Root Directory → set to `backend`
- Add these environment variables:

```
DATABASE_URL   = <auto-copied from PostgreSQL service>
JWT_SECRET     = <any long random string>
NODE_ENV       = production
PORT           = 5000
FRONTEND_URL   = <your frontend Railway URL>
```

- Settings → Networking → Generate Domain → copy the backend URL

### 4. Deploy Frontend
- Add Service → GitHub Repo → same repo
- Settings → Root Directory → set to `frontend`
- Add environment variable:

```
VITE_API_URL = https://<your-backend-url>.up.railway.app/api
```

- Settings → Networking → Generate Domain

> ⚠️ After setting `VITE_*` variables, always **Redeploy** the frontend — Vite bakes env vars at build time.

## 🗄️ Database Schema

Schema is **auto-initialized** on first server start — no manual migrations needed.

```sql
users           → id, name, email, password, created_at
projects        → id, name, description, created_by, created_at
project_members → project_id, user_id, role (admin|member), joined_at
tasks           → id, title, description, project_id, assigned_to,
                  created_by, status, priority, due_date, created_at, updated_at
```

## 🔐 Role Permissions

| Action                       | Admin | Member          |
|------------------------------|-------|-----------------|
| Create project               | ✅    | ✅              |
| Add / remove members         | ✅    | ❌              |
| Create tasks                 | ✅    | ❌              |
| Update any task field        | ✅    | ❌              |
| Update own assigned task status | ✅ | ✅              |
| Delete tasks / projects      | ✅    | ❌              |


