    // Student Panel functionality
    function setupStudentPanel() {
        // Setup modal functionality
        setupTaskModal();

        // Setup individual task assignment
        setupIndividualTaskAssignment();

        // Setup batch task assignment
        setupBatchTaskAssignment();

        // Setup students class selector
        setupStudentsClassSelector();

        // Setup download report functionality
        setupDownloadReports();

        // Setup student search functionality - called separately after data load
    }

    // Global for search rows
    let originalRows = [];

    function setupTaskModal() {
        const modal = document.getElementById('taskModal');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelTask');

        // Close modal when clicking close button
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                closeTaskModal();
            });
        }

        // Close modal when clicking cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                closeTaskModal();
            });
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeTaskModal();
                }
            });
        }

        // Handle form submission
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', function(e) {
                e.preventDefault();
                submitTaskAssignment();
            });
        }
    }

    function setupIndividualTaskAssignment() {
        const assignButtons = document.querySelectorAll('.assign-btn');

        assignButtons.forEach(button => {
            button.addEventListener('click', function() {
                const studentCard = this.closest('.student-card');
                const studentName = studentCard.querySelector('.student-name').textContent;
                const studentEmail = studentCard.querySelector('.student-email').textContent;

                openTaskModal(studentName, 'individual');
            });
        });
    }

    function setupBatchTaskAssignment() {
        const batchAssignBtn = document.getElementById('batchAssignBtn');

        if (batchAssignBtn) {
            batchAssignBtn.addEventListener('click', function() {
                const batchSelect = document.getElementById('batchSelect');
                const selectedBatch = batchSelect.value;

                if (!selectedBatch) {
                    showNotification('Please select a batch first', 'error');
                    return;
                }

                openTaskModal(`Batch ${selectedBatch.toUpperCase()}`, 'batch', null, selectedBatch);
            });
        }
    }

    function setupDownloadReports() {
        const downloadButtons = document.querySelectorAll('.download-btn');

        downloadButtons.forEach(button => {
            button.addEventListener('click', function() {
                const studentCard = this.closest('.student-card');
                const studentName = studentCard.querySelector('.student-name').textContent;

                // Simulate report download
                showNotification(`Generating report for ${studentName}...`, 'info');

                setTimeout(() => {
                    showNotification(`Report for ${studentName} downloaded successfully!`, 'success');

                    // In a real application, this would trigger actual download
                    // const link = document.createElement('a');
                    // link.href = `/api/reports/${studentName.replace(' ', '_')}`;
                    // link.download = `${studentName}_report.pdf`;
                    // link.click();
                }, 2000);
            });
        });
    }

    function openTaskModal(studentOrBatch, type, studentId = null, className = null) {
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');

        if (modal && modalTitle) {
            modalTitle.textContent = `Assign Task to ${studentOrBatch}`;
            modal.classList.add('show');

            // Store assignment type and assignee info for form submission
            window.currentAssignmentType = type;
            window.currentAssignee = studentOrBatch;
            window.currentAssigneeId = studentId;
            window.currentClassName = className;

            // Reset form
            const taskForm = document.getElementById('taskForm');
            if (taskForm) {
                taskForm.reset();
            }
        }
    }

    function closeTaskModal() {
        const modal = document.getElementById('taskModal');

        if (modal) {
            modal.classList.remove('show');

            // Clear stored data
            window.currentAssignmentType = null;
            window.currentAssignee = null;
            window.currentAssigneeId = null;
            window.currentClassName = null;
        }
    }


    async function submitTaskAssignment() {
        const taskTitle = document.getElementById('taskTitle');
        const taskDescription = document.getElementById('taskDescription');
        const taskDeadline = document.getElementById('taskDeadline');

        // Validate form
        if (!taskTitle.value.trim()) {
            showNotification('Please enter a task title', 'error');
            return;
        }

        if (!taskDescription.value.trim()) {
            showNotification('Please enter a task description', 'error');
            return;
        }

        if (!taskDeadline.value) {
            showNotification('Please select a deadline', 'error');
            return;
        }

        // Create task object with dueDate for backend
        const taskData = {
            title: taskTitle.value.trim(),
            description: taskDescription.value.trim(),
            dueDate: taskDeadline.value,
            assignee: window.currentAssignee,
            type: window.currentAssignmentType,
            dateAssigned: new Date().toISOString().split('T')[0]
        };

        // Call actual API based on type and get message
        let message;
        if (window.currentAssignmentType === 'batch') {
            message = await assignTaskToClass(taskData);
        } else {
            message = await assignTaskToStudent(taskData);
        }

        // Close modal
        closeTaskModal();

        // Show success message from backend
        showNotification(message, 'success');
    }

    function assignTask(taskData) {
        console.log('Assigning task:', taskData);

        // Update student statistics
        updateStudentStats(taskData);

        // Add to activity list
        addTaskToActivityList(taskData);

        // Simulate API call
        setTimeout(() => {
            console.log('Task assignment completed');
        }, 1000);
    }

    function updateStudentStats(taskData) {
        // Update goals set counter for the specific student
        // Update goals set counter for the specific student
        const studentCards = document.querySelectorAll('.student-card');

        studentCards.forEach(card => {
            const studentName = card.querySelector('.student-name').textContent;

            if (studentName === taskData.assignee ||
                (taskData.type === 'batch' && taskData.assignee.includes('Batch'))) {

                const goalsSetElement = card.querySelector('.stat-value');
                if (goalsSetElement) {
                    const currentGoals = parseInt(goalsSetElement.textContent);
                    goalsSetElement.textContent = currentGoals + 1;
                }
            }
        });

        // Update dashboard statistics
        const totalStudents = document.getElementById('totalStudents');
        if (totalStudents) {
            const currentCount = parseInt(totalStudents.textContent);
            totalStudents.textContent = currentCount;
        }
    }

    function addTaskToActivityList(taskData) {
        const activityList = document.getElementById('activityList');

        if (activityList) {
            const newActivity = document.createElement('li');
            newActivity.className = 'activity-item';

            const activityText = taskData.type === 'batch'
                ? `You assigned "${taskData.title}" to ${taskData.assignee}`
                : `You assigned "${taskData.title}" to ${taskData.assignee}`;

            newActivity.innerHTML = `
                <div class="activity-content">
                    <h4 class="activity-description">${activityText}</h4>
                    <p class="activity-time">Just now</p>
                </div>
            `;

            // Add to the top of the list
            activityList.insertBefore(newActivity, activityList.firstChild);

            // Remove old activities if more than 10
            while (activityList.children.length > 10) {
                activityList.removeChild(activityList.lastChild);
            }
        }
    }

    // Student Search functionality
    function setupStudentSearch() {
        const searchInput = document.getElementById('studentSearch');
        const clearSearchBtn = document.getElementById('clearSearch');
        const tableBody = document.getElementById('studentsTableBody');
        let noResultsRow = null;
        let dataLoaded = false;

        // Handle search input
        if (searchInput) {
            searchInput.addEventListener('input', async function() {
                const searchTerm = this.value.toLowerCase().trim();
                if (searchTerm === '') {
                    clearStudentsTable();
                    dataLoaded = false;
                    return;
                }
                if (!dataLoaded) {
                    await loadAllAssignedStudents();
                    dataLoaded = true;
                }
                filterStudentsTable(searchTerm);
            });

            // Handle search on Enter key
            searchInput.addEventListener('keypress', async function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const searchTerm = this.value.toLowerCase().trim();
                    if (searchTerm === '') {
                        clearStudentsTable();
                        dataLoaded = false;
                        return;
                    }
                    if (!dataLoaded) {
                        await loadAllAssignedStudents();
                        dataLoaded = true;
                    }
                    filterStudentsTable(searchTerm);
                }
            });
        }

        // Handle clear search button
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', function() {
                if (searchInput) {
                    searchInput.value = '';
                    clearStudentsTable();
                    dataLoaded = false;
                }
            });
        }

        function filterStudentsTable(searchTerm) {
            if (!tableBody || originalRows.length === 0) return;

            let visibleCount = 0;
            let hasResults = false;

            // Clear existing no results row
            if (noResultsRow) {
                noResultsRow.remove();
                noResultsRow = null;
            }

            // Hide all original rows first
            originalRows.forEach(row => {
                row.style.display = 'none';
            });

            // Filter and show matching rows
            originalRows.forEach(row => {
                const studentNameElement = row.querySelector('.student-name');
                const studentEmailElement = row.querySelector('.student-email');
                const studentName = studentNameElement ? studentNameElement.innerText.toLowerCase().trim() : '';
                const studentEmail = studentEmailElement ? studentEmailElement.innerText.toLowerCase().trim() : '';

                // Check if search term matches name or email
                const matchesName = studentName.includes(searchTerm);
                const matchesEmail = studentEmail.includes(searchTerm);
                const matches = searchTerm === '' || matchesName || matchesEmail;

                if (matches) {
                    row.style.display = '';
                    visibleCount++;
                    hasResults = true;
                }
            });

            // Show/hide no results row
            if (!hasResults && searchTerm !== '') {
                noResultsRow = document.createElement('tr');
                noResultsRow.className = 'no-results-row';
                noResultsRow.innerHTML = `
                    <td colspan="4" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; color: #cbd5e0;"></i>
                        <h3>No students found</h3>
                        <p>No students match your search for "${searchTerm}". Try a different search term.</p>
                    </td>
                `;
                tableBody.appendChild(noResultsRow);
            }

            console.log(`Search results: ${visibleCount} students`);
        }
    }

    // Setup students class selector
    function setupStudentsClassSelector() {
        const batchSelect = document.getElementById('batchSelect');
        if (batchSelect) {
            batchSelect.addEventListener('change', async function() {
                const selectedClass = this.value;
                if (selectedClass === '') {
                    await loadAllAssignedStudents();
                } else if (selectedClass) {
                    await loadStudentsForClassTable(selectedClass);
                } else {
                    clearStudentsTable();
                }
            });
        }
    }

    async function loadStudentsForClass(className) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const mentorId = currentUser ? currentUser.userId : null;

        if (!mentorId) {
            showNotification('Mentor not logged in', 'error');
            return;
        }

        const token = localStorage.getItem('jwtToken');

        try {
            const response = await fetch(`http://localhost:8080/api/mentors/${mentorId}/students/class/${className}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch students: ${response.statusText}`);
            }
            const students = await response.json();

            populateStudentsGrid(students);
            showNotification(`Loaded ${students.length} students for class ${className}`, 'success');
        } catch (error) {
            console.error('Error loading students:', error);
            showNotification(`Failed to load students: ${error.message}`, 'error');
            clearStudentsGrid();
        }
    }

    async function loadStudentsForClassTable(className) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const mentorId = currentUser ? currentUser.userId : null;

        if (!mentorId) {
            showNotification('Mentor not logged in', 'error');
            return;
        }

        const token = localStorage.getItem('jwtToken');

        try {
            const response = await fetch(`http://localhost:8080/api/mentors/${mentorId}/students/class/${className}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch students: ${response.statusText}`);
            }
            const students = await response.json();

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
                            ...student,
                            progress: report.completionPercentage || 0,
                            completedCount: report.completedCount || 0,
                            totalCount: report.totalCount || 0,
                            week: report.weekStartDate && report.weekEndDate ? `${report.weekStartDate} to ${report.weekEndDate}` : 'Current Week'
                        });
                    } else {
                        // Fallback if report not available
                        studentsWithReports.push({
                            ...student,
                            progress: 0,
                            completedCount: 0,
                            totalCount: 0,
                            week: 'No Report'
                        });
                    }
                } catch (reportError) {
                    console.error(`Error fetching report for student ${student.id}:`, reportError);
                    studentsWithReports.push({
                        ...student,
                        progress: 0,
                        completedCount: 0,
                        totalCount: 0,
                        week: 'Error Loading'
                    });
                }
            }

            populateStudentsTable(studentsWithReports);
            showNotification(`Loaded ${studentsWithReports.length} students for class ${className}`, 'success');
        } catch (error) {
            console.error('Error loading students:', error);
            showNotification(`Failed to load students: ${error.message}`, 'error');
            clearStudentsTable();
        }
    }

    function clearStudentsGrid() {
        const studentsGrid = document.getElementById('studentsGrid');
        if (studentsGrid) studentsGrid.innerHTML = '';
    }

    function clearStudentsTable() {
        const tableBody = document.getElementById('studentsTableBody');
        if (tableBody) {
            tableBody.innerHTML = '';
            originalRows = [];
        }
    }

    function populateStudentsGrid(students) {
        const studentsGrid = document.getElementById('studentsGrid');
        if (!studentsGrid) return;

        studentsGrid.innerHTML = '';

        if (students.length === 0) {
            const noStudentsDiv = document.createElement('div');
            noStudentsDiv.className = 'no-students-message';
            noStudentsDiv.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                text-align: center;
                color: #64748b;
            `;
            noStudentsDiv.innerHTML = `
                <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; color: #cbd5e0;"></i>
                <h3>No students found</h3>
                <p>No students in this class.</p>
            `;
            studentsGrid.appendChild(noStudentsDiv);
            return;
        }

        students.forEach(student => {
            const displayName = student.name && student.name !== 'null' ? student.name : 'Unknown Student';
            const card = document.createElement('div');
            card.className = 'student-card';
            card.innerHTML = `
                <div class="student-avatar">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4e54c8&color=fff&size=60" alt="${displayName}">
                </div>
                <div class="student-info">
                    <h3 class="student-name">${displayName}</h3>
                    <p class="student-email">${student.email || 'No email'}</p>
                    <div class="student-stats">
                        <span class="stat-item">
                            <i class="fas fa-bullseye"></i>
                            <span class="stat-value">${student.goals ? student.goals.length : 0}</span>
                            <span class="stat-label">Goals</span>
                        </span>
                    </div>
                </div>
                <div class="student-actions">
                    <button class="assign-btn" onclick="openTaskModal('${displayName}', 'individual')">
                        <i class="fas fa-plus"></i> Assign Task
                    </button>
                    <button class="view-report-btn" onclick="viewStudentCurrentReport(${student.id})">
                        <i class="fas fa-chart-bar"></i> View Report
                    </button>
                    <button class="download-btn" onclick="downloadStudentReport(${student.id})">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            `;
            studentsGrid.appendChild(card);
        });

        // Re-setup event listeners
        setupIndividualTaskAssignment();
        setupDownloadReports();
    }

    function viewStudentCurrentReport(studentId) {
        const token = localStorage.getItem('jwtToken');

        fetch(`http://localhost:8080/api/reports/student/${studentId}/current`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch report: ${response.statusText}`);
                }
                return response.json();
            })
            .then(report => {
                // Display report details
                const reportDetails = `
                    Current Weekly Report:
                    Progress: ${report.progressPercentage || 0}%
                    Completed Tasks: ${report.completedTasks || 0}/${report.totalTasks || 0}
                    Total Goals: ${report.totalGoals || 0}
                    Week: ${report.week ? report.week.number : 'Current'}
                `;
                showNotification(reportDetails, 'info');
                console.log('Student Report:', report);
            })
            .catch(error => {
                showNotification(`Error fetching report: ${error.message}`, 'error');
                console.error('Report fetch error:', error);
            });
    }

    function downloadStudentReport(studentId) {
        // Placeholder for download functionality
        showNotification(`Generating downloadable report for student ${studentId}...`, 'info');
        // In a real app, this would generate and download a PDF or similar
    }


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
            showNotification('Loading all assigned students...', 'info');

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

            // For each student, fetch current weekly report to get goal counts
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
                            ...student,
                            progress: report.completionPercentage || 0,
                            completedCount: report.completedCount || 0,
                            totalCount: report.totalCount || 0,
                            week: report.weekStartDate && report.weekEndDate ? `${report.weekStartDate} to ${report.weekEndDate}` : 'Current Week'
                        });
                    } else {
                        // Fallback if report not available
                        studentsWithReports.push({
                            ...student,
                            progress: 0,
                            completedCount: 0,
                            totalCount: 0,
                            week: 'No Report'
                        });
                    }
                } catch (reportError) {
                    console.error(`Error fetching report for student ${student.id}:`, reportError);
                    studentsWithReports.push({
                        ...student,
                        progress: 0,
                        completedCount: 0,
                        totalCount: 0,
                        week: 'Error Loading'
                    });
                }
            }

            populateStudentsTable(studentsWithReports);
            showNotification(`Loaded ${studentsWithReports.length} students`, 'success');
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
            noStudentsRow.className = 'no-students-row';
            noStudentsRow.innerHTML = `
                <td colspan="4" style="text-align: center; padding: 40px; color: #64748b;">
                    <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; color: #cbd5e0;"></i>
                    <h3>No students found</h3>
                    <p>No students assigned to you.</p>
                </td>
            `;
            tableBody.appendChild(noStudentsRow);
            originalRows = []; // No data rows
            return;
        }

        students.forEach((student, index) => {
            const displayName = student.name && student.name !== 'null' ? student.name : 'Unknown Student';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="serial-cell">${student.id || 'N/A'}</td>
                <td>
                    <div class="student-cell">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4e54c8&color=fff&size=40" alt="${displayName}" class="student-avatar-small">
                        <div class="student-details">
                            <div class="student-name">${displayName}</div>
                            <div class="student-email">${student.email || 'No email'}</div>
                        </div>
                    </div>
                </td>
               <td class="goals-cell" style="display: flex; align-items: center; gap: 8px;">
    <span>${student.completedCount || 0}/${student.totalCount || 0}</span>
</td>

                <td class="actions-cell">
                    <div class="actions-buttons">
                        <button class="assign-btn" data-student-id="${student.id}" data-student-name="${displayName}">
                            <i class="fas fa-plus"></i> Assign Task
                        </button>
                        <button class="g1-btn" style="background-color: #4e54c8; color: white; padding: 8px 16px; border-radius: 6px;">Goals</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Update original rows for search (exclude no-results and no-students rows)
        originalRows = Array.from(tableBody.querySelectorAll('tr:not(.no-results-row):not(.no-students-row)'));

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

            if (target.classList.contains('assign-btn')) {
                // Get student name from the row's student-name element for accuracy
                const row = target.closest('tr');
                const studentNameElement = row.querySelector('.student-name');
                const studentName = studentNameElement ? studentNameElement.textContent.trim() : 'Student';
                openTaskModal(studentName, 'individual', studentId);
            } else if (target.classList.contains('download-btn')) {
                downloadStudentReport(studentId);
            } else if (target.classList.contains('g1-btn')) {
                // Get student name from the row's student-name element
                const row = target.closest('tr');
                const studentNameElement = row.querySelector('.student-name');
                const studentName = studentNameElement ? studentNameElement.textContent.trim() : 'Student';
                window.openG1Modal(studentName);
            }
        });
    }

    // Assign task to student via API
    async function assignTaskToStudent(taskData) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const mentorId = currentUser ? currentUser.userId : null;

        if (!mentorId) {
            showNotification('Mentor not logged in', 'error');
            return 'Mentor not logged in';
        }

        if (!window.currentAssigneeId) {
            showNotification('Student ID not found', 'error');
            return 'Student ID not found';
        }

        const token = localStorage.getItem('jwtToken');

        try {
            const payload = {
                title: taskData.title,
                description: taskData.description,
                dueDate: taskData.dueDate
            };

            const response = await fetch(`http://localhost:8080/api/tasks/mentors/${mentorId}/student/${window.currentAssigneeId}`, {
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

            const message = await response.text();

            console.log('Task assigned successfully');

            // Reload students data to update goals column based on current class selector
            const batchSelect = document.getElementById('batchSelect');
            if (batchSelect) {
                const selectedClass = batchSelect.value;
                if (selectedClass === '') {
                    await loadAllAssignedStudents();
                } else {
                    await loadStudentsForClassTable(selectedClass);
                }
            } else {
                await loadAllAssignedStudents();
            }

            // Update student statistics
            updateStudentStats(taskData);

            // Add to activity list
            addTaskToActivityList(taskData);

            return message;

        } catch (error) {
            console.error('Error assigning task:', error);
            showNotification(`Failed to assign task: ${error.message}`, 'error');
            return `Failed to assign task: ${error.message}`;
        }
    }

    // Assign task to class via API
    async function assignTaskToClass(taskData) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const mentorId = currentUser ? currentUser.userId : null;

        if (!mentorId) {
            showNotification('Mentor not logged in', 'error');
            return 'Mentor not logged in';
        }

        const token = localStorage.getItem('jwtToken');

        try {
            const payload = {
                title: taskData.title,
                description: taskData.description,
                dueDate: taskData.dueDate
            };

            const response = await fetch(`http://localhost:8080/api/tasks/mentors/${mentorId}/class/${window.currentClassName}`, {
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

            const message = await response.text();

            console.log('Task assigned to class successfully');

            // Reload students data to update goals column based on current class selector
            const batchSelect = document.getElementById('batchSelect');
            if (batchSelect) {
                const selectedClass = batchSelect.value;
                if (selectedClass === '') {
                    await loadAllAssignedStudents();
                } else {
                    await loadStudentsForClassTable(selectedClass);
                }
            } else {
                await loadAllAssignedStudents();
            }

            // Update student statistics for all students in the class
            updateStudentStats(taskData);

            // Add to activity list
            addTaskToActivityList(taskData);

            return message;

        } catch (error) {
            console.error('Error assigning task to class:', error);
            showNotification(`Failed to assign task: ${error.message}`, 'error');
            return `Failed to assign task: ${error.message}`;
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

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        setupStudentPanel();
        setupStudentSearch(); // Setup search, data will be loaded when class is selected
    });
