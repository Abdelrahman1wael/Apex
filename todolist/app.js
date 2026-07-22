// State Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// DOM Elements
const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const taskPriority = document.getElementById('task-priority');
const taskType = document.getElementById('task-type');
const taskTime = document.getElementById('task-time');
const todoList = document.getElementById('todo-list');
const completedBadge = document.getElementById('completed-badge');
const pendingBadge = document.getElementById('pending-badge');

// Initialize App
function init() {
    renderTasks();
    updateBadges();
    // Dispatch event to update D3 Chart if it exists
    if (typeof updateChart === 'function') {
        updateChart(tasks);
    }
}

// Add Task
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    const priority = taskPriority.value;
    const type = taskType.value;
    const time = taskTime.value;
    
    if (text !== '' && priority && type && time) {
        const newTask = {
            id: Date.now(),
            text: text,
            priority: priority,
            type: type,
            time: time,
            completed: false
        };
        tasks.push(newTask);
        taskInput.value = '';
        taskPriority.value = '';
        taskType.value = '';
        taskTime.value = '';
        saveAndRender();
        
        // Trigger Three.js effect if available
        if (typeof triggerAddEffect === 'function') {
            triggerAddEffect();
        }
    }
});

// Toggle Task Completion
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            const isNowCompleted = !task.completed;
            // Trigger Three.js effect on completion
            if (isNowCompleted && typeof triggerCompleteEffect === 'function') {
                triggerCompleteEffect();
            }
            return { ...task, completed: isNowCompleted };
        }
        return task;
    });
    saveAndRender();
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

// Save and Render
function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    updateBadges();
    
    if (typeof updateChart === 'function') {
        updateChart(tasks);
    }
}

// Render Tasks to DOM
function renderTasks() {
    todoList.innerHTML = '';
    
    if (tasks.length === 0) {
        todoList.innerHTML = '<li class="list-group-item justify-content-center text-muted">No tasks yet. Add one above!</li>';
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `list-group-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="task-content w-100 d-flex align-items-center">
                <input type="checkbox" class="task-checkbox flex-shrink-0" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <div class="d-flex flex-column flex-grow-1 mx-2">
                    <span class="task-text">${escapeHTML(task.text)}</span>
                    <div class="mt-1 d-flex align-items-center flex-wrap" style="font-size: 0.8rem; gap: 5px;">
                        ${task.priority ? `<span class="badge ${getPriorityClass(task.priority)}">${escapeHTML(task.priority)}</span>` : ''}
                        ${task.type ? `<span class="badge bg-secondary">${escapeHTML(task.type)}</span>` : ''}
                        ${task.time ? `<span class="text-muted" style="background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">⏰ ${escapeHTML(task.time)}</span>` : ''}
                    </div>
                </div>
                <button class="btn-delete flex-shrink-0" onclick="deleteTask(${task.id})" title="Delete Task">
                    &times;
                </button>
            </div>
        `;
        
        todoList.appendChild(li);
    });
}

function getPriorityClass(priority) {
    if (priority === 'High') return 'bg-danger';
    if (priority === 'Medium') return 'bg-warning text-dark';
    if (priority === 'Low') return 'bg-info text-dark';
    return 'bg-secondary';
}

// Update Badges
function updateBadges() {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;
    
    completedBadge.textContent = `${completed} Completed`;
    pendingBadge.textContent = `${pending} Pending`;
}

// Security: Escape HTML to prevent XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

// Run init
document.addEventListener('DOMContentLoaded', init);
