 // Combined JavaScript from report.js, detailed-report.js, and report-page.js

// Initialize reports functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the reports table page
    if (document.getElementById('reportsTableBody')) {
        initializeReports();
    } else {
        setupReportsFunctionality();
    }
});

// Main reports setup function
function setupReportsFunctionality() {
    // Setup view report buttons
    setupViewReportButtons();

    // Setup download report buttons
    setupDownloadReportButtons();

    // Setup report filters
    setupReportFilters();

    // Setup report search functionality
    setupReportSearch();

    console.log('Reports functionality initialized');
}

// Setup view report buttons - delegate to detailed report system
function setupViewReportButtons() {
    const viewReportButtons = document.querySelectorAll('.view-report-btn');

    viewReportButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Let the detailed report system handle this
            // The detailed-report.js will handle the actual functionality
            console.log('View report button clicked - handled by detailed report system');
        });
    });
}

// Setup download report buttons
function setupDownloadReportButtons() {
    const downloadReportButtons = document.querySelectorAll('.download-report-btn');

    downloadReportButtons.forEach(button => {
        button.addEventListener('click', function() {
            const studentCard = this.closest('.report-card');
            const studentName = studentCard.querySelector('.report-name').textContent;

            // Simulate report download
            showNotification(`Generating detailed report for ${studentName}...`, 'info');

            setTimeout(() => {
                showNotification(`Detailed report for ${studentName} downloaded successfully!`, 'success');

                // In a real application, this would trigger actual download
                // const link = document.createElement('a');
                // link.href = `/api/reports/detailed/${studentName.replace(' ', '_')}`;
                // link.download = `${studentName}_detailed_report.pdf`;
                // link.click();
            }, 2000);
        });
    });
}

