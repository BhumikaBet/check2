// Function to show a message box
function showMessage(title, message) {
  document.getElementById('messageTitle').textContent = title;
  document.getElementById('messageText').textContent = message;
  document.getElementById('messageBox').classList.remove('hidden');
}

// Event listeners
document.getElementById('loginBtn').addEventListener('click', () => {
  showMessage('Login', 'This is where your login form or authentication logic would be implemented.');
});

document.getElementById('registerBtn').addEventListener('click', () => {
  showMessage('Register', 'This button would typically lead to a user registration page.');
});

document.getElementById('closeBtn').addEventListener('click', () => {
  document.getElementById('messageBox').classList.add('hidden');
});
