document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initializeMentorDashboard();
});

function initializeMentorDashboard() {
    // Update profile with logged-in user
    updateProfile();

    // Navigation functionality
    setupNavigation();

    // Logout functionality
    setupLogout();

    // Update dashboard data
    updateDashboardData();

    // Setup activity list
    setupActivityList();

    // Initialize reports functionality
    setupReportsPanel();
}

function updateProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        // Update profile info
        const profileName = document.querySelector('.profile-name');
        if (profileName) profileName.textContent = currentUser.name;

        const welcomeText = document.querySelector('.welcome-text');
        if (welcomeText) welcomeText.textContent = `Welcome back, ${currentUser.name.split(' ')[0]}!`;
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetSection = this.getAttribute('data-section');

            // Only handle SPA navigation if data-section is present
            if (targetSection) {
                e.preventDefault();

                // Remove active class from all links and sections
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                document.querySelectorAll('.section').forEach(section => {
                    section.classList.remove('active');
                });

                // Add active class to clicked link and target section
                this.classList.add('active');
                const targetElement = document.getElementById(targetSection);
                if (targetElement) {
                    targetElement.classList.add('active');

                    // Load content for specific sections
                    if (targetSection === 'students') {
                        loadAllAssignedStudents();
                    }
                }
            }
            // If no data-section, allow normal navigation
        });
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Show confirmation dialog
            if (confirm('Are you sure you want to logout?')) {
                // Clear user data and redirect to homepage
                localStorage.clear();
                window.location.href = '../home.html';
            }
        });
    }
}

function updateDashboardData() {
    // Simulate real-time data updates
    const totalStudents = document.getElementById('totalStudents');
    const goalsCompleted = document.getElementById('goalsCompleted');
    const pendingFeedback = document.getElementById('pendingFeedback');
    const avgProgress = document.getElementById('avgProgress');

    if (totalStudents) {
        // Simulate slight variations in data
        const baseStudents = 12;
        const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        totalStudents.textContent = baseStudents + variation;
    }

    if (goalsCompleted) {
        const baseGoals = 28;
        const variation = Math.floor(Math.random() * 4) - 1; // -1, 0, 1, or 2
        goalsCompleted.textContent = baseGoals + variation;
    }

    if (pendingFeedback) {
        const basePending = 5;
        const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const newPending = Math.max(0, basePending + variation); // Ensure non-negative
        pendingFeedback.textContent = newPending;
    }

    if (avgProgress) {
        const baseProgress = 73;
        const variation = Math.floor(Math.random() * 11) - 5; // -5 to +5
        const newProgress = Math.max(0, Math.min(100, baseProgress + variation)); // Ensure 0-100%
        avgProgress.textContent = newProgress + '%';
    }
}

function setupActivityList() {
    const activityList = document.getElementById('activityList');

    if (activityList) {
        // Add hover effects to activity items
        const activityItems = activityList.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            // Add hover effect
            item.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f8fafc';
                this.style.cursor = 'pointer';
            });

            item.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
            });
        });
    }
}



function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#4e54c8'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1001;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Auto-update dashboard data every 30 seconds
setInterval(updateDashboardData, 30000);

// Add some dynamic activity updates
function addRandomActivity() {
    const activities = [
        { text: "You reviewed Sarah's latest assignment", icon: "fas fa-eye" },
        { text: "You provided feedback on John's project", icon: "fas fa-comments" },
        { text: "You updated Michelle's learning goals", icon: "fas fa-edit" },
        { text: "You approved Alex's course completion", icon: "fas fa-check-circle" },
        { text: "You scheduled a meeting with Emma", icon: "fas fa-calendar" }
    ];

    const activityList = document.getElementById('activityList');

    if (activityList && Math.random() < 0.3) { // 30% chance every 30 seconds
        // Get existing activity texts to avoid duplicates
        const existingActivities = Array.from(activityList.querySelectorAll('.activity-description')).map(el => el.textContent);

        // Filter out activities that already exist
        const availableActivities = activities.filter(activity => !existingActivities.includes(activity.text));

        if (availableActivities.length === 0) return; // No new activities to add

        const randomActivity = availableActivities[Math.floor(Math.random() * availableActivities.length)];

        const newActivity = document.createElement('li');
        newActivity.className = 'activity-item';
        newActivity.innerHTML = `
            <div class="activity-icon">
                <i class="${randomActivity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4 class="activity-description">${randomActivity.text}</h4>
                <p class="activity-time">Just now</p>
            </div>
        `;

        // Add to the top of the list
        activityList.insertBefore(newActivity, activityList.firstChild);

        // Remove old activities if more than 10
        while (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }

        // Update timestamp after 1 minute
        setTimeout(() => {
            const timeElement = newActivity.querySelector('.activity-time');
            if (timeElement) {
                timeElement.textContent = '1 minute ago';
            }
        }, 60000);
    }
}

