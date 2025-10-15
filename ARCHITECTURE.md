# Smart Task Planner - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                   (Browser - HTML/CSS/JS)                       │
└────────────────┬──────────────────────────┬────────────────────┘
                 │                           │
                 │ HTTP Requests             │ WebSocket (future)
                 ▼                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FLASK BACKEND                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Routes     │  │   Business   │  │   Database   │         │
│  │   Layer      │─→│   Logic      │─→│   Layer      │         │
│  └──────────────┘  └──────┬───────┘  └──────────────┘         │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             │ API Calls
                             ▼
                    ┌─────────────────┐
                    │   GEMINI AI     │
                    │   (Google)      │
                    └─────────────────┘
                             │
                             │ Structured JSON
                             ▼
                    ┌─────────────────┐
                    │  Task Plan      │
                    │  - Tasks        │
                    │  - Timeline     │
                    │  - Risks        │
                    │  - Metrics      │
                    └─────────────────┘
```

## Request Flow

```
User Action                Flask Backend              Gemini AI
────────────               ─────────────              ─────────

1. Enter Goal
   │
   ├──► POST /api/plan
   │                         │
   │                         ├──► Validate Input
   │                         │
   │                         ├──► Build Prompt
   │                         │
   │                         ├──────────► Generate Content
   │                         │                   │
   │                         │                   ├─► Analyze Goal
   │                         │                   │
   │                         │                   ├─► Break Down Tasks
   │                         │                   │
   │                         │                   ├─► Calculate Timeline
   │                         │                   │
   │                         │                   └─► Assess Risks
   │                         │                           │
   │                         │◄──────────────────────────┘
   │                         │
   │                         ├──► Parse JSON
   │                         │
   │                         ├──► Save to DB
   │                         │
   │◄────────────────────────┘
   │
2. Display Results
```

## Data Flow

```
Input                Processing              Output
─────                ──────────              ──────

Goal Text   ─────►   Prompt Engineering
  +                        │
Deadline                   ▼
                    Gemini AI Model
                           │
                           ▼
                    Structured Response
                           │
                           ▼
                    JSON Parsing
                           │
                           ▼
                    ┌──────────────────┐
                    │  Task Breakdown  │
                    │  ┌────────────┐  │
                    │  │ Analysis   │  │
                    │  ├────────────┤  │
                    │  │ Tasks      │  │
                    │  ├────────────┤  │
                    │  │ Timeline   │  │
                    │  ├────────────┤  │
                    │  │ Risks      │  │
                    │  ├────────────┤  │
                    │  │ Metrics    │  │
                    │  └────────────┘  │
                    └──────────────────┘
                           │
                           ▼
                    Database Storage
                           │
                           ▼
                    Frontend Display
```

## Database Schema

```sql
┌─────────────────────────────────┐
│           goals                 │
├─────────────────────────────────┤
│ id (PK)          INTEGER        │
│ goal_text        TEXT           │
│ created_at       TIMESTAMP      │
│ deadline         TEXT           │
│ status           TEXT           │
└────────────┬────────────────────┘
             │
             │ 1:N
             │
┌────────────▼────────────────────┐
│           tasks                 │
├─────────────────────────────────┤
│ id (PK)          INTEGER        │
│ goal_id (FK)     INTEGER        │
│ task_name        TEXT           │
│ description      TEXT           │
│ estimated_hours  INTEGER        │
│ deadline         TEXT           │
│ priority         TEXT           │
│ dependencies     TEXT (JSON)    │
│ status           TEXT           │
│ created_at       TIMESTAMP      │
└─────────────────────────────────┘
```

## Component Interaction

```
Frontend Components
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  ┌──────────────┐      ┌──────────────┐                  │
│  │ Goal Input   │      │ Example      │                  │
│  │ Component    │      │ Modal        │                  │
│  └──────┬───────┘      └──────────────┘                  │
│         │                                                  │
│         ▼                                                  │
│  ┌──────────────────────────────────────┐                │
│  │     API Request Handler              │                │
│  └──────────────┬───────────────────────┘                │
│                 │                                          │
│                 ▼                                          │
│  ┌──────────────────────────────────────┐                │
│  │     Results Display                  │                │
│  │  ┌────────────┐  ┌────────────┐     │                │
│  │  │ Timeline   │  │ Kanban     │     │                │
│  │  │ View       │  │ View       │     │                │
│  │  └────────────┘  └────────────┘     │                │
│  │  ┌────────────┐  ┌────────────┐     │                │
│  │  │ Export     │  │ Print      │     │                │
│  │  │ Options    │  │ Function   │     │                │
│  │  └────────────┘  └────────────┘     │                │
│  └──────────────────────────────────────┘                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## AI Prompt Structure