// Setup report filters
function setupReportFilters() {
    const reportPeriod = document.getElementById('reportPeriod');
    const reportType = document.getElementById('reportType');
    const generateReportBtn = document.getElementById('generateReport');

    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', function() {
            const period = reportPeriod ? reportPeriod.value : 'month';
            const type = reportType ? reportType.value : 'all';

            showNotification(`Generating ${type} report for ${period}...`, 'info');

            // Simulate report generation
            setTimeout(() => {
                showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} report for ${period} generated successfully!`, 'success');

                // In a real application, this would trigger actual report generation
                // and possibly update the report cards with new data
            }, 3000);
        });
    }
}

// Setup report search functionality
function setupReportSearch() {
    const reportSearch = document.getElementById('reportSearch');
    const clearReportSearch = document.getElementById('clearReportSearch');
    const reportCards = document.querySelectorAll('.report-card');

    // Create a no results message element
    let noResultsMessage = null;

    // Handle search input
    if (reportSearch) {
        reportSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            filterReports(searchTerm);
        });

        // Handle search on Enter key
        reportSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchTerm = this.value.toLowerCase().trim();
                filterReports(searchTerm);
            }
        });
    }

    // Handle clear search button
    if (clearReportSearch) {
        clearReportSearch.addEventListener('click', function() {
            if (reportSearch) {
                reportSearch.value = '';
                filterReports('');
            }
        });
    }

    function filterReports(searchTerm) {
        let visibleCount = 0;
        let hasResults = false;

        reportCards.forEach(card => {
            const studentName = card.querySelector('.report-name').textContent.toLowerCase();
            const studentEmail = card.querySelector('.report-email').textContent.toLowerCase();

            // Check if search term matches name or email
            const matchesName = studentName.includes(searchTerm);
            const matchesEmail = studentEmail.includes(searchTerm);
            const matches = matchesName || matchesEmail;

            if (searchTerm === '' || matches) {
                card.style.display = 'block';
                card.classList.remove('hidden');
                visibleCount++;
                hasResults = true;
            } else {
                card.style.display = 'none';
                card.classList.add('hidden');
            }
        });

        // Show/hide no results message
        updateNoResultsMessage(hasResults, searchTerm);
    }

    function updateNoResultsMessage(hasResults, searchTerm) {
        // Remove existing no results message
        if (noResultsMessage) {
            noResultsMessage.remove();
            noResultsMessage = null;
        }

        // Show no results message if needed
        if (!hasResults && searchTerm !== '') {
            noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-reports';
            noResultsMessage.innerHTML = `
                <i class="fas fa-chart-bar"></i>
                <h4>No reports found</h4>
                <p>No reports match your search for "${searchTerm}". Try a different search term.</p>
            `;

            // Insert after the report filters
            const reportFilters = document.querySelector('.report-filters');
            const reportsGrid = document.querySelector('.reports-grid');

            if (reportFilters && reportsGrid) {
                reportFilters.parentNode.insertBefore(noResultsMessage, reportsGrid);
            }
        }
    }
}

// Show detailed report modal
function showDetailedReport(studentName, studentEmail) {
    // Create detailed report modal
    const modal = document.createElement('div');
    modal.className = 'report-modal';
    modal.innerHTML = `
        <div class="report-modal-content">
            <div class="report-modal-header">
                <h3>Detailed Report - ${studentName}</h3>
                <span class="report-close-btn">&times;</span>
            </div>
            <div class="report-modal-body">
                <div class="report-student-info">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random&size=80" alt="${studentName}" class="report-modal-avatar">
                    <div class="report-student-details">
                        <h4>${studentName}</h4>
                        <p>${studentEmail}</p>
                        <div class="report-status">
                            <span class="status-badge active">Active Student</span>
                        </div>
                    </div>
                </div>

                <div class="report-sections">
                    <div class="report-section">
                        <h5>Progress Overview</h5>
                        <div class="progress-stats">
                            <div class="stat-item">
                                <span class="stat-label">Overall Progress:</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 75%;"></div>
                                </div>
                                <span class="stat-value">75%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Goals Completed:</span>
                                <span class="stat-value">6/8</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Current Streak:</span>
                                <span class="stat-value">12 days</span>
                            </div>
                        </div>
                    </div>

                    <div class="report-section">
                        <h5>Recent Activity</h5>
                        <ul class="activity-timeline">
                            <li class="timeline-item">
                                <div class="timeline-date">2024-01-15</div>
                                <div class="timeline-content">
                                    <h6>Assignment Completed</h6>
                                    <p>Completed "Advanced JavaScript Concepts" assignment with excellent performance.</p>
                                </div>
                            </li>
                            <li class="timeline-item">
                                <div class="timeline-date">2024-01-12</div>
                                <div class="timeline-content">
                                    <h6>Feedback Received</h6>
                                    <p>Received positive feedback on project presentation skills.</p>
                                </div>
                            </li>
                            <li class="timeline-item">
                                <div class="timeline-date">2024-01-10</div>
                                <div class="timeline-content">
                                    <h6>Goal Updated</h6>
                                    <p>Updated learning goals to focus on backend development.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="report-section">
                        <h5>Performance Metrics</h5>
                        <div class="metrics-grid">
                            <div class="metric-card">
                                <div class="metric-value">95%</div>
                                <div class="metric-label">Assignment Completion</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">8.5/10</div>
                                <div class="metric-label">Average Grade</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">92%</div>
                                <div class="metric-label">Attendance Rate</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-value">4.8/5</div>
                                <div class="metric-label">Feedback Rating</div>
                            </div>
                        </div>
                    </div>

                    <div class="report-section">
                        <h5>Recent Feedback</h5>
                        <div class="feedback-preview">
                            <div class="feedback-item">
                                <div class="feedback-type positive">Positive</div>
                                <p>"Excellent work on the recent project! Your attention to detail and creative approach really stood out."</p>
                                <div class="feedback-date">2024-01-15</div>
                            </div>
                            <div class="feedback-item">
                                <div class="feedback-type neutral">Neutral</div>
                                <p>"Good progress on the fundamentals. Consider focusing more on the advanced concepts in the next session."</p>
                                <div class="feedback-date">2024-01-10</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1002;
    `;

    const modalContent = modal.querySelector('.report-modal-content');
    if (modalContent) {
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            ov  erflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        `;
    }

    // Add styles for modal content
    const style = document.createElement('style');
    style.textContent = `
        .report-modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .report-modal-header h3 {
            margin: 0;
            color: #1f2937;
            font-size: 1.25rem;
        }

        .report-close-btn {
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
            line-height: 1;
        }

        .report-close-btn:hover {
            color: #374151;
        }

        .report-modal-body {
            padding: 24px;
        }

        .report-student-info {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
        }

        .report-modal-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
        }

        .report-student-details h4 {
            margin: 0 0 4px 0;
            color: #1f2937;
            font-size: 1.125rem;
        }

        .report-student-details p {
            margin: 0 0 8px 0;
            color: #6b7280;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            background: #10b981;
            color: white;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .report-section {
        }

        .report-section h5 {
            margin: 0 0 12px 0;
            color: #374151;
            font-size: 1rem;
        }

        .progress-stats {
            display: grid;
            gap: 12px;
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .stat-label {
            min-width: 120px;
            color: #6b7280;
        }

        .progress-bar {
            flex: 1;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 4px;
        }

        .activity-timeline {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .timeline-item {
            display: flex;
            gap: 16px;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .timeline-item:last-child {
            border-bottom: none;
        }

        .timeline-date {
            min-width: 80px;
            font-size: 0.875rem;
            color: #6b7280;
            font-weight: 500;
        }

        .timeline-content h6 {
            margin: 0 0 4px 0;
            color: #374151;
            font-size: 0.875rem;
        }

        .timeline-content p {
            margin: 0;
            color: #6b7280;
            font-size: 0.875rem;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
        }

        .metric-card {
            text-align: center;
            padding: 16px;
            background: #f8fafc;
            border-radius: 8px;
        }

        .metric-value {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
        }

        .metric-label {
            font-size: 0.875rem;
            color: #6b7280;
        }

        .feedback-preview {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .feedback-item {
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #10b981;
        }

        .feedback-type {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            margin-bottom: 8px;
        }

        .feedback-type.positive {
            background: #dcfce7;
            color: #166534;
        }

        .feedback-type.neutral {
            background: #fef3c7;
            color: #92400e;
        }

        .feedback-date {
            font-size: 0.75rem;
            color: #6b7280;
            margin-top: 8px;
        }

        .report-modal-footer {
            padding: 20px 24px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }

        .btn-secondary, .btn-primary {
            padding: 8px 16px;
            border-radius: 6px;
            border: none;
            font-size: 0.875rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .btn-secondary {
            background: #f3f4f6;
            color: #374151;
        }

        .btn-secondary:hover {
            background: #e5e7eb;
        }

        .btn-primary {
            background: #4e54c8;
            color: white;
        }

        .btn-primary:hover {
            background: #4338ca;
        }

        /* Feedback type button styles */
        .type-btn {
            padding: 10px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.875rem;
            font-weight: 500;
            display: inline-block;
            margin: 0 4px;
        }

        .type-btn:hover {
            border-color: #4e54c8;
            background: #f8fafc;
        }

        .type-btn.selected {
            border-color: #4e54c8;
            background: #4e54c8;
            color: white;
        }
    `;
    document.head.appendChild(style);

    // Add event listeners
    const closeBtn = modal.querySelector('.report-close-btn');
    const printBtn = modal.querySelector('#printReport');
    const downloadBtn = modal.querySelector('#downloadDetailedReport');

    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        }
    });

    printBtn.addEventListener('click', function() {
        showNotification('Printing report...', 'info');
        // In a real application, this would trigger print functionality
        setTimeout(() => {
            showNotification('Report printed successfully!', 'success');
        }, 1000);
    });

    downloadBtn.addEventListener('click', function() {
        showNotification('Downloading detailed report...', 'info');
        setTimeout(() => {
            showNotification('Detailed report downloaded successfully!', 'success');
            // In a real application, this would trigger actual download
        }, 2000);
    });

    // Add to page
    document.body.appendChild(modal);

    // Show notification
    showNotification(`Opening detailed report for ${studentName}`, 'info');
}

