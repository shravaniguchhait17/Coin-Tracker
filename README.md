# Coin Quest

A pixel-styled expense tracker. Log rent, groceries, travel, food, and misc
spending by month, see it charted over time, and get AI-generated suggestions
on where to cut back — grounded in your actual numbers, not generic advice.

## Features

- **Google sign-in** — no separate account system, OAuth2 via Spring Security
- **Monthly category entries** — rent, groceries, travel, eating out, misc
- **Running average** — a plain average across every month you've tracked
- **Savings / overspend indicator** — how far under or over average you landed
- **Month-over-month trend chart** — Chart.js line chart of total spend
- **AI Advisor** — a chat panel that gives budgeting suggestions based on your
  saved expense history, powered by Groq's free API

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), react-router-dom, Chart.js |
| Backend | Spring Boot, Spring Security (OAuth2 + CSRF), Spring Data JPA |
| Database | PostgreSQL |
| AI | Groq API (OpenAI-compatible chat completions) |
| Auth | Google OAuth2 login |

## Project structure

```
.
├── frontend/                  # React app (Vite)
│   └── src/
│       ├── pages/             # Homepage, Dashboard
│       ├── components/        # PixelCoin, AdvisorChat, ConfirmModal
│       ├── context/           # AuthContext
│       └── api/               # client.js — fetch wrapper, CSRF handling
└── src/main/java/com/example/demo/
    ├── expense/                # ExpenseEntry, repository, controller, DTOs
    ├── advisor/                 # AI chat: service, controller, request/response shapes
    ├── SecurityConfig.java
    └── UserController.java      # GET /api/me
```

## Prerequisites

- **Java 17+** and Maven
- **Node.js** and npm
- **PostgreSQL**, running locally (or reachable) with a database named `coinquest`
- A **Google OAuth2 client ID/secret** ([console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials)
- A **Groq API key** ([console.groq.com](https://console.groq.com) — free, no card required)

## Setup

### 1. Database

```sql
CREATE DATABASE coinquest;
```

Tables are created automatically on first run (`spring.jpa.hibernate.ddl-auto=update`) — no manual schema needed.

### 2. Backend

In `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/coinquest
spring.datasource.username=postgres
spring.datasource.password=<your postgres password>

spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}

groq.api.key=${GROQ_API_KEY}
```

Set the environment variables referenced above (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GROQ_API_KEY`) — never commit real credentials into `application.properties` directly.

Run it:

```bash
mvn spring-boot:run
```

Backend runs on **`:7000`**.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **`:5173`**, and proxies `/api`, `/oauth2`, `/login`, `/logout` to the backend — this is what lets the session cookie work across both without CORS configuration in dev.

Open `http://localhost:5173`.

## API overview

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/me` | GET | Public | Current user's name/email/picture, or 401 if signed out |
| `/api/expenses` | GET | Required | All saved months for the signed-in user |
| `/api/expenses/{month}` | PUT | Required | Upsert one month's category amounts (`YYYY-MM`) |
| `/api/advisor/chat` | POST | Required | Send a message; returns the AI advisor's reply |

## Notes

- The AI Advisor's model name (`AdvisorService.java`) may need updating over time — Groq's free-tier model catalog changes fairly often. If it starts failing with a "model not found" error, check what's currently available with:
  ```bash
  curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"
  ```
- `ddl-auto=update` is fine for development; a real migration tool (Flyway) is recommended before this holds any real data.
