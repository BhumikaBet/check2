document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const roleSelect = document.getElementById('role');
    const batchField = document.getElementById('batchField');
    const messageDiv = document.getElementById('message');
    const messageText = document.getElementById('messageText');

    // Show/hide the "Class Name" field based on the selected role
    roleSelect.addEventListener('change', function() {
        if (this.value === 'STUDENT') {
            batchField.classList.remove('hidden');
        } else {
            batchField.classList.add('hidden');
        }
    });

    // Handle the form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        hideMessage();

        // Get all form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const role = roleSelect.value;
        const className = document.getElementById('className').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // --- Frontend Validation ---
        if (!name || !email || !role || !password) {
            showMessage('error', 'Please fill in all required fields.');
            return;
        }
        // Validate email or phone number
        if (!validateEmailOrPhone(email)) {
            showMessage('error', 'Please enter a valid email address or a 10-digit phone number.');
            return;
        }
        if (role === 'STUDENT' && !className) {
            showMessage('error', 'Please select a class for the student.');
            return;
        }
        if (!validatePassword(password)) {
            showMessage('error', 'Password must be 8+ characters, with at least one uppercase letter, one number, and one special character.');
            return;
        }
        if (password !== confirmPassword) {
            showMessage('error', 'Passwords do not match.');
            return;
        }

        // Prepare the data object for the backend
        const registrationData = { name, email, role, password };
        if (role === 'STUDENT') {
            // Send the enum value directly (A, B, or C)
            registrationData.className = className;
        }

        performRegistration(registrationData);
    });
    
    // A robust password validation function using regex
    function validatePassword(password) {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Function to validate email or phone number
    function validateEmailOrPhone(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;
        return emailRegex.test(input) || phoneRegex.test(input);
    }

    // --- Helper functions for showing messages ---
    function showMessage(type, text) {
        messageDiv.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
        if (type === 'success') {
            messageDiv.classList.add('bg-green-100', 'text-green-700');
        } else {
            messageDiv.classList.add('bg-red-100', 'text-red-700');
        }
        messageText.textContent = text;
    }

    function hideMessage() {
        messageDiv.classList.add('hidden');
    }

    // --- Function to make the API call ---
    async function performRegistration(data) {
        const submitButton = registerForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Registering...';
        submitButton.disabled = true;

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                showMessage('success', 'Registration successful! You can now log in.');
                // Redirect to login page after successful registration
                window.location.href = 'login.html';
                registerForm.reset();
                batchField.classList.add('hidden');
            } else {
                const errorData = await response.text();
                showMessage('error', 'Registration failed: ${errorData}');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            showMessage('error', 'Could not connect to the server. Please try again later.');
        } finally {
            submitButton.textContent = 'Register';
            submitButton.disabled = false;
        }
    }
});