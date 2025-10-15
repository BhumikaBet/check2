document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');

    // Add click event listeners to each link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Get the target section ID
            const targetSection = this.getAttribute('data-section');

            // If data-section exists, handle internal navigation
            if (targetSection) {
                e.preventDefault();

                // Check if it's the approval section
                if (targetSection === 'approval') {
                    // Navigate to approve.html
                    window.location.href = 'approve.html';
                    return;
                }

                // Remove active class from all links and sections
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                document.querySelectorAll('.section').forEach(section => {
                    section.classList.remove('active');
                });

                // Add active class to clicked link and target section
                this.classList.add('active');
                document.getElementById(targetSection).classList.add('active');
            }
            // If no data-section, allow normal navigation (e.g., to stdsec.html)
        });
    });

    // Logout functionality
    setupLogout();

    // Initialize admin-specific functionality
    initializeAdminSections();
});

async function initializeAdminSections() {
    console.log('Admin dashboard initialized');

    // ********** DUMMY API ENDPOINTS **********
    const PROFILE_API = 'https://dummyapi.io/admin/profile'; // Replace with actual profile API
    const DASHBOARD_STATS_API = 'https://dummyapi.io/admin/dashboard-stats'; // Replace with actual stats API

    try {
        // Fetch profile info
        const profileResponse = await fetch(PROFILE_API);
        const profileData = await profileResponse.json();
        // Example expected JSON: { name: "Admin User", role: "Administrator" }

        // Update profile section
        document.querySelector('.profile-name').textContent = profileData.name;
        document.querySelector('.profile-role').textContent = profileData.role;
        document.querySelector('.top-bar .avatar-img').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=4e54c8&color=fff`;
        
        // Fetch dashboard stats
        const statsResponse = await fetch(DASHBOARD_STATS_API);
        const statsData = await statsResponse.json();
        // Example expected JSON: 
        // {
        //   totalStudents: 1250,
        //   totalMentors: 350,
        //   PENDINGRegistrations: 15,
        //   activeUsersWeek: 220,
        //   welcomeName: "Sarah"
        // }

        // Update welcome text
        document.querySelector('.welcome-text').textContent = `Welcome back, ${statsData.welcomeName} 👋`;

        // Update stats cards
        const statValues = document.querySelectorAll('.stat-value');
        statValues[0].textContent = statsData.totalStudents;       // Total Students
        statValues[1].textContent = statsData.totalMentors;        // Total Mentors
        statValues[2].textContent = statsData.PENDINGRegistrations; // PENDING Registrations
        statValues[3].textContent = statsData.activeUsersWeek;     // Active Users This Week

    } catch (error) {
        console.error('Error fetching admin data:', error);
        // Optionally, show a user-friendly message if API fails
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Show confirmation dialog
            if (confirm('Are you sure you want to logout?')) {
                // In a real application, this would handle actual logout
                alert('Logged out successfully!');

                // Redirect to home page
                window.location.href = '../home.html';
            }
        });
    }
}
