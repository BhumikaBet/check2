// Goal-specific JavaScript for goal.html

document.addEventListener('DOMContentLoaded', function() {
    // --- 1. SETUP AND AUTHENTICATION ---
    const API_BASE_URL = 'http://localhost:8080/api';
    const token = localStorage.getItem('jwtToken');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // If no token or user info is found, redirect to the login page
    if (!token || !currentUser || currentUser.role !== 'STUDENT') {
        window.location.href = '../login.html'; // Adjust path if needed
        return;
    }

    // --- 2. INITIALIZE GOALS PAGE ---
    populateUserInfo(currentUser);
    fetchGoalsData();

    // Add event listener for the "Add Goal" button
    document.getElementById('addGoalBtn').addEventListener('click', () => openGoalModal());

    // --- 3. FUNCTIONS TO POPULATE THE UI ---

    function populateUserInfo(user) {
        document.querySelector('.profile-name').textContent = user.name;
        // Update profile image
        const profileImg = document.querySelector('.profile-img');
        if (profileImg) {
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
        }
    }

    /**
     * Fetches the student's personal goals and mentor-assigned tasks for the "Goals" tab.
     */
    async function fetchGoalsData() {
        const items = await apiRequest(`/dashboard/student/${currentUser.userId}`);
        if (items) {
            renderGoals(items);
        }
    }

    /**
     * Renders the goal cards and mentor-assigned tasks in the "Goals" tab.
     */
    function renderGoals(items) {
        const goalsList = document.getElementById('goalsList');
        goalsList.innerHTML = ''; // Clear static content

        if (items.length === 0) {
            goalsList.innerHTML = '<p>No goals or tasks yet. Click "Add Goal" to get started!</p>';
            return;
        }

        items.forEach(item => {
            const isTask = item.mentorName !== undefined && item.mentorName !== null;
            const goalCard = document.createElement('div');
            goalCard.className = isTask ? 'goal-card mentor-goal' : 'goal-card';

            const headerContent = isTask
                ? `<div class="goal-header"><h3 class="goal-title">${item.title}</h3><span class="mentor-tag">Assigned by ${item.mentorName}</span></div>`
                : `<div class="goal-header"><h3 class="goal-title">${item.title}</h3></div>`;

            const actionsContent = isTask
                ? `<div class="goal-actions"><button class="action-btn preview-btn" data-task-id="${item.id}"><i class="fas fa-eye"></i></button><button class="action-btn edit-task-btn" data-task-id="${item.id}"><i class="fas fa-edit"></i></button></div>`
                : `<div class="goal-actions"><button class="action-btn edit-btn" data-goal-id="${item.id}"><i class="fas fa-edit"></i></button><button class="action-btn delete-btn" data-goal-id="${item.id}"><i class="fas fa-trash"></i></button></div>`;

            goalCard.innerHTML = `
                ${headerContent}
                <div class="goal-content">
                    <p class="goal-description">${item.description}</p>
                    <div class="goal-meta"><span class="goal-due-date">Due: ${formatDate(item.dueDate)}</span></div>
                </div>
                <div class="goal-footer">
                    <div class="goal-status">
                        <span class="status-indicator status-${item.status.toLowerCase()}"></span>
                        <span class="status-text">${item.status.replace('_', ' ')}</span>
                    </div>
                    ${actionsContent}
                </div>`;
            goalsList.appendChild(goalCard);
        });

        // Add event listeners to the new buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const goalId = e.currentTarget.dataset.goalId;
                const goal = items.find(g => g.id == goalId && !g.mentorName);
                if (goal) {
                    openGoalModal(goal); // Open modal for editing
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const goalId = e.currentTarget.dataset.goalId;
                if (confirm('Are you sure you want to delete this goal?')) {
                    deleteGoal(goalId);
                }
            });
        });

        // Add event listeners for task preview buttons
        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.taskId;
                const task = items.find(t => t.id == taskId && t.mentorName);
                if (task) {
                    openTaskPreviewModal(task);
                }
            });
        });

        // Add event listeners for task edit buttons
        document.querySelectorAll('.edit-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.taskId;
                const task = items.find(t => t.id == taskId && t.mentorName);
                if (task) {
                    openTaskEditModal(task);
                }
            });
        });
    }

    // --- 4. FUNCTIONS FOR CRUD OPERATIONS ---

    /**
     * Handles adding a new goal or updating an existing one.
     */
    async function saveGoal(goalData, goalId = null) {
        const url = goalId
            ? `/goals/${goalId}`
            : `/goals/student/${currentUser.userId}`;

        const method = goalId ? 'PATCH' : 'POST';

        const response = await apiRequest(url, method, goalData);
        if (response) {
            showNotification(`Goal ${goalId ? 'updated' : 'added'} successfully!`, 'success');
            await fetchGoalsData(); // Refresh the goals list
        }
    }

    /**
     * Handles updating a task's status and progress.
     */
    async function saveTask(taskData, taskId) {
        const response = await apiRequest(`/tasks/student/${currentUser.userId}/task/${taskId}`, 'PATCH', taskData);
        if (response) {
            showNotification('Task updated successfully!', 'success');
            await fetchGoalsData(); // Refresh the goals list
        }
    }

    /**
     * Handles deleting a goal.
     */
    async function deleteGoal(goalId) {
        const response = await apiRequest(`/goals/${goalId}`, 'DELETE');
        if (response) {
            showNotification('Goal deleted successfully!', 'success');
            fetchGoalsData(); // Refresh the goals list
        }
    }

    // --- 5. MODAL FUNCTIONS ---

    function openTaskPreviewModal(task) {
        const modalContent = `
            <div class="task-preview">
                <div class="task-header">
                    <h3>${task.title}</h3>
                    <span class="mentor-label">Assigned by ${task.mentorName}</span>
                </div>
                <div class="task-details">
                    <p><strong>Description:</strong> ${task.description}</p>
                    <p><strong>Due Date:</strong> ${formatDate(task.dueDate)}</p>
                    <p><strong>Status:</strong> ${task.status.replace('_', ' ')}</p>
                    <p><strong>Progress:</strong> ${task.progressPercentage || 0}%</p>
                </div>
            </div>
        `;

        const modal = createModal({
            title: 'Task Details',
            content: modalContent,
            onSubmit: null // No submit button for preview
        });

        // Remove submit button for preview modal
        const submitBtn = modal.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.style.display = 'none';
        }
    }

    function openTaskEditModal(task) {
        const modalContent = `
            <div class="task-edit">
                <div class="task-header">
                    <h3>${task.title}</h3>
                    <span class="mentor-label">Assigned by ${task.mentorName}</span>
                </div>
                <div class="task-details">
                    <p><strong>Description:</strong> ${task.description}</p>
                    <p><strong>Due Date:</strong> ${formatDate(task.dueDate)}</p>
                </div>
                <div class="form-group">
                    <label for="taskStatus">Status</label>
                    <select id="taskStatus" required>
                        <option value="PENDING" ${task.status === 'PENDING' ? 'selected' : ''}>PENDING</option>
                        <option value="IN_PROGRESS" ${task.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                        <option value="COMPLETED" ${task.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="taskProgress">Progress Percentage (0-100)</label>
                    <input type="number" id="taskProgress" min="0" max="100" value="${task.progressPercentage || 0}" required>
                    <div id="progressError" class="error-message" style="display: none; color: red; font-size: 12px; margin-top: 5px;"></div>
                </div>
            </div>
        `;

        const modal = createModal({
            title: 'Update Task Progress',
            content: modalContent,
            onSubmit: () => {
                const progressValue = parseInt(document.getElementById('taskProgress').value);
                const errorDiv = document.getElementById('progressError');

                if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
                    errorDiv.textContent = 'Please enter a valid percentage between 0 and 100.';
                    errorDiv.style.display = 'block';
                    return;
                }

                errorDiv.style.display = 'none';

                const taskData = {
                    status: document.getElementById('taskStatus').value,
                    progressPercentage: progressValue
                };
                saveTask(taskData, task.id);
                modal.remove();
            }
        });

        // Add bidirectional logic between status and progress
        const progressInput = modal.querySelector('#taskProgress');
        const statusSelect = modal.querySelector('#taskStatus');
        const errorDiv = modal.querySelector('#progressError');

        // When progress changes, update status
        progressInput.addEventListener('input', (e) => {
            const progress = parseInt(e.target.value);

            if (isNaN(progress) || progress < 0 || progress > 100) {
                errorDiv.textContent = 'Please enter a valid percentage between 0 and 100.';
                errorDiv.style.display = 'block';
                return;
            } else {
                errorDiv.style.display = 'none';
            }

            if (progress === 0) {
                statusSelect.value = 'PENDING';
            } else if (progress === 100) {
                statusSelect.value = 'COMPLETED';
            } else if (progress > 0 && progress < 100) {
                statusSelect.value = 'IN_PROGRESS';
            }
        });

        // When status changes, update progress
        statusSelect.addEventListener('change', (e) => {
            const status = e.target.value;
            if (status === 'COMPLETED') {
                progressInput.value = 100;
                errorDiv.style.display = 'none';
            } else if (status === 'PENDING') {
                progressInput.value = 0;
                errorDiv.style.display = 'none';
            }
            // For IN_PROGRESS, don't change progress automatically
        });
    }

    function openGoalModal(goal = null) {
        const isEditing = goal !== null;
        const title = isEditing ? 'Edit Goal' : 'Add New Goal';
        const modalContent = `
            <div class="form-group">
                <label for="goalTitle">Goal Title</label>
                <input type="text" id="goalTitle" placeholder="Enter goal title" value="${isEditing ? goal.title : ''}" required>
            </div>
            <div class="form-group">
                <label for="goalDescription">Description</label>
                <textarea id="goalDescription" placeholder="Enter goal description" required>${isEditing ? goal.description : ''}</textarea>
            </div>
            <div class="form-group">
                <label for="goalDueDate">Due Date</label>
                <input type="date" id="goalDueDate" value="${isEditing ? goal.dueDate : ''}" required>
            </div>
            ${isEditing ? `
            <div class="form-group">
                <label for="goalStatus">Status</label>
                <select id="goalStatus" required>
                    <option value="PENDING" ${goal.status === 'PENDING' ? 'selected' : ''}>PENDING</option>
                    <option value="IN_PROGRESS" ${goal.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                    <option value="COMPLETED" ${goal.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
            <div class="form-group">
                <label for="goalProgress">Progress Percentage (0-100)</label>
                <input type="number" id="goalProgress" min="0" max="100" value="${goal.progressPercentage || 0}" required>
                <div id="goalProgressError" class="error-message" style="display: none; color: red; font-size: 12px; margin-top: 5px;"></div>
            </div>
            ` : ''}
        `;

        const modal = createModal({
            title,
            content: modalContent,
            onSubmit: () => {
                if (isEditing) {
                    const progressValue = parseInt(document.getElementById('goalProgress').value);
                    const errorDiv = document.getElementById('goalProgressError');

                    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
                        errorDiv.textContent = 'Please enter a valid percentage between 0 and 100.';
                        errorDiv.style.display = 'block';
                        return;
                    }

                    errorDiv.style.display = 'none';
                }

                const goalData = {
                    title: document.getElementById('goalTitle').value,
                    description: document.getElementById('goalDescription').value,
                    dueDate: document.getElementById('goalDueDate').value
                };
                if (isEditing) {
                    goalData.status = document.getElementById('goalStatus').value;
                    goalData.progressPercentage = parseInt(document.getElementById('goalProgress').value);
                }
                saveGoal(goalData, isEditing ? goal.id : null);
                modal.remove();
            }
        });

        // Add bidirectional logic between status and progress for editing
        if (isEditing) {
            const progressInput = modal.querySelector('#goalProgress');
            const statusSelect = modal.querySelector('#goalStatus');
            const errorDiv = modal.querySelector('#goalProgressError');

            // When progress changes, update status
            progressInput.addEventListener('input', (e) => {
                const progress = parseInt(e.target.value);

                if (isNaN(progress) || progress < 0 || progress > 100) {
                    errorDiv.textContent = 'Please enter a valid percentage between 0 and 100.';
                    errorDiv.style.display = 'block';
                    return;
                } else {
                    errorDiv.style.display = 'none';
                }

                if (progress === 0) {
                    statusSelect.value = 'PENDING';
                } else if (progress === 100) {
                    statusSelect.value = 'COMPLETED';
                } else if (progress > 0 && progress < 100) {
                    statusSelect.value = 'IN_PROGRESS';
                }
            });

            // When status changes, update progress
            statusSelect.addEventListener('change', (e) => {
                const status = e.target.value;
                if (status === 'COMPLETED') {
                    progressInput.value = 100;
                    errorDiv.style.display = 'none';
                } else if (status === 'PENDING') {
                    progressInput.value = 0;
                    errorDiv.style.display = 'none';
                }
                // For IN_PROGRESS, don't change progress automatically
            });
        }
    }

    // Generic function to create modals
    function createModal({ title, content, onSubmit }) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        const footerContent = onSubmit ? `
            <div class="modal-footer">
                <button class="btn btn-secondary cancel-btn">Cancel</button>
                <button class="btn btn-primary submit-btn">Save</button>
            </div>` : '';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${footerContent}
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show'); // Make the modal visible

        // Event listeners
        modal.querySelector('.close').addEventListener('click', () => modal.remove());
        if (onSubmit) {
            modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
            modal.querySelector('.submit-btn').addEventListener('click', () => {
                onSubmit();
            });
        }

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }

    // Generic function for making API requests
    async function apiRequest(endpoint, method = 'GET', body = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            if (body) {
                options.body = JSON.stringify(body);
            }
            const response = await fetch(API_BASE_URL + endpoint, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // For DELETE requests, there's often no content to return
            return method === 'DELETE' ? true : response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            showNotification('An error occurred. Please try again.', 'error');
            return null;
        }
    }

    // Utility function to format dates
    function formatDate(dateString) {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Utility function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
});
