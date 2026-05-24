# TaskFlow – Team Task Manager

A full-stack team task management application built with React, Node.js/Express, and PostgreSQL.

## Features

- **Auth**: JWT-based signup/login with protected routes
- **Projects**: Create projects, invite members via email, role-based access (Admin/Member)
- **Tasks**: Create, assign, filter, and update tasks with priority levels and due dates
- **Dashboard**: Real-time stats — total tasks, tasks by status, per-user breakdown, overdue count
- **Role-Based Access**: Admins manage everything; Members can only update status of assigned tasks
- **Kanban View**: My Tasks page shows tasks grouped by status in a Kanban layout

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, React Router v6, Vite   |
| Backend    | Node.js, Express 4                |
| Database   | PostgreSQL                        |
| Auth       | JWT (jsonwebtoken), bcryptjs      |
| Deployment | Railway                           |

## Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/       # DB connection & schema init
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # JWT auth
│   │   └── routes/       # API routes
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/   # React components
    │   ├── context/      # Auth context
    │   └── utils/        # Axios instance
    ├── .env.example
    └── package.json
```

## API Endpoints

### Auth
| Method | Endpoint          | Description     |
|--------|-------------------|-----------------|
| POST   | /api/auth/signup  | Register user   |
| POST   | /api/auth/login   | Login user      |
| GET    | /api/auth/me      | Get current user|

### Projects
| Method | Endpoint                              | Description          |
|--------|---------------------------------------|----------------------|
| GET    | /api/projects                         | Get my projects      |
| POST   | /api/projects                         | Create project       |
| GET    | /api/projects/:id                     | Get project details  |
| DELETE | /api/projects/:id                     | Delete project (admin)|
| GET    | /api/projects/:id/members             | Get members          |
| POST   | /api/projects/:id/members             | Add member (admin)   |
| DELETE | /api/projects/:id/members/:userId     | Remove member (admin)|

### Tasks
| Method | Endpoint                                  | Description           |
|--------|-------------------------------------------|-----------------------|
| GET    | /api/tasks/my                             | My assigned tasks     |
| GET    | /api/tasks/dashboard                      | Dashboard stats       |
| GET    | /api/tasks/projects/:id                   | Project tasks (filter)|
| POST   | /api/tasks/projects/:id                   | Create task (admin)   |
| PUT    | /api/tasks/projects/:id/:taskId           | Update task           |
| DELETE | /api/tasks/projects/:id/:taskId           | Delete task (admin)   |

## Local Setup

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

## Railway Deployment

### 1. Create two Railway services from your GitHub repo

Deploy both `backend/` and `frontend/` as separate services.

### 2. Backend Environment Variables (Railway Dashboard)

```
DATABASE_URL=<Railway PostgreSQL URL>
JWT_SECRET=<a long random string>
NODE_ENV=production
FRONTEND_URL=<your frontend Railway URL>
PORT=5000
```

### 3. Add PostgreSQL

In your Railway project, click **+ New** → **Database** → **PostgreSQL**.  
The `DATABASE_URL` will be auto-injected.

### 4. Frontend Environment Variables

```
VITE_API_URL=https://<your-backend-railway-url>/api
```

> ⚠️ Rebuild the frontend after setting env vars (Railway does this automatically on deploy).

### 5. Root Directory Config

In Railway service settings, set the **Root Directory** to:
- `backend` for the backend service
- `frontend` for the frontend service

## Database Schema

The schema is **auto-initialized** on first server start — no manual migrations needed.

```sql
users         → id, name, email, password, created_at
projects      → id, name, description, created_by, created_at
project_members → project_id, user_id, role (admin|member)
tasks         → id, title, description, project_id, assigned_to, 
                created_by, status, priority, due_date, created_at
```

## Role Permissions

| Action                  | Admin | Member         |
|-------------------------|-------|----------------|
| Create project          | ✅    | ✅             |
| Add/remove members      | ✅    | ❌             |
| Create tasks            | ✅    | ❌             |
| Update any task field   | ✅    | ❌             |
| Update assigned task status | ✅ | ✅ (own tasks) |
| Delete tasks/projects   | ✅    | ❌             |

## Demo Video Outline (2-5 min)

1. Show the live URL and signup flow
2. Create a project → becomes admin automatically
3. Add a team member via email
4. Create tasks with different priorities and due dates
5. Show the member's view (limited permissions)
6. Show the dashboard stats
7. Show My Tasks kanban view
