// Feedback-specific JavaScript for feedback.html

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

    // --- 2. INITIALIZE FEEDBACK PAGE ---
    populateUserInfo(currentUser);
    fetchFeedbackData();

    // --- 3. FUNCTIONS TO POPULATE THE UI ---

    function populateUserInfo(user) {
        document.querySelector('.profile-name').textContent = user.name;
        // Update profile image
        const profileImg = document.querySelector('.profile-img');
        if (profileImg) {
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
        }
    }

    async function fetchFeedbackData() {
        const response = await apiRequest(`/students/${currentUser.userId}/feedback`);
        if (response) {
            renderFeedback(response);
        }
    }

    /**
     * Renders the feedback cards in the feedback section.
     */
    function renderFeedback(feedbackList) {
        const feedbackContainer = document.querySelector('.feedback-container');
        feedbackContainer.innerHTML = ''; // Clear static content

        if (feedbackList.length === 0) {
            feedbackContainer.innerHTML = '<p>No feedback available yet.</p>';
            return;
        }

        feedbackList.forEach(feedback => {
            const feedbackCard = document.createElement('div');
            feedbackCard.className = 'feedback-card';

            // Determine status class based on feedback type or assume positive if not specified
            let statusClass = 'status-positive';
            let statusIcon = 'fa-thumbs-up';
            let statusText = 'Positive';
            if (feedback.status) {
                if (feedback.status.toLowerCase().includes('improvement') || feedback.status.toLowerCase().includes('need')) {
                    statusClass = 'status-improvement';
                    statusIcon = 'fa-exclamation-triangle';
                    statusText = 'Need Improvement';
                } else if (feedback.status.toLowerCase().includes('neutral')) {
                    statusClass = 'status-neutral';
                    statusIcon = 'fa-minus';
                    statusText = 'Neutral';
                }
            }

            feedbackCard.innerHTML = `
                <div class="mentor-profile">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(feedback.mentorName || 'Mentor')}&background=random&color=fff&size=60" alt="${feedback.mentorName || 'Mentor'}" class="mentor-avatar">
                    <h4 class="mentor-name">${feedback.mentorName || 'Mentor'}</h4>
                </div>
                <div class="feedback-content">
                    <div class="feedback-status ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        <span>${statusText}</span>
                    </div>
                    <p class="feedback-description">${feedback.feedbackText || feedback.description || 'No description available.'}</p>
                    <div class="feedback-date">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(feedback.date || feedback.createdAt)}</span>
                    </div>
                </div>
            `;
            feedbackContainer.appendChild(feedbackCard);
        });
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
