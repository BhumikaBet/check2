// Report Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeReportPage();
});

function initializeReportPage() {
    // Check if this is detailed report page (with student params) or overview
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('studentId');

    if (studentId) {
        // Detailed report mode
        const studentName = urlParams.get('studentName');
        const studentEmail = urlParams.get('studentEmail');
        updateStudentInfo(studentId, studentName, studentEmail);
        fetchStudentReportData(studentId);
    } else {
        // Student own report mode
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.role === 'STUDENT') {
            const studentId = currentUser.userId;
            updateStudentInfo(studentId, currentUser.name, currentUser.email || 'student@email.com');
            fetchStudentReportData(studentId);
        } else {
            // Overview mode - setup class selector (for mentor)
            setupClassSelector();
        }
    }

    // Setup back button
    setupBackButton();
}

function setupClassSelector() {
    const classSelect = document.getElementById('reportsClassSelect');
    if (classSelect) {
        classSelect.addEventListener('change', function() {
            const selectedClass = this.value;
            if (selectedClass) {
                loadClassReports(selectedClass);
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

function loadClassReports(className) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const mentorId = currentUser ? currentUser.userId : null;

    if (!mentorId) {
        showNotification('Mentor not logged in', 'error');
        return;
    }

    const url = `http://localhost:8080/api/mentors/${mentorId}/students/class/${className}`;
    const token = localStorage.getItem('jwtToken');

    fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateReportsContainer(data);
            showNotification(`Loaded reports for class ${className}`, 'success');
        })
        .catch(error => {
            console.error('Error fetching students for reports:', error);
            showNotification('Failed to load students for reports. Please check your authentication.', 'error');
        });
}

function getMockClassData(className) {
    const mockStudents = {
        'A': [
            { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', progress: 73, tasks: '5/7', week: 'Week 1' },
            { id: 2, name: 'John Smith', email: 'john@example.com', progress: 85, tasks: '6/7', week: 'Week 1' }
        ],
        'B': [
            { id: 3, name: 'Michelle Davis', email: 'michelle@example.com', progress: 92, tasks: '7/7', week: 'Week 2' },
            { id: 4, name: 'Alex Wilson', email: 'alex@example.com', progress: 68, tasks: '4/7', week: 'Week 2' }
        ],
        'C': [
            { id: 5, name: 'Emma Brown', email: 'emma@example.com', progress: 81, tasks: '6/8', week: 'Week 3' },
            { id: 6, name: 'David Lee', email: 'david@example.com', progress: 55, tasks: '3/8', week: 'Week 3' }
        ]
    };
    return mockStudents[className] || [];
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
        const progressPercent = student.goalsSet > 0 ? Math.round((student.goalsCompleted / student.goalsSet) * 100) : 0;
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
            <td>
                <div class="progress-cell">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="progress-text">${progressPercent}%</span>
                </div>
            </td>
            <td class="tasks-cell">${student.goalsCompleted}/${student.goalsSet}</td>
            <td class="actions-cell">
                <div class="actions-buttons">
                    <a href="report.html?studentId=${student.student_id || student.user_id || student.user?.id || student.studentId || student.userId || student.id}&studentName=${encodeURIComponent(student.name)}&studentEmail=${encodeURIComponent(student.email)}" class="view-report-btn">
                        <i class="fas fa-eye"></i> View Report
                    </a>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function clearReportsContainer() {
    const container = document.getElementById('reportsContainer');
    if (container) {
        container.innerHTML = '<div class="no-data">Select a class to view reports</div>';
    }
}

function updateStudentInfo(studentId, studentName, studentEmail) {
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=4e54c8&color=fff&size=80`;

    const detailedStudentAvatar = document.getElementById('detailedStudentAvatar');
    const detailedStudentName = document.getElementById('detailedStudentName');
    const detailedStudentEmail = document.getElementById('detailedStudentEmail');

    if (detailedStudentAvatar) detailedStudentAvatar.src = avatar;
    if (detailedStudentName) detailedStudentName.textContent = studentName;
    if (detailedStudentEmail) detailedStudentEmail.textContent = studentEmail;

    // Update subtitle
    const sectionSubtitle = document.querySelector('.section-subtitle');
    if (sectionSubtitle) sectionSubtitle.textContent = `Detailed progress overview for ${studentName}`;
}

function fetchStudentReportData(studentId) {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        showNotification('No authentication token found. Please log in again.', 'error');
        return;
    }

    // Fetch history reports directly
    const historyUrl = `http://localhost:8080/api/reports/student/${studentId}/history`;

    fetch(historyUrl, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(async response => {
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Fetch failed with status:', response.status, response.statusText, 'Body:', errorText);
            throw new Error(`Failed to fetch report history: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(historyData => {
        const summaryData = computeSummaryData(historyData);
        updateReportSections(summaryData);
        populateDetailedReportTable(historyData);
    })
    .catch(error => {
        console.error('Error fetching report history:', error);
        showNotification('Failed to load report data. Using mock data.', 'warning');
        const mockHistory = getMockHistory();
        const summaryData = computeSummaryData(mockHistory);
        updateReportSections(summaryData);
        populateDetailedReportTable(mockHistory);
    });
}


function computeSummaryData(reports) {
    const totalWeeks = reports.length;
    const totalTasks = reports.reduce((sum, report) => sum + (report.totalTasks || report.totalCount || 0), 0);
    const completedTasks = reports.reduce((sum, report) => sum + (report.completedTasks || report.completedCount || 0), 0);
    const avgProgress = reports.length > 0 ? (reports.reduce((sum, report) => sum + (report.progressPercentage || report.completionPercentage || 0), 0) / reports.length).toFixed(0) : 0;
    const performanceRating = avgProgress >= 80 ? 'Excellent' : avgProgress >= 60 ? 'Good' : 'Needs Improvement';

    return {
        totalWeeks,
        totalTasks,
        completedTasks,
        avgProgress: parseInt(avgProgress),
        performanceRating,
        weeklyData: reports,
        successRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        avgScore: 84 // Mock average score
    };
}

function getMockHistory() {
    // Mock historical data for testing
    return [
        { weekId: 'Week 1', startDate: '2024-01-01', endDate: '2024-01-07', completedCount: 3, totalCount: 5, completionPercentage: 60 },
        { weekId: 'Week 2', startDate: '2024-01-08', endDate: '2024-01-14', completedCount: 4, totalCount: 6, completionPercentage: 67 },
        { weekId: 'Week 3', startDate: '2024-01-15', endDate: '2024-01-21', completedCount: 5, totalCount: 6, completionPercentage: 83 },
        { weekId: 'Week 4', startDate: '2024-01-22', endDate: '2024-01-28', completedCount: 6, totalCount: 7, completionPercentage: 86 },
        { weekId: 'Week 5', startDate: '2024-01-29', endDate: '2024-02-04', completedCount: 7, totalCount: 8, completionPercentage: 88 }
    ];
}



function updateReportSections(summaryData) {
    // Update summary cards using IDs from report.html
    const totalWeeks = document.getElementById('totalWeeks');
    const totalTasks = document.getElementById('totalTasks');
    const avgProgress = document.getElementById('avgProgress');

    if (totalWeeks) totalWeeks.textContent = summaryData.totalWeeks;
    if (totalTasks) totalTasks.textContent = summaryData.totalTasks;
    if (avgProgress) avgProgress.textContent = summaryData.avgProgress + '%';

    // Update weekly progress bars if present (for compatibility)
    if (typeof updateWeeklyProgress === 'function') {
        updateWeeklyProgress(summaryData.weeklyData);
    }

    // Update task performance table if present
    if (typeof updateTaskPerformanceTable === 'function') {
        updateTaskPerformanceTable(summaryData);
    }

    // Update feedback history if present
    if (typeof updateFeedbackHistory === 'function') {
        updateFeedbackHistory();
    }

    // Update recommendations if present
    if (typeof updateRecommendations === 'function') {
        updateRecommendations(summaryData);
    }
}

function populateDetailedReportTable(reports) {
    const tableBody = document.getElementById('detailedReportTableBody');

    if (tableBody) {
        tableBody.innerHTML = '';

        if (reports.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4" style="text-align: center; padding: 20px;">No report data available for this student.</td>`;
            tableBody.appendChild(row);
            return;
        }

        reports.forEach(report => {
            const row = document.createElement('tr');

            const weekId = report.weekId || 'N/A';
            const dates = report.startDate && report.endDate ? `${report.startDate} to ${report.endDate}` : 'N/A';
            const tasks = `${report.completedCount || 0}/${report.totalCount || 0}`;
            const progress = report.completionPercentage || 0;
            const status = 'completed'; // Default status as all reports are archived

            row.innerHTML = `
                <td>
                    <div class="week-info">
                        <strong>${weekId}</strong>
                    </div>
                </td>
                <td>
                    <div class="date-range">
                        ${dates}
                    </div>
                </td>
                <td>
                    <div class="task-status">
                        <span class="status-dot ${status}"></span>
                        <span class="task-${status}">${tasks}</span>
                    </div>
                </td>
                <td>
                    <div class="detailed-progress-cell">
                        <div class="detailed-progress-container">
                            <div class="detailed-progress-bar">
                                <div class="detailed-progress-fill" style="width: ${progress}%; background: linear-gradient(135deg, #4e54c8, #8f94fb);"></div>
                            </div>
                            <span class="detailed-progress-text">${progress}%</span>
                        </div>
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }
}



function updateWeeklyProgress(weeklyData) {
    const progressWeekItems = document.querySelectorAll('.progress-week-item');
    weeklyData.slice(0, 5).forEach((report, index) => { // Show first 5 weeks
        if (progressWeekItems[index]) {
            const weekLabel = progressWeekItems[index].querySelector('.week-label');
            const progressFill = progressWeekItems[index].querySelector('.progress-fill-small');
            const progressPercent = progressWeekItems[index].querySelector('.progress-percent-small');

            if (weekLabel) weekLabel.textContent = `Week ${index + 1}`;
            if (progressFill) progressFill.style.width = (report.progressPercentage || 0) + '%';
            if (progressPercent) progressPercent.textContent = (report.progressPercentage || 0) + '%';
        }
    });
}

function updateTaskPerformanceTable(summaryData) {
    // Mock categories data; in real, fetch from backend or compute
    const categories = [
        { name: 'Reading Comprehension', assigned: 8, completed: 7, rate: 88, score: '85/100' },
        { name: 'Writing Practice', assigned: 6, completed: 5, rate: 83, score: '78/100' },
        { name: 'Listening Skills', assigned: 5, completed: 4, rate: 80, score: '82/100' },
        { name: 'Speaking Practice', assigned: 5, completed: 4, rate: 80, score: '90/100' }
    ];
    const totalRow = {
        name: 'Total',
        assigned: summaryData.totalTasks,
        completed: summaryData.completedTasks,
        rate: summaryData.successRate,
        score: `${summaryData.avgScore}/100`
    };

    const tbody = document.querySelector('.task-performance-table tbody');
    if (tbody) {
        tbody.innerHTML = '';
        categories.forEach(cat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cat.name}</td>
                <td>${cat.assigned}</td>
                <td>${cat.completed}</td>
                <td>${cat.rate}%</td>
                <td>${cat.score}</td>
            `;
            tbody.appendChild(row);
        });
        const totalTr = document.createElement('tr');
        totalTr.className = 'total-row';
        totalTr.innerHTML = `
            <td><strong>Total</strong></td>
            <td><strong>${totalRow.assigned}</strong></td>
            <td><strong>${totalRow.completed}</strong></td>
            <td><strong>${totalRow.rate}%</strong></td>
            <td><strong>${totalRow.score}</strong></td>
        `;
        tbody.appendChild(totalTr);
    }
}

function updateFeedbackHistory() {
    // Mock feedback; in real, fetch from /api/feedback/student/{id}
    const feedbackItems = document.querySelectorAll('.feedback-item');
    const mockFeedback = [
        { type: 'positive', date: 'Oct 15, 2024', text: 'Excellent improvement in writing structure. Keep focusing on vocabulary expansion.', author: 'John Doe, Mentor' },
        { type: 'neutral', date: 'Oct 8, 2024', text: 'Good effort on listening tasks. Try to note down key points during practice.', author: 'John Doe, Mentor' },
        { type: 'improve', date: 'Oct 1, 2024', text: 'Speaking needs more practice. Work on pronunciation and fluency next week.', author: 'John Doe, Mentor' }
    ];

    mockFeedback.forEach((fb, index) => {
        if (feedbackItems[index]) {
            const item = feedbackItems[index];
            item.className = `feedback-item ${fb.type}`;
            const header = item.querySelector('.feedback-header');
            const text = item.querySelector('.feedback-text');
            const author = item.querySelector('.feedback-author');
            if (header) {
                header.innerHTML = `<i class="fas fa-smile feedback-icon"></i><span class="feedback-date">${fb.date}</span>`; // Adjust icon based on type
                if (fb.type === 'neutral') header.querySelector('i').className = 'fas fa-meh feedback-icon';
                if (fb.type === 'improve') header.querySelector('i').className = 'fas fa-exclamation-triangle feedback-icon';
            }
            if (text) text.textContent = `"${fb.text}"`;
            if (author) author.textContent = fb.author;
        }
    });
}

function updateRecommendations(summaryData) {
    // Static/mock recommendations based on progress
    const focusAreas = summaryData.avgProgress < 80 ? ['Improve speaking fluency', 'Expand vocabulary usage', 'Practice time management'] : ['Maintain current progress', 'Advanced reading challenges'];
    const nextGoals = ['Complete 2 writing assignments', 'Practice 3 speaking sessions', 'Review listening comprehension'];
    const timeline = 'Next review in 1 week (Oct 22, 2024)\nQuarterly assessment in 3 weeks';

    const recCards = document.querySelectorAll('.recommendation-card');
    if (recCards[0]) {
        recCards[0].querySelector('ul').innerHTML = focusAreas.map(li => `<li>${li}</li>`).join('');
    }
    if (recCards[1]) {
        recCards[1].querySelector('ul').innerHTML = nextGoals.map(li => `<li>${li}</li>`).join('');
    }
    if (recCards[2]) {
        recCards[2].querySelector('p').innerHTML = timeline.replace('\n', '<br>');
    }
}

// Add showNotification function if not present (from mentor.js)
function showNotification(message, type = 'info') {
    // Reuse the same notification function from mentor.js
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback simple alert
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Setup back button
function setupBackButton() {
    // Add back button to top bar if not present
    const topBar = document.querySelector('.top-bar .breadcrumb');
    if (topBar && !topBar.querySelector('.back-btn')) {
        const backBtn = document.createElement('a');
        backBtn.className = 'back-btn';
        backBtn.href = '#';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Reports';
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.history.back();
        });
        topBar.prepend(backBtn);
    }
}

// Mock function for openFeedbackPanel if needed
function openFeedbackPanel(studentId, studentName) {
    // Navigate to feedback page
    window.location.href = `feedback.html?studentId=${studentId}&studentName=${encodeURIComponent(studentName)}`;
}

