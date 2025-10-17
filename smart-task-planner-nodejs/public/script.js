// Smart Task Planner - Frontend JavaScript

let currentPlan = null;
let currentView = 'timeline';

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Smart Task Planner initialized');
    checkAPIStatus();
    setupEventListeners();
    setMinDate();
});

// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('deadlineInput').min = today;
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('generateBtn').addEventListener('click', generatePlan);
    document.getElementById('examplesBtn').addEventListener('click', showExamples);
    document.getElementById('historyBtn').addEventListener('click', showHistory);
    
    // View toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            switchView(view);
        });
    });
    
    // Allow Enter key to submit (Ctrl+Enter for multiline)
    document.getElementById('goalInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            generatePlan();
        }
    });
}

// Check API health status
async function checkAPIStatus() {
    const statusBadge = document.getElementById('apiStatus');
    
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (data.status === 'healthy' && data.gemini_configured) {
            statusBadge.textContent = '🤖 AI Ready';
            statusBadge.classList.add('connected');
        } else if (data.status === 'healthy' && !data.gemini_configured) {
            statusBadge.textContent = '⚠️ API Key Missing';
            statusBadge.classList.add('error');
            showError('Gemini API key not configured. Please add your API key to .env file.');
        } else {
            statusBadge.textContent = '❌ Disconnected';
            statusBadge.classList.add('error');
        }
    } catch (error) {
        statusBadge.textContent = '❌ Server Error';
        statusBadge.classList.add('error');
        console.error('Health check failed:', error);
    }
}

