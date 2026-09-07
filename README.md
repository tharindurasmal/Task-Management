# Task Management

## 1. Overview

Users can register, get approved by an admin, create and claim tasks, and drag tasks between To Do / In Progress / Done columns. Admins get a dashboard to approve new users, reassign tasks to any user, and delete tasks.

## 2. Tech Stack

**Backend**
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT authentication, bcrypt password hashing

**Frontend**
- React (Vite)
- React Router
- @hello-pangea/dnd (drag-and-drop board)
- Axios

**Hosting**
- Backend: Render
- Frontend: Vercel
- Database: MongoDB Atlas

## 3. Setup Instructions

### Clone the repo
```bash
git clone https://github.com/tharindurasmal/Task-Management.git
cd task-management
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 4. Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `connectionString` | MongoDB Atlas connection URI | `mongodb+srv://user:pass@cluster0.mongodb.net/task_management` |
| `JWT_SECRET` | Random secret used to sign login tokens | a long random hex string |
| `JWT_EXPIRES_IN` | How long a login token stays valid | `1d` |
| `PORT` | Port the backend listens on | `5000` |
| `CLIENT_ORIGIN` | Frontend URL, for CORS | `http://localhost:5173` |
| `ADMIN_NAME` | Name for the seeded admin account | `Admin` |
| `ADMIN_EMAIL` | Email for the seeded admin account | `admin@lesstaxi.com` |
| `ADMIN_PASSWORD` | Password for the seeded admin account | a strong password |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

## 5. API Documentation

A Postman collection covering every endpoint (including the role-based access control checks) is included at `backend/postman_collection.json`. Import it into Postman, set the `baseUrl` collection variable to your backend URL, and run the "Full Flow" folder top to bottom.

### Endpoint summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new account (starts unapproved) |
| POST | `/api/auth/login` | Public | Log in; blocked with 403 if unapproved |
| GET | `/api/auth/me` | Logged in | Get your own profile |
| GET | `/api/tasks` | Logged in | List tasks (own/assigned/unassigned for users, all for admin) |
| POST | `/api/tasks` | Logged in | Create a task |
| PATCH | `/api/tasks/:id/status` | Logged in | Move a task between columns |
| PATCH | `/api/tasks/:id/assign` | Logged in | Self-assign (users) or reassign to anyone (admin) |
| DELETE | `/api/tasks/:id` | Admin only | Delete a task |
| GET | `/api/users` | Admin only | List all users |
| GET | `/api/users/pending` | Admin only | List users awaiting approval |
| PATCH | `/api/users/:id/approve` | Admin only | Approve a pending user |

### Key access-control rules

- A normal user can only assign an **unassigned** task to **themselves** — assigning to someone else, or reassigning an already-assigned task, returns `403`.
- An admin can assign or reassign any task to any user at any time.
- Only an admin can delete a task.
- New accounts cannot log in until an admin approves them from the Admin Dashboard.

## 6. Deployment

| | URL |
|---|---|
| Live frontend | _add your Vercel URL here_ |
| Live backend | _add your Render URL here_ |
| Backend health check | `<your-render-url>/api/health` |

Hosted on Render (backend) and Vercel (frontend), with MongoDB Atlas as the database. Render's free tier sleeps after inactivity, so the first request after idle may take 20–30 seconds to respond.
