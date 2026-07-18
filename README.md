# 🏋️ Buildthenics Backend — Elite Calisthenics & AI Coaching Platform API

> **Buildthenics** is a full-stack calisthenics training platform. This repository contains the **Backend REST API** of the application.

---

## ✨ Features (Backend)
- **Program Management**: REST API endpoints for fetching, searching, and managing training programs.
- **AI Integration**: Integration with Groq API (Llama 3.3 70B) for real-time coaching and smart recommendations.
- **Authentication Bridge**: JWT verification for secure protected routes.
- **Athlete Profiles**: Profile data management for the recommendation engine.

## 🛠️ Tech Stack
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type safety across the entire backend |
| **MongoDB** (native driver) | Primary database via MongoDB Atlas |
| **Groq SDK** | LLM inference (Llama 3.3 70B via Groq API) |
| **jsonwebtoken** | JWT verification for the auth middleware |

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **npm** v9+
- A **MongoDB Atlas** cluster
- A **Groq API key**

### Setup

```bash
git clone https://github.com/push-shihab/buildthenics-backend.git
cd buildthenics-backend
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?appName=<AppName>
GROQ_API_KEY=gsk_your_groq_api_key_here
BETTER_AUTH_SECRET=your_32_char_secret_here
FRONTEND_URL=http://localhost:3000
```

Start the backend dev server:
```bash
npm run dev
```

---

**Frontend Repository:** [https://github.com/push-shihab/buildthenics-frontend](https://github.com/push-shihab/buildthenics-frontend)
