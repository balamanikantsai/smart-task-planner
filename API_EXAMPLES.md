# API Testing Examples

This file contains example API requests for testing the Smart Task Planner.

## Health Check

```bash
curl http://localhost:5000/api/health
```

## Generate Task Plan - Example 1: Product Launch

```bash
curl -X POST http://localhost:5000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Launch a SaaS product with user authentication, payment integration, and analytics dashboard in 30 days",
    "deadline": "2025-11-15"
  }'
```

## Generate Task Plan - Example 2: Learning Goal

```bash
curl -X POST http://localhost:5000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Learn full-stack web development including React, Node.js, and MongoDB, and build 3 portfolio projects",
    "deadline": "2026-01-15"
  }'
```

## Generate Task Plan - Example 3: Event Planning

```bash
curl -X POST http://localhost:5000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Organize a tech conference for 200 attendees with 10 speakers and 3 workshop sessions",
    "deadline": "2025-12-15"
  }'
```

## Generate Task Plan - Example 4: Content Creation

```bash
curl -X POST http://localhost:5000/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Create a comprehensive video course on AI and Machine Learning with 50 lessons and practical projects"
  }'
```

## Get All Goals

```bash
curl http://localhost:5000/api/goals
```

## Get Tasks for Specific Goal

```bash
curl http://localhost:5000/api/goals/1/tasks
```

## Update Task Status

```bash
curl -X PUT http://localhost:5000/api/tasks/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

## Get Example Goals

```bash
curl http://localhost:5000/api/example
```

## PowerShell Examples (Windows)

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
```

### Generate Task Plan
```powershell
$body = @{
    goal = "Launch a mobile app in 2 weeks"
    deadline = "2025-10-29"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/plan" -Method Post -Body $body -ContentType "application/json"
```

### Get All Goals
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/goals" -Method Get
```

## Python Examples

```python
import requests
import json

# Health check
response = requests.get('http://localhost:5000/api/health')
print(response.json())

# Generate task plan
data = {
    'goal': 'Launch a mobile app in 2 weeks',
    'deadline': '2025-10-29'
}
response = requests.post(
    'http://localhost:5000/api/plan',
    json=data
)
print(json.dumps(response.json(), indent=2))

# Get all goals
response = requests.get('http://localhost:5000/api/goals')
print(response.json())
```

## JavaScript/Node.js Examples

```javascript
// Health check
fetch('http://localhost:5000/api/health')
  .then(response => response.json())
  .then(data => console.log(data));

// Generate task plan
fetch('http://localhost:5000/api/plan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    goal: 'Launch a mobile app in 2 weeks',
    deadline: '2025-10-29'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```
