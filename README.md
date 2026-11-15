# To-Do List Mobile App (Full-Stack Next.js + PostgreSQL)

A responsive, mobile-first To-Do List application built with **Next.js 16 (App Router)**, **Tailwind CSS**, **PostgreSQL 18** via Docker, and **Prisma 8**.

The app organizes tasks into calendar weeks (**Monday through Sunday**), displays weekly progress summary cards, and provides modals for creating, editing (with start and end times), deleting, and searching tasks based on the Figma design.

---

## Tech Stack

- **Framework:** Next.js 16 (React 19, TypeScript)
- **Styling:** Tailwind CSS (Sharp corners, mobile-first container)
- **Database:** PostgreSQL 18 (Local Docker container or hosted DB)
- **ORM / Migrations:** Prisma 8 with Contract System (`@prisma/orm-postgres`)

---

## Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) (v18.18+ or v20+)
- [npm](https://www.npmjs.com/) (v9+)
- [Docker & Docker Compose](https://www.docker.com/) *(optional if using an external PostgreSQL instance)*

---

## Quick Start Setup

### 1. Clone the Repository

```bash
git clone https://github.com/darshan1301/digiaccel.git
cd digiaccel
```

*(If cloning into a folder containing `my-app`, navigate to `cd my-app`)*

```bash
npm install
```

---

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and set your `DATABASE_URL`:

#### Option A: Local Docker PostgreSQL (Recommended)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/digiaccel"
```

#### Option B: Optional External Hosted PostgreSQL
You can point to any cloud-hosted PostgreSQL instance (Neon, Supabase, Render, AWS RDS, etc.):
```env
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<dbname>?sslmode=require"
```

---

### 3. Spin up PostgreSQL with Docker (Option A)

If using Docker, start the container using the included compose file:

```bash
docker compose -f docker/docker-compose.yaml up -d
```

> **Container Details:**
> - **Image:** `postgres:18`
> - **Host Port:** `5433` (mapped from container `5432` to avoid local conflicts)
> - **Default Credentials:** User: `postgres`, Password: `postgres`, DB: `digiaccel`
> - **Persistence:** Managed Docker volume `pgdata`

To verify the database is up and accepting connections:
```bash
docker exec digiaccel-postgres pg_isready -U postgres
```

---

### 4. Initialize Database Schema

Emit the Prisma 8 contract and initialize the database tables:

```bash
npx prisma contract emit
npx prisma db init --db "postgresql://postgres:postgres@localhost:5433/digiaccel"
```

*(If using an external database, replace the `--db` URL with your external connection string).*

---

### 5. Seed Initial Data

Populate the database with sample tasks matching the Figma design:

```bash
npm run seed
```

This inserts 10 sample tasks with scheduled dates, start & end times, priorities, and statuses across current and adjacent weeks.

---

### 6. Run the Application

Start the Next.js development server:

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

To run a production build:
```bash
npm run build
npm start
```

---

## Features

- **Onboarding Welcome Screen:** Hero graphic with zig-zag wave illustrations and a full-width **"Get Started"** button.
- **Monday–Sunday Calendar Strip:** Interactive horizontal week selector highlighting the active day.
- **Weekly Summary Cards:**
  - **Task Complete:** Count of completed tasks for the selected week.
  - **Task Pending:** Count of open/in-progress tasks for the selected week.
  - **Weekly Progress:** Dynamic percentage progress bar.
- **Modal Windows:**
  - **Add New Task / Edit Task:** Modal window with 5 dedicated fields:
    1. *Task Title* (mandatory)
    2. *Set Time* (side-by-side Start & Ends time pickers)
    3. *Set Date* (calendar picker)
    4. *Description* (textarea)
    5. *Priority* (Low, Medium, High pills)
  - **Delete Confirmation:** Confirmation modal with task title and destructive delete action.
- **Instant Search:** Real-time keyword filter across task titles and descriptions.
- **Status Toggling:** Crisp square checkbox to toggle between `"In Progress"` and `"Completed"` (updates weekly cards instantly).

---

## REST API Reference

| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/tasks` | List all tasks | `?q=keyword` (optional search) |
| `POST` | `/api/tasks` | Create a new task | `{ title, date, startTime, endTime, priority, description }` |
| `GET` | `/api/tasks/:id` | Get task by ID | — |
| `PUT` | `/api/tasks/:id` | Update task fields | `{ title, date, startTime, endTime, priority, description, status }` |
| `PATCH` | `/api/tasks/:id/status` | Update task status | `{ status: "Completed" \| "In Progress" }` |
| `DELETE` | `/api/tasks/:id` | Delete task by ID | — |
| `GET` | `/api/tasks/weekly-summary` | Summary cards count | Grouped Monday through Sunday |
| `GET` | `/api/tasks/weekly` | Tasks for specific week | `?start=YYYY-MM-DD` (defaults to current week) |

---

## Useful Docker Commands

```bash
# View container logs
docker logs digiaccel-postgres --tail 50

# Stop container
docker compose -f docker/docker-compose.yaml down

# Stop and wipe database volume (fresh start)
docker compose -f docker/docker-compose.yaml down -v
```