// Add random activity updates every 30 seconds
setInterval(addRandomActivity, 30000);





// Initialize reports functionality
setupReportsPanel();

// Reports Panel functionality
function setupReportsPanel() {
    // Setup class selector for reports
    setupReportsClassSelector();
}

function setupReportsClassSelector() {
    const classSelect = document.getElementById('reportsClassSelect');
    if (classSelect) {
        classSelect.addEventListener('change', async function() {
            const selectedClass = this.value;
            if (selectedClass) {
                await loadClassReports(selectedClass);
            } else {
                clearReportsContainer();
            }
        });

        // Load default if any selected
        if (classSelect.value) {
            loadClassReports(classSelect.value);
        }
    }
}

async function loadClassReports(className) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const mentorId = currentUser ? currentUser.userId : null;

    if (!mentorId) {
        showNotification('Mentor not logged in', 'error');
        return;
    }

    const token = localStorage.getItem('jwtToken');

    try {
        // Fetch students for the class
        const studentsResponse = await fetch(`http://localhost:8080/api/mentors/${mentorId}/students/class/${className}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!studentsResponse.ok) {
            throw new Error(`Failed to fetch students: ${studentsResponse.statusText}`);
        }
        const students = await studentsResponse.json();

        // For each student, fetch current weekly report
        const studentsWithReports = [];
        for (const student of students) {
            try {
                const reportResponse = await fetch(`http://localhost:8080/api/reports/student/${student.id}/current`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (reportResponse.ok) {
                    const report = await reportResponse.json();
                    studentsWithReports.push({
                        id: student.id,
                        name: student.name,
                        email: student.email,
                        progress: report.progressPercentage || 0,
                        tasks: `${report.completedTasks || 0}/${report.totalTasks || 0}`,
                        week: report.week || 'Current Week'
                    });
                } else {
                    // Fallback if report not available
                    studentsWithReports.push({
                        id: student.id,
                        name: student.name,
                        email: student.email,
                        progress: 0,
                        tasks: '0/0',
                        week: 'No Report'
                    });
                }
            } catch (reportError) {
                console.error(`Error fetching report for student ${student.id}:`, reportError);
                studentsWithReports.push({
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    progress: 0,
                    tasks: '0/0',
                    week: 'Error Loading'
                });
            }
        }

        populateReportsContainer(studentsWithReports);
        showNotification(`Loaded reports for class ${className}`, 'success');
    } catch (error) {
        console.error('Error loading class reports:', error);
        showNotification(`Failed to load reports: ${error.message}`, 'error');
        clearReportsContainer();
    }
}