// Generate task plan
async function generatePlan() {
    const goalInput = document.getElementById('goalInput');
    const deadlineInput = document.getElementById('deadlineInput');
    const generateBtn = document.getElementById('generateBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsSection = document.getElementById('resultsSection');
    
    const goal = goalInput.value.trim();
    const deadline = deadlineInput.value;
    
    // Validation
    if (!goal) {
        showError('Please enter a goal description');
        goalInput.focus();
        return;
    }
    
    // Show loading state
    generateBtn.disabled = true;
    loadingIndicator.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    hideError();
    
    try {
        const response = await fetch('/api/plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                goal: goal,
                deadline: deadline || null
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to generate plan');
        }
        
        if (data.success) {
            currentPlan = data;
            displayPlan(data);
            resultsSection.classList.remove('hidden');
            
            // Smooth scroll to results
            setTimeout(() => {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        } else {
            throw new Error(data.error || 'Failed to generate plan');
        }
        
    } catch (error) {
        console.error('Error generating plan:', error);
        showError(`Failed to generate plan: ${error.message}`);
    } finally {
        generateBtn.disabled = false;
        loadingIndicator.classList.add('hidden');
    }
}

// Display the generated plan
function displayPlan(data) {
    const plan = data.plan;
    
    // Display Analysis
    if (plan.analysis) {
        document.getElementById('analysisContent').innerHTML = `
            <p>${escapeHtml(plan.analysis)}</p>
            <div style="margin-top: 15px; padding: 15px; background: rgba(99, 102, 241, 0.1); border-radius: 6px;">
                <strong>Goal:</strong> ${escapeHtml(data.goal)}<br>
                ${data.deadline ? `<strong>Deadline:</strong> ${formatDate(data.deadline)}` : ''}
            </div>
        `;
    }
    
    // Display Tasks
    if (plan.tasks && plan.tasks.length > 0) {
        displayTasks(plan.tasks);
    }
    
    // Display Timeline
    if (plan.timeline) {
        displayTimeline(plan.timeline);
    }
    
    // Display Risk Factors
    if (plan.risk_factors) {
        displayRisks(plan.risk_factors);
    }
    
    // Display Success Metrics
    if (plan.success_metrics) {
        displayMetrics(plan.success_metrics);
    }
}

// Display tasks in timeline view
function displayTasks(tasks) {
    const tasksContent = document.getElementById('tasksContent');
    
    const tasksHTML = tasks.map((task, index) => {
        const priorityClass = `priority-${task.priority.toLowerCase()}`;
        const dependencies = task.dependencies && task.dependencies.length > 0
            ? `<div class="task-dependencies">
                <strong><i class="fas fa-link"></i> Dependencies:</strong> ${task.dependencies.join(', ')}
               </div>`
            : '';
        
        return `
            <div class="task-item ${priorityClass}">
                <div class="task-header">
                    <div class="task-name">
                        <i class="fas fa-check-circle"></i> ${escapeHtml(task.name)}
                    </div>
                </div>
                <div class="task-meta">
                    <span class="task-badge priority-badge">${task.priority} Priority</span>
                    <span class="task-badge time-badge">
                        <i class="fas fa-clock"></i> ${task.estimated_hours}h
                    </span>
                    ${task.deadline ? `<span class="task-badge deadline-badge">
                        <i class="fas fa-calendar"></i> ${formatDate(task.deadline)}
                    </span>` : ''}
                </div>
                <div class="task-description">
                    ${escapeHtml(task.description)}
                </div>
                ${dependencies}
            </div>
        `;
    }).join('');
    
    tasksContent.innerHTML = tasksHTML;
}

// Display tasks in Kanban view
function displayTasksKanban(tasks) {
    const priorities = ['High', 'Medium', 'Low'];
    const tasksContent = document.getElementById('tasksContent');
    
    const columns = priorities.map(priority => {
        const priorityTasks = tasks.filter(t => t.priority === priority);
        
        return `
            <div class="kanban-column">
                <h4>${priority} Priority (${priorityTasks.length})</h4>
                ${priorityTasks.map(task => `
                    <div class="task-item priority-${priority.toLowerCase()}">
                        <div class="task-name">${escapeHtml(task.name)}</div>
                        <div class="task-meta">
                            <span class="task-badge time-badge">${task.estimated_hours}h</span>
                        </div>
                        <div class="task-description">${escapeHtml(task.description)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
    
    tasksContent.innerHTML = `<div class="kanban-view">${columns}</div>`;
}

// Display timeline
function displayTimeline(timeline) {
    const timelineContent = document.getElementById('timelineContent');
    
    const milestonesHTML = timeline.milestones && timeline.milestones.length > 0
        ? timeline.milestones.map(milestone => `
            <div class="milestone-item">
                <i class="fas fa-flag"></i> ${escapeHtml(milestone)}
            </div>
          `).join('')
        : '<p>No specific milestones defined</p>';
    
    timelineContent.innerHTML = `
        <div style="margin-bottom: 20px; padding: 15px; background: rgba(99, 102, 241, 0.1); border-radius: 6px;">
            <strong><i class="fas fa-calendar-check"></i> Total Duration:</strong> 
            ${timeline.total_days} days
        </div>
        <h4 style="margin-bottom: 10px;"><i class="fas fa-flag-checkered"></i> Milestones:</h4>
        ${milestonesHTML}
    `;
}

// Display risk factors
function displayRisks(risks) {
    const risksContent = document.getElementById('risksContent');
    
    if (risks.length > 0) {
        const risksHTML = risks.map(risk => `
            <li>${escapeHtml(risk)}</li>
        `).join('');
        
        risksContent.innerHTML = `<ul>${risksHTML}</ul>`;
    } else {
        risksContent.innerHTML = '<p>No significant risks identified</p>';
    }
}

// Display success metrics
function displayMetrics(metrics) {
    const metricsContent = document.getElementById('metricsContent');
    
    if (metrics.length > 0) {
        const metricsHTML = metrics.map(metric => `
            <li>${escapeHtml(metric)}</li>
        `).join('');
        
        metricsContent.innerHTML = `<ul>${metricsHTML}</ul>`;
    } else {
        metricsContent.innerHTML = '<p>No specific metrics defined</p>';
    }
}

// Switch between timeline and kanban views
function switchView(view) {
    currentView = view;
    
    // Update active button
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });
    
    // Redisplay tasks in new view
    if (currentPlan && currentPlan.plan.tasks) {
        if (view === 'timeline') {
            displayTasks(currentPlan.plan.tasks);
        } else if (view === 'kanban') {
            displayTasksKanban(currentPlan.plan.tasks);
        }
    }
}

// Show examples modal
async function showExamples() {
    const modal = document.getElementById('examplesModal');
    const examplesList = document.getElementById('examplesList');
    
    try {
        const response = await fetch('/api/example');
        const data = await response.json();
        
        if (data.success) {
            const examplesHTML = data.examples.map(example => `
                <div class="example-item" onclick='useExample(${JSON.stringify(example)})'>
                    <h4><i class="fas fa-lightbulb"></i> ${escapeHtml(example.goal)}</h4>
                    <p style="color: var(--text-secondary); margin-top: 5px;">
                        <i class="fas fa-calendar"></i> Deadline: ${formatDate(example.deadline)}
                    </p>
                </div>
            `).join('');
            
            examplesList.innerHTML = examplesHTML;
        }
    } catch (error) {
        console.error('Failed to load examples:', error);
        examplesList.innerHTML = '<p>Failed to load examples</p>';
    }
    
    modal.classList.remove('hidden');
}

// Use an example goal
function useExample(example) {
    document.getElementById('goalInput').value = example.goal;
    document.getElementById('deadlineInput').value = example.deadline;
    closeExamplesModal();
}

// Close examples modal
function closeExamplesModal() {
    document.getElementById('examplesModal').classList.add('hidden');
}

// Show history (placeholder)
function showHistory() {
    alert('History feature coming soon! Your goals will be saved for future reference.');
}

// Export functions
function exportToJSON() {
    if (!currentPlan) return;
    
    const dataStr = JSON.stringify(currentPlan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'task-plan.json';
    link.click();
}

function exportToCSV() {
    if (!currentPlan || !currentPlan.plan.tasks) return;
    
    const tasks = currentPlan.plan.tasks;
    const headers = ['Task Name', 'Description', 'Priority', 'Estimated Hours', 'Deadline', 'Dependencies'];
    
    const csvContent = [
        headers.join(','),
        ...tasks.map(task => [
            `"${task.name}"`,
            `"${task.description}"`,
            task.priority,
            task.estimated_hours,
            task.deadline || '',
            `"${task.dependencies.join('; ')}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'task-plan.csv';
    link.click();
}

function printPlan() {
    window.print();
}

// Show about
function showAbout() {
    alert('Smart Task Planner v1.0\n\nPowered by Gemini AI and Flask\nBuilt for intelligent goal breakdown and task planning');
}

// Error handling
function showError(message) {
    const errorDisplay = document.getElementById('errorDisplay');
    errorDisplay.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${escapeHtml(message)}`;
    errorDisplay.classList.remove('hidden');
    
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    document.getElementById('errorDisplay').classList.add('hidden');
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
