# ChronoSec (CyberShield AI)

🛡️ **ChronoSec** is an AI-powered cybersecurity operations and threat intelligence platform designed for real-time investigation, incident triage, and proactive security monitoring.

---

## 🚀 Features

- **Real-Time Threat Detection & Triage**: Monitor, filter, and track security threats categorized by severity and status.
- **Interactive Security Dashboard**: Visual overview of system health, active threats, security logs, and scan statistics.
- **Incident Investigation & Audit Logs**: Comprehensive logging system tracking user actions, authentication attempts, threat resolutions, and scan events.
- **System Threat Scanner**: Trigger and observe automated vulnerability & threat scans across system assets.
- **Robust Authentication & Access Control**:
  - JWT authentication with refresh token rotation.
  - Role-based access control (Admin & User roles).
  - Two-factor authentication (OTP verification).
- **Full Docker Support**: Multi-container Docker Compose configuration with PostgreSQL, Express backend, and Next.js frontend.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19 / TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State & Utilities**: Lucide Icons, Sonner notifications

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) with TypeScript
- **Database & ORM**: PostgreSQL & [Prisma ORM](https://www.prisma.io/)
- **Security**: Helmet, Express Rate Limiter, CORS, bcryptjs, JSON Web Tokens (JWT)

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15 Alpine

---

## 📂 Project Structure

```
chronosec/
├── backend/                  # Express + TypeScript API server
│   ├── prisma/               # Prisma database schema & migrations
│   ├── src/
│   │   ├── controllers/      # Route controllers (auth, dashboard, threats, users)
│   │   ├── middleware/       # Auth guards & error handling
│   │   ├── routes/           # Express API endpoints
│   │   └── server.ts         # Backend entry point
│   └── Dockerfile
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # UI & Dashboard components
│   │   └── context/          # Client-side state contexts
│   └── Dockerfile
├── docker-compose.yml        # Multi-container orchestration
├── package.json              # Monorepo workspace configuration
├── .env.example              # Environment variables template
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) & Docker Compose (optional, for containerized run)
- [PostgreSQL](https://www.postgresql.org/) (if running locally without Docker)

---

### Option 1: Running with Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/suryakrishnan-A/Chronosec.git
   cd Chronosec
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Start services:**
   ```bash
   npm run docker:up
   ```
   * Frontend: http://localhost:3000
   * Backend API: http://localhost:3001
   * Health Check: http://localhost:3001/health

---

### Option 2: Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   - Copy `.env.example` to `.env` in the root and in `backend/` and `frontend/`.
   - Ensure `DATABASE_URL` points to your PostgreSQL instance.

3. **Run database migrations (Prisma):**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   cd ..
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

---

## 📜 License

This project is licensed under the MIT License.