function populateReportsContainer(students) {
    const tableBody = document.getElementById('reportsTableBody');
    const noReportsMessage = document.getElementById('noReportsMessage');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (students.length === 0) {
        noReportsMessage.style.display = 'block';
        return;
    } else {
        noReportsMessage.style.display = 'none';
    }

    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="serial-cell">${index + 1}</td>
            <td>
                <div class="student-cell">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=4e54c8&color=fff&size=40" alt="${student.name}" class="student-avatar-small">
                    <div class="student-details">
                        <div class="student-name">${student.name}</div>
                        <div class="student-email">${student.email}</div>
                    </div>
                </div>
            </td>
            <td class="actions-cell">
                <div class="actions-buttons">
                    <a href="#" class="view-report-btn" onclick="viewStudentReport('${student.name}', '${student.email}', ${student.userId || student.id})">
                        <i class="fas fa-eye"></i> View Report
                    </a>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function clearReportsContainer() {
    const tableBody = document.getElementById('reportsTableBody');
    const noReportsMessage = document.getElementById('noReportsMessage');
    if (tableBody) tableBody.innerHTML = '';
    if (noReportsMessage) noReportsMessage.style.display = 'block';
}

function viewStudentReport(studentName, studentEmail, studentId) {
    // Navigate to the report page with student information
    const url = `report.html?studentId=${studentId}&studentName=${encodeURIComponent(studentName)}&studentEmail=${encodeURIComponent(studentEmail)}`;
    window.location.href = url;
}

// Reports functionality will be handled by report.js

// Load all assigned students for table view
async function loadAllAssignedStudents() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const mentorId = currentUser ? currentUser.userId : null;

    if (!mentorId) {
        showNotification('Mentor not logged in', 'error');
        return;
    }

    const token = localStorage.getItem('jwtToken');

    try {
        const response = await fetch(`http://localhost:8080/api/mentors/${mentorId}/students`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch students: ${response.statusText}`);
        }

        const students = await response.json();
        populateStudentsTable(students);
        showNotification(`Loaded ${students.length} students`, 'success');
    } catch (error) {
        console.error('Error loading students:', error);
        showNotification(`Failed to load students: ${error.message}`, 'error');
    }
}

// Populate students table
function populateStudentsTable(students) {
    const tableBody = document.getElementById('studentsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (students.length === 0) {
        const noStudentsRow = document.createElement('tr');
        noStudentsRow.innerHTML = `
            <td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">
                <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; color: #cbd5e0;"></i>
                <h3>No students found</h3>
                <p>No students assigned to you.</p>
            </td>
        `;
        tableBody.appendChild(noStudentsRow);
        return;
    }

    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="serial-cell">${index + 1}</td>
            <td>
                <div class="student-cell">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Unknown')}&background=4e54c8&color=fff&size=40" alt="${student.name || 'Student'}" class="student-avatar-small">
                    <div class="student-details">
                        <div class="student-name">${student.name || 'Unknown Student'}</div>
                        <div class="student-email">${student.email || 'No email'}</div>
                    </div>
                </div>
            </td>
            <td class="class-cell">${student.className || 'N/A'}</td>
            <td class="goals-cell">${student.goals ? student.goals.length : 0}</td>
            <td class="actions-cell">
                <div class="actions-buttons">
                    <button class="assign-btn" data-student-id="${student.id}" data-student-name="${student.name || 'Student'}">
                        <i class="fas fa-plus"></i> Assign Task
                    </button>
                    <button class="download-btn" data-student-id="${student.id}">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Setup event delegation for table buttons
    setupTableEventDelegation();
}

// Setup event delegation for table buttons
function setupTableEventDelegation() {
    const tableBody = document.getElementById('studentsTableBody');
    if (!tableBody) return;

    tableBody.addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;

        const studentId = target.getAttribute('data-student-id');
        const studentName = target.getAttribute('data-student-name');

        if (target.classList.contains('assign-btn')) {
            openTaskModal(studentName, 'individual');
        } else if (target.classList.contains('download-btn')) {
            downloadStudentReport(studentId);
        }
    });
}

// Assign task to student via API
async function assignTaskToStudent(taskData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const mentorId = currentUser ? currentUser.userId : null;

    if (!mentorId) {
        showNotification('Mentor not logged in', 'error');
        return;
    }

    const token = localStorage.getItem('jwtToken');

    try {
        // Find student by name to get ID
        const students = await getAllStudents();
        const student = students.find(s => s.name === taskData.assignee);

        if (!student) {
            showNotification('Student not found', 'error');
            return;
        }

        const payload = {
            title: taskData.title,
            description: taskData.description,
            dueDate: taskData.dueDate,
            studentId: student.id
        };

        const response = await fetch(`http://localhost:8080/api/mentors/${mentorId}/tasks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Failed to assign task: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Task assigned successfully:', result);

        // Update student statistics
        updateStudentStats(taskData);

        // Add to activity list
        addTaskToActivityList(taskData);

    } catch (error) {
        console.error('Error assigning task:', error);
        showNotification(`Failed to assign task: ${error.message}`, 'error');
    }
}

// Helper function to get all students
async function getAllStudents() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const mentorId = currentUser ? currentUser.userId : null;

    if (!mentorId) return [];

    const token = localStorage.getItem('jwtToken');

    try {
        const response = await fetch(`http://localhost:8080/api/mentors/${mentorId}/students`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return [];

        return await response.json();
    } catch (error) {
        console.error('Error fetching students:', error);
        return [];
    }
}
