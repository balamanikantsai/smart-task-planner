"""
Smart Task Planner - Flask Backend with LangChain
Breaks down user goals into actionable tasks using Gemini AI via LangChain
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
from datetime import datetime, timedelta
import json
from dotenv import load_dotenv
import sqlite3
from pathlib import Path

# LangChain imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure Gemini API via LangChain
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Initialize LangChain LLM
llm = None
if GEMINI_API_KEY:
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=GEMINI_API_KEY,
        temperature=0.7,
        convert_system_message_to_human=True
    )

# Database configuration
DB_PATH = Path('tasks.db')

# ============================================================================
# Pydantic Models for Structured Output
# ============================================================================

class Task(BaseModel):
    """Individual task model"""
    name: str = Field(description="Task name")
    description: str = Field(description="Detailed task description")
    estimated_hours: int = Field(description="Estimated hours to complete")
    priority: str = Field(description="Priority level: High, Medium, or Low")
    dependencies: List[str] = Field(default=[], description="List of task dependencies")
    deadline: str = Field(description="Suggested deadline in YYYY-MM-DD format")

class Timeline(BaseModel):
    """Project timeline model"""
    total_days: int = Field(description="Total project duration in days")
    milestones: List[str] = Field(description="List of key milestones")

class TaskPlan(BaseModel):
    """Complete task plan structure"""
    analysis: str = Field(description="Brief analysis of the goal")
    tasks: List[Task] = Field(description="List of actionable tasks")
    timeline: Timeline = Field(description="Project timeline")
    risk_factors: List[str] = Field(description="Potential risks and challenges")
    success_metrics: List[str] = Field(description="Success measurement criteria")


def init_db():
    """Initialize SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deadline TEXT,
            status TEXT DEFAULT 'pending'
        )
    ''')
    
    cursor.execute('''
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (goal_id) REFERENCES goals (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def generate_task_plan(goal_text, deadline=None):
    """
    Use LangChain + Gemini AI to break down goal into actionable tasks
    """
    if not GEMINI_API_KEY or not llm:
        return {
            "error": "GEMINI_API_KEY not configured",
            "message": "Please set your Gemini API key in .env file"
        }
    
    try:
        # Construct prompt
        deadline_info = f" with a deadline of {deadline}" if deadline else ""
        
        prompt_text = f"""You are an expert project manager and task planner. Break down the following goal into a detailed, actionable task plan{deadline_info}.

Goal: "{goal_text}"

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

Be specific, realistic, and actionable. Generate 15-20 tasks minimum."""

        # Create prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("human", prompt_text)
        ])
        
        # Create chain (LangChain Expression Language - LCEL)
        chain = prompt | llm
        
        # Invoke chain
        response = chain.invoke({})
        
        # Extract content
        response_text = response.content.strip()
        
        # Extract JSON from response (handle markdown code blocks)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        task_plan = json.loads(response_text)
        return task_plan
        
    except json.JSONDecodeError as e:
        # If JSON parsing fails, return structured error with raw response
        print(f"JSON Decode Error: {str(e)}")
        print(f"Response text: {response_text[:500]}")
        return {
            "error": "Failed to parse AI response",
            "raw_response": response_text[:500] if 'response_text' in locals() else "No response",
            "message": "The AI response was not in valid JSON format"
        }
    except Exception as e:
        print(f"Error generating task plan: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "error": str(e),
            "message": "Failed to generate task plan",
            "details": traceback.format_exc()
        }

