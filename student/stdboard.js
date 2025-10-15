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

    // --- 2. INITIALIZE THE DASHBOARD ---
    
    // Populate static user info
    populateUserInfo(currentUser);

    // Fetch dynamic data for the dashboard sections
    fetchDashboardData();
    fetchReportsData();

    // --- 3. NAVIGATION LOGIC (Unchanged) ---
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetSection = this.getAttribute('data-section');
            if (!targetSection) return; // Allow default navigation for links without data-section
            e.preventDefault();
            document.querySelectorAll('.section.active').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-link.active').forEach(l => l.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            this.classList.add('active');
        });
    });

    // --- 3.5. LOGOUT FUNCTIONALITY ---
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.clear();
        window.location.href = '../home.html';
    });

    // --- 4. FUNCTIONS TO POPULATE THE UI ---

    function populateUserInfo(user) {
        document.querySelector('.profile-name').textContent = user.name;
        document.querySelector('.section-subtitle').textContent = `Welcome back, ${user.name.split(' ')[0]}! Here's your academic overview.`;
        // Update profile image
        const profileImg = document.querySelector('.profile-img');
        if (profileImg) {
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
        }
    }

    /**
     * Fetches combined goals and tasks for the main dashboard view.
     */
    async function fetchDashboardData() {
        const response = await apiRequest(`/dashboard/student/${currentUser.userId}`);
        if (response) {
            renderDashboard(response);
        }
    }

    /**
     * Renders the main dashboard stats and activity list.
     */
    function renderDashboard(items) {
        // Count all completed items (both goals and tasks)
        const totalItems = items.length;
        const completedItems = items.filter(item => item.status === 'COMPLETED').length;

        // Update the first stat card - Items Completed
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length > 0) {
            statCards[0].querySelector('.stat-value').textContent = `${completedItems}/${totalItems}`;
        }

        // Hide or remove other stat cards since we only want to show items
        if (statCards.length > 1) {
            for (let i = 1; i < statCards.length; i++) {
                statCards[i].style.display = 'none';
            }
        }

        // Update progress bar and percentage
        const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        const progressHeader = document.querySelector('.progress-header');
        if (progressHeader) {
            const progressSpan = progressHeader.querySelector('span');
            if (progressSpan) {
                progressSpan.textContent = `${completionPercentage}%`;
            }
        }

        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${completionPercentage}%`;
        }

        // Update goals summary in goals section to show all items
        updateGoalsSummary(items);
    }

    /**
     * Updates the goals summary section with dynamic data
     */
    function updateGoalsSummary(items) {
        // Count all completed items (both goals and tasks)
        const totalItems = items.length;
        const completedItems = items.filter(item => item.status === 'COMPLETED').length;
        const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        // Update circular progress
        const progressNumber = document.querySelector('.progress-number');
        if (progressNumber) {
            progressNumber.textContent = completedItems;
        }

        const progressTotal = document.querySelector('.progress-total');
        if (progressTotal) {
            progressTotal.textContent = `/${totalItems}`;
        }

        // Update circular progress bar
        const progressCircle = document.querySelector('.progress-bar-circle');
        if (progressCircle) {
            const circumference = 2 * Math.PI * 50; // radius is 50
            const offset = circumference - (completionPercentage / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
    }

    /**
     * Fetches the student's weekly report data.
     */
    async function fetchReportsData() {
        const response = await apiRequest(`/reports/student/${currentUser.userId}/history`);
        if (response) {
            renderReports(response);
        }
    }

    /**
     * Renders the student's reports table.
     */
    function renderReports(weeks) {
        const tableBody = document.getElementById('studentDetailedReportTableBody');
        tableBody.innerHTML = '';

        if (weeks.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">No report data available.</td></tr>';
            return;
        }

        weeks.forEach(week => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${week.weekId}</td>
                <td>${formatDate(week.startDate)} - ${formatDate(week.endDate)}</td>
                <td>${week.completedCount}/${week.totalCount}</td>
                <td>${week.completionPercentage}%</td>
            `;
            tableBody.appendChild(row);
        });

        // Update summary cards
        document.getElementById('studentTotalWeeks').textContent = weeks.length;
        const totalTasks = weeks.reduce((sum, week) => sum + week.totalCount, 0);
        const totalCompleted = weeks.reduce((sum, week) => sum + week.completedCount, 0);
        const avgProgress = weeks.length > 0 ? Math.round(weeks.reduce((sum, week) => sum + week.completionPercentage, 0) / weeks.length) : 0;

        document.getElementById('studentTotalTasks').textContent = totalTasks;
        document.getElementById('studentAvgProgress').textContent = `${avgProgress}%`;
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