// Notification system (shared utility)
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


function getStudentNameFromValue(value) {
    const studentMap = {
        'sarah': 'Sarah Johnson',
        'john': 'John Smith',
        'michelle': 'Michelle Davis',
        'alex': 'Alex Wilson',
        'emma': 'Emma Brown',
        'david': 'David Lee'
    };

    return studentMap[value] || 'Unknown Student';
}

function getStudentValueFromName(name) {
    const nameMap = {
        'Sarah Johnson': 'sarah',
        'John Smith': 'john',
        'Michelle Davis': 'michelle',
        'Alex Wilson': 'alex',
        'Emma Brown': 'emma',
        'David Lee': 'david'
    };

    return nameMap[name] || '';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Reports functionality for table view
function initializeReports() {
    // Update profile with logged-in user
    updateProfile();

    // Logout functionality
    setupLogout();

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

// Add CSS animations for notifications
if (!window.notificationAnimationStyleAdded) {
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
    window.notificationAnimationStyleAdded = true;
}

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
                const studentId = student.userId || student.id;
                const reportResponse = await fetch(`http://localhost:8080/api/reports/student/${studentId}/current`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (reportResponse.ok) {
                    const report = await reportResponse.json();
                    console.log(`Report for student ${studentId}:`, report);
                    studentsWithReports.push({
                        id: studentId,
                        name: student.name,
                        email: student.email,
                        progress: report.completionPercentage || 0,
                        tasks: `${report.completedCount || 0}/${report.totalCount || 0}`,
                        week: report.weekStartDate && report.weekEndDate ? `${report.weekStartDate} to ${report.weekEndDate}` : 'Current Week'
                    });
                } else {
                    // Fallback if report not available
                    studentsWithReports.push({
                        id: studentId,
                        name: student.name,
                        email: student.email,
                        progress: 0,
                        tasks: '0/0',
                        week: 'No Report'
                    });
                }
            } catch (reportError) {
                console.error(`Error fetching report for student ${studentId}:`, reportError);
                studentsWithReports.push({
                    id: studentId,
                    name: student.name,
                    email: student.email,
                    progress: 0,
                    tasks: '0/0',
                    week: 'Error Loading'
                });
            }
        }

        populateReportsContainer(studentsWithReports);
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
                    <a href="#" class="view-report-btn" onclick="viewStudentReport('${student.name}', '${student.email}', ${student.id})">
                        <i class="fas fa-eye"></i> View Report
                    </a>
                    <button class="btn-secondary f1-btn" onclick="f1Action(${student.id}, '${student.name}')">Feedback</button>
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

async function viewStudentReport(studentName, studentEmail, studentId) {
    // Show detailed report view instead of navigating to new page
    await showDetailedReportView(studentName, studentEmail, studentId);
}

function f1Action(studentId, studentName) {
    // For now, use the custom feedback panel since the full feedback system
    // is designed for specific hardcoded students, but reports show real API students
    openSidePanel(studentName, studentId);
}

function getStudentValueFromId(studentId) {
    const idToValueMap = {
        1: 'sarah',
        2: 'john',
        3: 'michelle',
        4: 'alex',
        5: 'emma',
        6: 'david'
    };
    return idToValueMap[studentId] || '';
}

function openSidePanel(studentName, studentId) {
    // Check if panel already exists
    if (document.getElementById('feedback-panel')) return;

    // Create feedback panel container
    const feedbackPanel = document.createElement('div');
    feedbackPanel.id = 'feedback-panel';
    feedbackPanel.className = 'feedback-panel';
    feedbackPanel.innerHTML = `
        <div class="feedback-panel-header">
            <h3>Give Feedback - ${studentName}</h3>
            <button id="close-feedback-panel" class="close-feedback-panel">×</button>
        </div>
        <div class="feedback-panel-content">
            <section class="feedback-form-section">
                <div class="feedback-form-container">
                    <div class="selected-student-info">
                        <div class="selected-student-header">
                            <div class="student-icon">🎓</div>
                            <h4>SELECTED STUDENT</h4>
                        </div>
                        <div class="selected-student-details">
                            <span id="selectedStudentName" class="selected-student-name">${studentName}</span>
                            <p class="selected-student-note">Feedback will be given to this student</p>
                        </div>
                    </div>

                    <form class="feedback-form" id="feedback-form">
                        <div class="form-group feedback-type-buttons">
                            <label class="type-label">
                                <input type="radio" name="feedbackType" value="positive" class="type-radio">
                                <span class="type-btn">😊 Positive</span>
                            </label>
                            <label class="type-label">
                                <input type="radio" name="feedbackType" value="neutral" class="type-radio">
                                <span class="type-btn">😐 Neutral</span>
                            </label>
                            <label class="type-label">
                                <input type="radio" name="feedbackType" value="improve" class="type-radio">
                                <span class="type-btn">⚠️ Needs Improvement</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label for="feedbackText">Feedback:</label>
                            <textarea id="feedbackText" name="feedback" placeholder="Enter your detailed feedback here..."></textarea>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn-primary" disabled>Submit Feedback</button>
                        </div>
                    </form>
                </div>
            </section>

            <section class="feedback-history-section">
                <div class="feedback-history-container">
                    <div class="history-header">
                        <h4>Feedback History</h4>
                        <div class="history-controls">
                            <select class="history-filter" aria-label="Filter feedback history">
                                <option>All Types</option>
                            </select>
                        </div>
                    </div>
                    <div class="history-subtitle">Feedback history for ${studentName}</div>
                    <div class="feedback-history-list" id="feedback-history-list">
                        <div class="no-feedback-message">
                            <p>No feedback history available yet.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;

    // Append to body
    document.body.appendChild(feedbackPanel);

    // Add styles for the feedback panel
    const feedbackPanelStyle = document.createElement('style');
    feedbackPanelStyle.textContent = `
        .feedback-panel {
            position: fixed;
            top: 0;
            right: -500px;
            width: 500px;
            height: 100vh;
            background: white;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            transition: right 0.3s ease;
            display: flex;
            flex-direction: column;
        }

        .feedback-panel.open {
            right: 0;
        }

        .feedback-panel-header {
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
        }

        .feedback-panel-header h3 {
            margin: 0;
            color: #1f2937;
            font-size: 1.125rem;
        }

        .close-feedback-panel {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
            line-height: 1;
        }

        .close-feedback-panel:hover {
            color: #374151;
        }

        .feedback-panel-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
        }

        .feedback-form-section {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            border-bottom: 1px solid #e5e7eb;
        }

        .feedback-history-section {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }

        .selected-student-info {
            margin-bottom: 20px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .selected-student-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }

        .student-icon {
            font-size: 1.25rem;
        }

        .selected-student-header h4 {
            margin: 0;
            color: #374151;
            font-size: 0.875rem;
            font-weight: 600;
        }

        .selected-student-name {
            font-weight: 600;
            color: #1f2937;
        }

        .selected-student-note {
            margin: 4px 0 0 0;
            color: #6b7280;
            font-size: 0.875rem;
        }

        .form-group {
            margin-bottom: 16px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #374151;
            font-weight: 500;
        }

        .feedback-type-buttons {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
        }

        .type-label {
            position: relative;
        }

        .type-radio {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
        }

        .type-btn {
            display: inline-block;
            padding: 10px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.875rem;
            font-weight: 500;
        }

        .type-btn:hover {
            border-color: #4e54c8;
            background: #f8fafc;
        }

        .type-btn.selected {
            border-color: #4e54c8;
            background: #4e54c8;
            color: white;
        }

        textarea {
            width: 100%;
            min-height: 100px;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-family: inherit;
            font-size: 0.875rem;
            resize: vertical;
        }

        textarea:focus {
            outline: none;
            border-color: #4e54c8;
            box-shadow: 0 0 0 3px rgba(78, 84, 200, 0.1);
        }

        .form-actions {
            margin-top: 20px;
        }

        .btn-primary {
            background: #4e54c8;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            transition: background-color 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
            background: #4338ca;
        }

        .btn-primary:disabled {
            background: #d1d5db;
            cursor: not-allowed;
        }

        .history-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .history-header h4 {
            margin: 0;
            color: #1f2937;
        }

        .history-filter {
            padding: 6px 12px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            background: white;
            font-size: 0.875rem;
        }

        .history-subtitle {
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 16px;
        }

        .feedback-history-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .feedback-history-item {
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            margin-bottom: 8px;
        }

        .feedback-history-item:last-child {
            margin-bottom: 0;
        }

        .feedback-type {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            margin-bottom: 8px;
        }

        .feedback-type.POSITIVE {
            background: #dcfce7;
            color: #166534;
        }

        .feedback-type.NEUTRAL {
            background: #fef3c7;
            color: #92400e;
        }

        .feedback-type.NEEDS_IMPROVEMENT {
            background: #fee2e2;
            color: #991b1b;
        }

        .feedback-text {
            color: #374151;
            margin-bottom: 8px;
            line-height: 1.5;
        }

        .feedback-date {
            color: #6b7280;
            font-size: 0.75rem;
        }

        .no-feedback-message {
            text-align: center;
            color: #6b7280;
            font-style: italic;
            padding: 40px 20px;
        }
    `;
    document.head.appendChild(feedbackPanelStyle);

    // Add open class to trigger animation
    setTimeout(() => {
        feedbackPanel.classList.add('open');
    }, 10);

    // Setup feedback functionality
    setupFeedbackFunctionality(feedbackPanel, studentId);

    // Load feedback history immediately
    updateFeedbackHistoryInPanel(studentId, feedbackPanel);

    // Add event listener for close button
    const closeBtn = feedbackPanel.querySelector('#close-feedback-panel');
    closeBtn.addEventListener('click', () => {
        feedbackPanel.classList.remove('open');
        setTimeout(() => {
            if (feedbackPanel.parentNode) {
                document.body.removeChild(feedbackPanel);
            }
        }, 300); // Match transition duration
    });
}

function setupFeedbackFunctionality(panel, studentId) {
    let selectedFeedbackType = null;
    const submitBtn = panel.querySelector('.btn-primary');
    const feedbackText = panel.querySelector('#feedbackText');
    const typeRadios = panel.querySelectorAll('.type-radio');

    // Setup feedback type radio button changes
    typeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            selectedFeedbackType = this.value;
            // Update visual selection
            typeRadios.forEach(r => {
                const label = r.parentElement;
                const span = label.querySelector('.type-btn');
                if (r.checked) {
                    span.classList.add('selected');
                } else {
                    span.classList.remove('selected');
                }
            });
            checkFormValidity();
        });
    });

    // Setup textarea input
    feedbackText.addEventListener('input', checkFormValidity);

    // Setup form submission
    const form = panel.querySelector('#feedback-form');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitFeedbackFromPanel(studentId, selectedFeedbackType, feedbackText.value.trim(), panel);
    });

    function checkFormValidity() {
        const hasType = selectedFeedbackType !== null;
        const hasText = feedbackText.value.trim().length > 0;
        submitBtn.disabled = !(hasType && hasText);
    }
}

async function submitFeedbackFromPanel(studentId, feedbackType, feedbackText, panel) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const mentorId = currentUser ? currentUser.userId : null;

    if (!mentorId || !studentId || !feedbackType || !feedbackText) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Map frontend types to backend enum values
    const typeMapping = {
        'positive': 'POSITIVE',
        'neutral': 'NEUTRAL',
        'improve': 'NEEDS_IMPROVEMENT'
    };
    const backendType = typeMapping[feedbackType] || feedbackType;

    const token = localStorage.getItem('jwtToken');

    try {
        const response = await fetch(`http://localhost:8080/api/mentors/${mentorId}/feedback/student/${studentId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                feedbackChoice: backendType,
                feedbackText: feedbackText
            })
        });

        if (response.ok) {
            showNotification('Feedback submitted successfully!', 'success');
            // Clear form
            panel.querySelector('#feedbackText').value = '';
            panel.querySelectorAll('.type-radio').forEach(radio => radio.checked = false);
            panel.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('selected'));
            panel.querySelector('.btn-primary').disabled = true;
            // Update feedback history
            updateFeedbackHistoryInPanel(studentId, panel);
        } else {
            let errorMessage = 'Unknown error';
            try {
                // Only try to parse JSON if response has content
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
                } else {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
            } catch (parseError) {
                // If JSON parsing fails, use status text
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            showNotification(`Failed to submit feedback: ${errorMessage}`, 'error');
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showNotification('Failed to submit feedback. Please try again.', 'error');
    }
}