def save_goal_and_tasks(goal_text, task_plan, deadline=None):
    """Save goal and tasks to database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Save goal
        cursor.execute(
            'INSERT INTO goals (goal_text, deadline) VALUES (?, ?)',
            (goal_text, deadline)
        )
        goal_id = cursor.lastrowid
        
        # Save tasks if available
        if 'tasks' in task_plan and isinstance(task_plan['tasks'], list):
            for task in task_plan['tasks']:
                cursor.execute('''
                    INSERT INTO tasks 
                    (goal_id, task_name, description, estimated_hours, deadline, priority, dependencies)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    goal_id,
                    task.get('name', ''),
                    task.get('description', ''),
                    task.get('estimated_hours', 0),
                    task.get('deadline', ''),
                    task.get('priority', 'Medium'),
                    json.dumps(task.get('dependencies', []))
                ))
        
        conn.commit()
        return goal_id
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

@app.route('/')
def index():
    """Serve the main frontend page"""
    return render_template('index.html')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "gemini_configured": bool(GEMINI_API_KEY),
        "langchain_enabled": bool(llm),
        "model": "gemini-2.0-flash",
        "database": "connected" if DB_PATH.exists() else "not_initialized"
    })

@app.route('/api/plan', methods=['POST'])
def create_plan():
    """
    Main endpoint to create a task plan from a goal
    
    Request body:
    {
        "goal": "Your goal description",
        "deadline": "YYYY-MM-DD" (optional)
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'goal' not in data:
            return jsonify({
                "error": "Missing required field 'goal'"
            }), 400
        
        goal_text = data['goal']
        deadline = data.get('deadline', None)
        
        # Generate task plan using LangChain + Gemini AI
        task_plan = generate_task_plan(goal_text, deadline)
        
        if 'error' in task_plan:
            return jsonify(task_plan), 500
        
        # Save to database
        try:
            goal_id = save_goal_and_tasks(goal_text, task_plan, deadline)
            task_plan['goal_id'] = goal_id
            task_plan['saved'] = True
        except Exception as e:
            task_plan['save_error'] = str(e)
            task_plan['saved'] = False
        
        return jsonify({
            "success": True,
            "goal": goal_text,
            "deadline": deadline,
            "plan": task_plan
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "message": "Failed to process request"
        }), 500

@app.route('/api/goals', methods=['GET'])
def get_goals():
    """Get all saved goals"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM goals ORDER BY created_at DESC')
        goals = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({
            "success": True,
            "goals": goals
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve goals"
        }), 500

@app.route('/api/goals/<int:goal_id>/tasks', methods=['GET'])
def get_goal_tasks(goal_id):
    """Get all tasks for a specific goal"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM tasks WHERE goal_id = ? ORDER BY created_at', (goal_id,))
        tasks = [dict(row) for row in cursor.fetchall()]
        
        # Parse dependencies JSON
        for task in tasks:
            if task['dependencies']:
                task['dependencies'] = json.loads(task['dependencies'])
            else:
                task['dependencies'] = []
        
        conn.close()
        
        return jsonify({
            "success": True,
            "tasks": tasks
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "message": "Failed to retrieve tasks"
        }), 500

@app.route('/api/tasks/<int:task_id>/status', methods=['PUT'])
def update_task_status(task_id):
    """Update task status"""
    try:
        data = request.get_json()
        status = data.get('status', 'pending')
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute(
            'UPDATE tasks SET status = ? WHERE id = ?',
            (status, task_id)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Task status updated"
        })
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "message": "Failed to update task status"
        }), 500

@app.route('/api/example', methods=['GET'])
def get_example():
    """Get example goals for demonstration"""
    examples = [
        {
            "goal": "Launch a mobile app in 2 weeks",
            "deadline": (datetime.now() + timedelta(days=14)).strftime('%Y-%m-%d')
        },
        {
            "goal": "Organize a tech conference for 200 attendees",
            "deadline": (datetime.now() + timedelta(days=60)).strftime('%Y-%m-%d')
        },
        {
            "goal": "Write and publish a technical blog series on AI",
            "deadline": (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        },
        {
            "goal": "Learn web development and build a portfolio website",
            "deadline": (datetime.now() + timedelta(days=90)).strftime('%Y-%m-%d')
        }
    ]
    
    return jsonify({
        "success": True,
        "examples": examples
    })

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Run the app
    print("\n🚀 Smart Task Planner Starting (LangChain + Gemini)...")
    print("=" * 50)
    print(f"📊 Database: {'✓ Connected' if DB_PATH.exists() else '✗ Not initialized'}")
    print(f"🤖 Gemini AI: {'✓ Configured' if GEMINI_API_KEY else '✗ Not configured'}")
    print(f"🔗 LangChain: {'✓ Enabled' if llm else '✗ Disabled'}")
    print(f"📦 Model: gemini-2.0-flash")
    print("=" * 50)
    print("\nAccess the app at: http://localhost:5000")
    print("\nPress CTRL+C to stop the server\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
