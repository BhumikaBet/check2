// Go back to admin dashboard
function goBack() {
    window.location.href = 'admin.html';
}

// ********** DUMMY API URLs **********
// Replace these URLs with your actual backend endpoints
const STUDENT_REGISTRATIONS_API = 'http://localhost:8080/api/admin/requests/students'; // <-- PUT YOUR REAL API HERE
const MENTOR_REGISTRATIONS_API = 'http://localhost:8080/api/admin/requests/mentors';   // <-- PUT YOUR REAL API HERE

// Function to fetch and render student registrations
async function loadStudentRegistrations() {
    try {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(STUDENT_REGISTRATIONS_API, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json(); // expecting array of students from backend
        const tbody = document.querySelector('.table-section:nth-of-type(1) tbody');
        tbody.innerHTML = ''; // clear previous rows

        // Only populate rows if backend returns data
        if (data && data.length > 0) {
            data.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.className || 'N/A'}</td>
                    <td>
                        <button class="btn btn-approve" onclick="approveStudent(this, ${student.userId})">Approve</button>
                        <button class="btn btn-deny" onclick="denyStudent(this, ${student.userId})">Deny</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
        // If no data, table will remain empty (just headers will show)
    } catch (err) {
        console.error('Error loading students:', err);
    }
}

// Function to fetch and render mentor registrations
async function loadMentorRegistrations() {
    try {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(MENTOR_REGISTRATIONS_API, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json(); // expecting array of mentors from backend
        const tbody = document.querySelector('.table-section:nth-of-type(2) tbody');
        tbody.innerHTML = ''; // clear previous rows

        if (data && data.length > 0) {
            data.forEach(mentor => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${mentor.name}</td>
                    <td>${mentor.email}</td>
                    <td>
                        <button class="btn btn-approve" onclick="approveMentor(this, ${mentor.userId})">Approve</button>
                        <button class="btn btn-deny" onclick="denyMentor(this, ${mentor.userId})">Deny</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
        // If no data, table will remain empty (just headers will show)
    } catch (err) {
        console.error('Error loading mentors:', err);
    }
}

// Approve/Deny student and mentor functions remain same
async function approveStudent(button, userId) {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`http://localhost:8080/api/admin/approve/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const row = button.closest('tr');
            const studentName = row.cells[0].textContent;
            const email = row.cells[1].textContent;
            showNotification(`Student ${studentName} (${email}) has been approved!`, 'success');
            row.remove();
        } else {
            showNotification('Failed to approve student.', 'error');
        }
    } catch (error) {
        console.error('Error approving student:', error);
        showNotification('Error approving student.', 'error');
    }
}

async function denyStudent(button, userId) {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`http://localhost:8080/api/admin/reject/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const row = button.closest('tr');
            const studentName = row.cells[0].textContent;
            const email = row.cells[1].textContent;
            showNotification(`Student ${studentName} (${email}) registration has been denied.`, 'error');
            row.remove();
        } else {
            showNotification('Failed to deny student.', 'error');
        }
    } catch (error) {
        console.error('Error denying student:', error);
        showNotification('Error denying student.', 'error');
    }
}

async function approveMentor(button, userId) {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`http://localhost:8080/api/admin/approve/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const row = button.closest('tr');
            const mentorName = row.cells[0].textContent;
            const email = row.cells[1].textContent;
            showNotification(`Mentor ${mentorName} (${email}) has been approved!`, 'success');
            row.remove();
        } else {
            showNotification('Failed to approve mentor.', 'error');
        }
    } catch (error) {
        console.error('Error approving mentor:', error);
        showNotification('Error approving mentor.', 'error');
    }
}

async function denyMentor(button, userId) {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`http://localhost:8080/api/admin/reject/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const row = button.closest('tr');
            const mentorName = row.cells[0].textContent;
            const email = row.cells[1].textContent;
            showNotification(`Mentor ${mentorName} (${email}) registration has been denied.`, 'error');
            row.remove();
        } else {
            showNotification('Failed to deny mentor.', 'error');
        }
    } catch (error) {
        console.error('Error denying mentor:', error);
        showNotification('Error denying mentor.', 'error');
    }
}

// Notification functions remain same
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Add notification styles dynamically
const style = document.createElement('style');
style.textContent = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
}
.notification.show {
    transform: translateX(0);
}
.notification.success {
    background: #10b981;
}
.notification.error {
    background: #ef4444;
}
`;
document.head.appendChild(style);

// Load data from backend on page load
document.addEventListener('DOMContentLoaded', () => {
    loadStudentRegistrations();
    loadMentorRegistrations();
});