async function updateFeedbackHistoryInPanel(studentId, panel) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const mentorId = currentUser ? currentUser.userId : null;

    if (!mentorId || !studentId) return;

    const token = localStorage.getItem('jwtToken');

    try {
        const response = await fetch(`http://localhost:8080/api/mentors/${mentorId}/feedback/student/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const feedbackHistory = await response.json();
            const historyList = panel.querySelector('#feedback-history-list');

            if (feedbackHistory && feedbackHistory.length > 0) {
                historyList.innerHTML = '';
                feedbackHistory.forEach(feedback => {
                    const feedbackItem = document.createElement('div');
                    feedbackItem.className = 'feedback-history-item';
                    feedbackItem.innerHTML = `
                        <div class="feedback-type">${feedback.feedbackChoice}</div>
                        <div class="feedback-text">${feedback.feedbackText}</div>
                        <div class="feedback-date">${new Date(feedback.createdAt).toLocaleDateString()}</div>
                    `;
                    historyList.appendChild(feedbackItem);
                });
            } else {
                historyList.innerHTML = '<div class="no-feedback-message"><p>No feedback history available yet.</p></div>';
            }
        } else {
            console.error('Failed to fetch feedback history');
            const historyList = panel.querySelector('#feedback-history-list');
            historyList.innerHTML = '<div class="no-feedback-message"><p>Failed to load feedback history.</p></div>';
        }
    } catch (error) {
        console.error('Error fetching feedback history:', error);
        const historyList = panel.querySelector('#feedback-history-list');
        historyList.innerHTML = '<div class="no-feedback-message"><p>Error loading feedback history.</p></div>';
    }
}
