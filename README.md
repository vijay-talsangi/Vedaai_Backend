# VedaAI - AI-Powered Assessment Creator

<div align="center">

![VedaAI Logo](https://img.shields.io/badge/VedaAI-Assessment_Creator-E8730C?style=for-the-badge&logo=sparkles&logoColor=white)

**Transform your teaching workflow with AI-generated assessments**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-green?style=flat-square&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.x-red?style=flat-square&logo=redis)](https://redis.io/)

</div>

---

## 📋 Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Queue Workflow](#queue-workflow)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 15)                 │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────┐  │
│  │ Zustand  │  │ React    │  │Socket.io│  │Framer Motion │  │
│  │ Store    │  │Hook Form │  │ Client  │  │ Animations   │  │
│  └─────────┘  └──────────┘  └─────────┘  └──────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼───────────────────────────────────────┐
│                     Backend (Express)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │
│  │ REST API │  │Socket.io │  │  BullMQ  │  │   Gemini AI  │  │
│  │ Routes   │  │ Server   │  │  Queue   │  │   Service    │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │
│  ┌──────────┐  ┌──────────┐                                  │
│  │ MongoDB  │  │  Redis   │                                  │
│  │(Mongoose)│  │ (ioredis)│                                  │
│  └──────────┘  └──────────┘                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

- **AI-Powered Assessment Generation** — Automatically generate structured question papers using Google Gemini 2.0 Flash
- **Real-time Updates** — Live progress tracking via Socket.io during paper generation
- **Professional Output** — Beautiful exam paper layout matching real assessment formats
- **Multi-step Form** — Intuitive assignment creation with validation
- **Question Type Support** — MCQ, Short Answer, Long Answer, Diagram-Based, Numerical, True/False, Fill in Blanks, Match the Following
- **Assignment Management** — View, search, filter, and delete assignments
- **PDF Export** — Download generated papers as PDF
- **Responsive Design** — Pixel-perfect mobile and desktop experience
- **Queue-based Processing** — Reliable background job processing with BullMQ
- **Dark Mode Ready** — Structured for easy dark mode implementation

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 15 | React framework (App Router) |
| TypeScript | Type safety |
| TailwindCSS | Utility-first styling |
| Zustand | State management |
| React Hook Form | Form handling |
| Zod | Schema validation |
| Socket.io Client | Real-time communication |
| Framer Motion | Animations |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|-----------|---------|
| Express | HTTP server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database |
| Redis + ioredis | Caching & queue broker |
| BullMQ | Job queue |
| Socket.io | WebSocket server |
| Google Generative AI | Gemini API integration |
| Zod | Validation |
| Multer | File uploads |

---

## 📁 Folder Structure

```
vedaai/
├── package.json              # Root monorepo scripts
├── README.md
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts           # Entry point
│       ├── config/
│       │   ├── database.ts    # MongoDB connection
│       │   ├── redis.ts       # Redis connection
│       │   └── env.ts         # Environment validation
│       ├── models/
│       │   └── Assignment.ts  # Mongoose schema
│       ├── routes/
│       │   └── assignment.routes.ts
│       ├── controllers/
│       │   └── assignment.controller.ts
│       ├── services/
│       │   ├── assignment.service.ts
│       │   ├── gemini.service.ts
│       │   └── parser.service.ts
│       ├── queues/
│       │   └── assessment.queue.ts
│       ├── workers/
│       │   └── assessment.worker.ts
│       ├── sockets/
│       │   └── socket.ts
│       ├── middleware/
│       │   └── errorHandler.ts
│       ├── utils/
│       │   ├── promptBuilder.ts
│       │   └── logger.ts
│       └── types/
│           └── index.ts
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── tailwind.config.ts
    ├── next.config.ts
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx
        │   ├── globals.css
        │   └── assignments/
        │       ├── page.tsx
        │       ├── create/
        │       │   └── page.tsx
        │       └── [id]/
        │           └── page.tsx
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.tsx
        │   │   ├── TopBar.tsx
        │   │   ├── MobileNav.tsx
        │   │   └── AppShell.tsx
        │   ├── ui/
        │   │   ├── Button.tsx
        │   │   ├── Input.tsx
        │   │   ├── Select.tsx
        │   │   ├── DatePicker.tsx
        │   │   ├── FileUpload.tsx
        │   │   ├── Counter.tsx
        │   │   ├── Badge.tsx
        │   │   ├── Skeleton.tsx
        │   │   ├── ProgressBar.tsx
        │   │   └── EmptyState.tsx
        │   └── assignment/
        │       ├── AssignmentForm.tsx
        │       ├── QuestionTypeRow.tsx
        │       ├── AssignmentCard.tsx
        │       ├── PaperOutput.tsx
        │       └── GenerationStatus.tsx
        ├── store/
        │   └── useAssignmentStore.ts
        ├── hooks/
        │   └── useSocket.ts
        ├── lib/
        │   ├── api.ts
        │   ├── socket.ts
        │   ├── validators.ts
        │   └── utils.ts
        └── types/
            └── index.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **MongoDB** running locally or MongoDB Atlas URI
- **Redis** running locally or Upstash Redis URL
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/vedaai.git
cd vedaai

# Install all dependencies
npm run install:all

# Or install individually
cd backend && npm install
cd ../frontend && npm install
```

### Running in Development

```bash
# From the root directory - starts both frontend and backend
npm run dev

# Or run individually
npm run dev:backend    # Express on http://localhost:5000
npm run dev:frontend   # Next.js on http://localhost:3000
```

---

## ⚙️ Environment Setup

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 🔄 Queue Workflow

```
1. User submits assignment form
        │
2. Frontend sends POST /api/assignments
        │
3. Backend creates assignment in MongoDB (status: "pending")
        │
4. Job added to BullMQ "assessment-generation" queue
        │
5. Worker picks up job
   ├── Emits "generation_started" via Socket.io
   ├── Builds structured prompt from assignment data
   ├── Calls Gemini 2.0 Flash API
   ├── Emits "generation_progress" (50%)
   ├── Parses AI response into structured JSON
   ├── Validates JSON structure with Zod
   ├── Saves structured result to MongoDB
   └── Emits "generation_completed" via Socket.io
        │
6. Frontend receives WebSocket update
   └── Navigates to output page with generated paper
```

---

## 📡 API Reference

### Assignments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/assignments` | Create a new assignment & trigger generation |
| `GET` | `/api/assignments` | List all assignments (paginated) |
| `GET` | `/api/assignments/:id` | Get a single assignment |
| `DELETE` | `/api/assignments/:id` | Delete an assignment |

### WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_assignment` | Client → Server | `{ assignmentId: string }` |
| `generation_started` | Server → Client | `{ assignmentId: string }` |
| `generation_progress` | Server → Client | `{ assignmentId: string, progress: number }` |
| `generation_completed` | Server → Client | `{ assignmentId: string }` |
| `generation_failed` | Server → Client | `{ assignmentId: string, error: string }` |

---

## 🚢 Deployment

### Frontend → Vercel

1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Add environment variables in Vercel dashboard
4. Deploy

### Backend → Render / Railway

1. Connect your GitHub repository
2. Set root directory to `backend`
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables

### Database → MongoDB Atlas

1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get connection string
3. Add to `MONGODB_URI` environment variable

### Redis → Upstash

1. Create a free Redis database at [upstash.com](https://upstash.com)
2. Get connection URL
3. Add to `REDIS_URL` environment variable

---

## 📸 Screenshots

<!-- Screenshots will be added after deployment -->

| View | Description |
|------|-------------|
| Home | Dashboard with quick actions |
| Assignments | Grid view of all assignments |
| Create | Multi-step assignment creation form |
| Output | Generated question paper view |
| Mobile | Responsive mobile layout |

---