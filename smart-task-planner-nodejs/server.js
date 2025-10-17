const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const Database = require('better-sqlite3');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite Database
const db = new Database('tasks.db');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deadline TEXT,
    status TEXT DEFAULT 'pending'
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_id INTEGER,
    task_name TEXT NOT NULL,
    description TEXT,
    estimated_hours INTEGER,
    deadline TEXT,
    priority TEXT,
    dependencies TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (goal_id) REFERENCES goals (id)
  )
`);

// Initialize Gemini AI with LangChain
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let llm = null;

if (GEMINI_API_KEY) {
  llm = new ChatGoogleGenerativeAI({
    modelName: 'gemini-2.0-flash',
    apiKey: GEMINI_API_KEY,
    temperature: 0.7,
    maxOutputTokens: 8192
  });
  console.log('🤖 Gemini AI: ✓ Configured');
} else {
  console.log('⚠️  Gemini AI: Not configured (GEMINI_API_KEY missing)');
}

// Startup message
console.log('\n🚀 Smart Task Planner Starting (Node.js + LangChain + Gemini)...');
console.log('==================================================');
console.log('📊 Database: ✓ Connected');
console.log('🔗 LangChain: ✓ Enabled');
console.log('📦 Model: gemini-2.0-flash');
console.log('==================================================\n');

// ============================================
// API Routes
// ============================================

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbConnected = db.open ? 'connected' : 'disconnected';
  res.json({
    status: 'healthy',
    gemini_configured: !!GEMINI_API_KEY,
    database: dbConnected
  });
});

// Generate Task Plan (Main AI Endpoint)
app.post('/api/plan', async (req, res) => {
  const { goal, deadline } = req.body;

  if (!goal) {
    return res.status(400).json({ error: 'Goal is required' });
  }

  if (!GEMINI_API_KEY || !llm) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY not configured',
      message: 'Please set your Gemini API key in .env file'
    });
  }

  try {
    const taskPlan = await generateTaskPlan(goal, deadline);

    if (taskPlan.error) {
      return res.status(500).json(taskPlan);
    }

    // Save to database
    const goalId = saveGoalAndTasks(goal, deadline, taskPlan);
    taskPlan.goal_id = goalId;

    res.json(taskPlan);
  } catch (error) {
    console.error('Error in /api/plan:', error);
    res.status(500).json({
      error: error.message,
      message: 'Failed to generate task plan'
    });
  }
});

// Get All Goals
app.get('/api/goals', (req, res) => {
  try {
    const goals = db.prepare('SELECT * FROM goals ORDER BY created_at DESC').all();
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Tasks for a Specific Goal
app.get('/api/goals/:id/tasks', (req, res) => {
  try {
    const { id } = req.params;
    const tasks = db.prepare('SELECT * FROM tasks WHERE goal_id = ? ORDER BY created_at').all(id);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Task Status
app.patch('/api/tasks/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id);
    res.json({ message: 'Task status updated', id, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example Endpoint
app.get('/api/example', (req, res) => {
  res.json({
    goal: 'Launch a mobile app in 2 weeks',
    deadline: '2025-11-01',
    sample_output: {
      analysis: 'This is an ambitious 2-week sprint requiring focused execution...',
      tasks: [
        {
          name: 'Define MVP Features',
          description: 'List core features for minimum viable product',
          estimated_hours: 4,
          priority: 'High',
          dependencies: [],
          deadline: '2025-10-18'
        }
      ]
    }
  });
});

// Serve Frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// Helper Functions
// ============================================

async function generateTaskPlan(goalText, deadline = null) {
  if (!llm) {
    return {
      error: 'GEMINI_API_KEY not configured',
      message: 'Please set your Gemini API key in .env file'
    };
  }

  try {
    const deadlineInfo = deadline ? ` with a deadline of ${deadline}` : '';

    const promptText = `You are an expert project manager and task planner. Break down the following goal into a detailed, actionable task plan${deadlineInfo}.

Goal: "${goalText}"

Provide a comprehensive task breakdown with:
1. Analysis: Brief analysis of the goal and key considerations
2. Tasks: List of 10-20 specific, actionable tasks with task name, detailed description, estimated hours, priority (High/Medium/Low), dependencies, and deadline
3. Timeline: Overall project timeline with total days and milestones
4. Risk Factors: Potential challenges or blockers
5. Success Metrics: How to measure completion

Return your response as a valid JSON object with this structure:
{{{{
  "analysis": "Your analysis here",
  "tasks": [
    {{{{
      "name": "Task name",
      "description": "Detailed description",
      "estimated_hours": 8,
      "priority": "High",
      "dependencies": [],
      "deadline": "YYYY-MM-DD"
    }}}}
  ],
  "timeline": {{{{
    "total_days": 14,
    "milestones": ["Milestone 1", "Milestone 2"]
  }}}},
  "risk_factors": ["Risk 1", "Risk 2"],
  "success_metrics": ["Metric 1", "Metric 2"]
}}}}

Be specific, realistic, and actionable. Generate 15-20 tasks minimum.`;

    // Create prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      ['human', promptText]
    ]);

    // Create chain (LangChain Expression Language)
    const chain = prompt.pipe(llm);

    // Invoke chain
    const response = await chain.invoke({});
    let responseText = response.content.trim();

    // Extract JSON from response
    if (responseText.includes('```json')) {
      responseText = responseText.split('```json')[1].split('```')[0].trim();
    } else if (responseText.includes('```')) {
      responseText = responseText.split('```')[1].split('```')[0].trim();
    }

    const taskPlan = JSON.parse(responseText);
    return taskPlan;

  } catch (error) {
    console.error('Error generating task plan:', error);
    return {
      error: error.message,
      message: 'Failed to generate task plan'
    };
  }
}

function saveGoalAndTasks(goalText, deadline, taskPlan) {
  try {
    // Insert goal
    const insertGoal = db.prepare('INSERT INTO goals (goal_text, deadline) VALUES (?, ?)');
    const result = insertGoal.run(goalText, deadline || null);
    const goalId = result.lastInsertRowid;

    // Insert tasks
    const insertTask = db.prepare(`
      INSERT INTO tasks (goal_id, task_name, description, estimated_hours, deadline, priority, dependencies)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    if (taskPlan.tasks && Array.isArray(taskPlan.tasks)) {
      for (const task of taskPlan.tasks) {
        insertTask.run(
          goalId,
          task.name || 'Unnamed Task',
          task.description || '',
          task.estimated_hours || 0,
          task.deadline || null,
          task.priority || 'Medium',
          JSON.stringify(task.dependencies || [])
        );
      }
    }

    return goalId;
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
}

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
  console.log(`\n✅ Server running at: http://localhost:${PORT}`);
  console.log(`\nPress CTRL+C to stop the server\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  db.close();
  process.exit(0);
});