```
┌─────────────────────────────────────────────────────────┐
│                   PROMPT CONSTRUCTION                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Role Definition                                     │
│     "You are an expert project manager..."             │
│                                                         │
│  2. Context Injection                                   │
│     - User's goal                                       │
│     - Deadline (if provided)                            │
│                                                         │
│  3. Task Instructions                                   │
│     - Break down into tasks                             │
│     - Assign priorities                                 │
│     - Estimate time                                     │
│     - Identify dependencies                             │
│     - Calculate timeline                                │
│     - Assess risks                                      │
│                                                         │
│  4. Output Format Specification                         │
│     - JSON structure                                    │
│     - Required fields                                   │
│     - Data types                                        │
│                                                         │
│  5. Quality Guidelines                                  │
│     - Be specific                                       │
│     - Be actionable                                     │
│     - Be realistic                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │   Gemini API    │
                 └─────────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Structured JSON │
                 └─────────────────┘
```

## Error Handling Flow

```
Request ──► Validation ──► Processing ──► Response
   │            │              │
   │            ▼              ▼
   │         [Error]        [Error]
   │            │              │
   │            └──────┬───────┘
   │                   │
   │                   ▼
   │            Error Handler
   │                   │
   │                   ├──► Log Error
   │                   │
   │                   ├──► Format Error Message
   │                   │
   │                   └──► Return Error Response
   │                              │
   └──────────────────────────────┘
              │
              ▼
        User sees friendly error message
```

## View Switching Logic

```
Timeline View                    Kanban View
─────────────                    ───────────

┌──────────────┐                ┌────────┬────────┬────────┐
│ Task 1       │                │  High  │ Medium │  Low   │
│ ├─ Priority  │                ├────────┼────────┼────────┤
│ ├─ Time      │                │ Task 1 │ Task 3 │ Task 5 │
│ └─ Deadline  │                │ Task 2 │ Task 4 │ Task 6 │
├──────────────┤                └────────┴────────┴────────┘
│ Task 2       │
│ ├─ Priority  │          Toggle Button Click
│ ├─ Time      │                    │
│ └─ Deadline  │                    ▼
├──────────────┤         ┌────────────────────┐
│ Task 3       │         │  Re-render Logic   │
│ ├─ Priority  │         │  - Clear container │
│ ├─ Time      │         │  - Group by        │
│ └─ Deadline  │         │    priority        │
└──────────────┘         │  - Render new view │
                         └────────────────────┘
```

## Export Flow

```
Current Plan (In Memory)
          │
          ├──► JSON Export
          │         │
          │         ├──► Stringify Object
          │         │
          │         ├──► Create Blob
          │         │
          │         └──► Download File
          │
          ├──► CSV Export
          │         │
          │         ├──► Extract Tasks
          │         │
          │         ├──► Format as CSV
          │         │
          │         ├──► Create Blob
          │         │
          │         └──► Download File
          │
          └──► Print
                    │
                    ├──► Apply Print CSS
                    │
                    └──► window.print()
```

## State Management

```
Application State
┌────────────────────────────────────┐
│  currentPlan: null | PlanObject   │
│  currentView: 'timeline' | 'kanban'│
│  isLoading: boolean                │
│  error: string | null              │
└────────────────────────────────────┘
           │
           ├──► User Action
           │         │
           │         ▼
           │    Update State
           │         │
           │         ▼
           │    Re-render UI
           │         │
           │         ▼
           └──► Reflect Changes
```

## Performance Optimization

```
Request ──► Cache Check ──┬──► Cache Hit ──► Return Cached
              │            │
              │            └──► Cache Miss
              │                     │
              ▼                     │
          Rate Limiting             │
              │                     │
              ▼                     │
          API Call ◄────────────────┘
              │
              ▼
          Response
              │
              ├──► Update Cache
              │
              └──► Return to User
```

## Security Layers

```
┌─────────────────────────────────────────┐
│         Security Measures               │
├─────────────────────────────────────────┤
│                                         │
│  1. Environment Variables               │
│     └─► API Keys in .env (not in code) │
│                                         │
│  2. Input Validation                    │
│     └─► Sanitize user input            │
│                                         │
│  3. CORS Configuration                  │
│     └─► Control access origins         │
│                                         │
│  4. Error Handling                      │
│     └─► Don't expose sensitive info    │
│                                         │
│  5. Rate Limiting (future)              │
│     └─► Prevent API abuse              │
│                                         │
└─────────────────────────────────────────┘
```

## Deployment Architecture

```
Developer Machine                    Production Server
─────────────────                    ─────────────────

┌──────────────┐                    ┌──────────────┐
│  Local Dev   │                    │   Gunicorn   │
│  Flask       │                    │   Server     │
│  port 5000   │                    │   port 80    │
└──────────────┘                    └──────┬───────┘
                                           │
        Git Push                           │
           │                               │
           ▼                               │
    ┌──────────────┐                      │
    │   GitHub     │                      │
    │   Repository │                      │
    └──────┬───────┘                      │
           │                               │
           │ Auto Deploy                   │
           │                               │
           ▼                               │
    ┌──────────────┐                      │
    │   Platform   │──────────────────────┘
    │ (Heroku/     │
    │  Railway)    │
    └──────────────┘
```

---

This visual guide helps understand:
- System architecture
- Data flow
- Component interactions
- Error handling
- Security measures
- Deployment process
