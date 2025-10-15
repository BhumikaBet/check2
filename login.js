
// Login Form Validation and Submission
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // Form submission handler
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Clear previous errors
        hideError();

        // Get form values
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const rememberMe = document.getElementById('remember-me').checked;

        // Validate inputs
        if (!validateEmail(email)) {
            showError('Please enter a valid email address.');
            return;
        }

        if (!validatePassword(password)) {
            showError('Password must be at least 6 characters long.');
            return;
        }

        // Simulate login process
        performLogin(email, password, rememberMe);
    });

    // Email validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Password validation
    function validatePassword(password) {
        return password.length >= 6;
    }

    // Show error message
    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Hide error message
    function hideError() {
        errorMessage.classList.add('hidden');
    }

    async function performLogin(email, password, rememberMe) {
        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Signing in...';
        submitButton.disabled = true;

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                // Store token and user info
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));

                // Redirect based on role
                if (data.user.role === 'STUDENT') {
                    window.location.href = 'student/stdboard.html';
                } else if (data.user.role === 'MENTOR') {
                    window.location.href = 'mentor/mentor_complete_updated.html';
                } else if (data.user.role === 'ADMIN') {
                    window.location.href = 'admin/admin.html';
                }
            } else {
                const errorData = await response.json();
                showError(errorData.message || 'Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Network error. Please try again.');
        } finally {
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    // Show success message
    function showSuccessMessage() {
        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md';
        successDiv.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm">Login successful! Redirecting to dashboard...</p>
                </div>
            </div>
        `;

        loginForm.appendChild(successDiv);

        // Remove success message after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    // Add input event listeners for real-time validation
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    emailInput.addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            showError('Please enter a valid email address.');
        }
    });

    passwordInput.addEventListener('blur', function() {
        if (this.value && !validatePassword(this.value)) {
            showError('Password must be at least 6 characters long.');
        }
    });

    // Clear errors when user starts typing
    emailInput.addEventListener('input', hideError);
    passwordInput.addEventListener('input', hideError);
});
