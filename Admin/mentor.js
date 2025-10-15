document.addEventListener('DOMContentLoaded', function() {
    // ********** API FOR FETCHING MENTORS **********
    // API endpoint to fetch mentors
    const MENTORS_API = 'http://localhost:8080/api/admin/mentors';

    // ********** DUMMY API FOR ASSIGNING BATCH TO MENTOR **********
    // Replace this URL with your backend API endpoint to assign batches
    const ASSIGN_BATCH_API = 'https://dummyapi.com/api/assignMentorBatch'; // <-- PUT YOUR REAL API HERE

    const mentorTableBody = document.getElementById('mentorTableBody');
    const batchFilter = document.getElementById('batchFilter');

    let mentors = []; // Array to store mentors fetched from backend
    let allBatches = []; // Array to store all unique batch names

    // ********** FUNCTION TO FETCH MENTORS FROM BACKEND **********
    async function fetchMentors() {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(MENTORS_API, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }); // GET mentors
            const mentorClassData = await response.json(); // array of MentorClassDto

            // Group mentors by userId and collect their batches
            const mentorMap = new Map();
            mentorClassData.forEach(item => {
                if (!mentorMap.has(item.userId)) {
                    mentorMap.set(item.userId, {
                        userId: item.userId,
                        name: item.name,
                        email: item.email,
                        batches: []
                    });
                }
                if (item.className) {
                    mentorMap.get(item.userId).batches.push(item.className);
                }
            });

            mentors = Array.from(mentorMap.values());

            allBatches = [...new Set(mentors.flatMap(m => m.batches || []))]; // unique batches
            populateBatchFilter(); // fill filter dropdown
            renderMentors(mentors); // display mentor table
        } catch (error) {
            console.error('Error fetching mentors:', error);
        }
    }

    // ********** POPULATE BATCH FILTER DROPDOWN **********
    function populateBatchFilter() {
        batchFilter.innerHTML = '<option value="all">All Batches</option>';
        allBatches.forEach(batch => {
            const option = document.createElement('option');
            option.value = batch;
            option.textContent = batch;
            batchFilter.appendChild(option);
        });
    }

    // ********** RENDER MENTORS IN TABLE **********
    function renderMentors(mentorList) {
        mentorTableBody.innerHTML = '';
        mentorList.forEach(mentor => {
            const row = document.createElement('tr');
            const batchesText = mentor.batches && mentor.batches.length ? mentor.batches.join(', ') : '---';
            const assignButton = `<button class="assign-btn" onclick="assignMentor('${mentor.name}')">Assign</button>`;
            const unassignButton = mentor.batches && mentor.batches.length > 0 ? `<button class="unassign-btn" onclick="unassignMentor('${mentor.name}')">Unassign</button>` : '';

            row.innerHTML = `
                <td>${mentor.name}</td>
                <td>${mentor.email}</td>
                <td>${batchesText}</td>
                <td>${assignButton} ${unassignButton}</td>
            `;
            mentorTableBody.appendChild(row);
        });
    }

    // ********** FILTER MENTORS BY BATCH **********
    function filterMentors() {
        const selectedBatch = batchFilter.value;
        if (selectedBatch === 'all') {
            renderMentors(mentors);
        } else {
            const filteredMentors = mentors.filter(m => m.batches && m.batches.includes(selectedBatch));
            renderMentors(filteredMentors);
        }
    }

    // ********** OPEN ASSIGN MODAL **********
    window.assignMentor = function(mentorName) {
        const mentor = mentors.find(m => m.name === mentorName);
        if (mentor) {
            document.getElementById('mentorName').value = mentor.name;

            // Populate dropdown excluding already assigned batches
            const batchSelect = document.getElementById('batchInput');
            batchSelect.innerHTML = '';

            const assignedBatches = mentor.batches || [];
            const allBatches = ['A', 'B', 'C'];

            allBatches.forEach(batch => {
                // Use batch name directly without "Class " prefix
                if (!assignedBatches.includes(batch)) {
                    const option = document.createElement('option');
                    option.value = batch;
                    option.textContent = batch;
                    batchSelect.appendChild(option);
                }
            });

            document.getElementById('assignModal').style.display = 'block';
        }
    };

    // ********** CLOSE MODAL **********
    window.closeModal = function() {
        document.getElementById('assignModal').style.display = 'none';
    };

    // ********** OPEN UNASSIGN MODAL **********
    window.unassignMentor = function(mentorName) {
        const mentor = mentors.find(m => m.name === mentorName);
        if (mentor && mentor.batches && mentor.batches.length > 0) {
            document.getElementById('unassignMentorName').value = mentor.name;

            // Populate dropdown with currently assigned batches
            const batchSelect = document.getElementById('unassignBatchInput');
            batchSelect.innerHTML = '';

            mentor.batches.forEach(batch => {
                const option = document.createElement('option');
                option.value = batch;
                option.textContent = batch;
                batchSelect.appendChild(option);
            });

            document.getElementById('unassignModal').style.display = 'block';
        }
    };

    // ********** CLOSE UNASSIGN MODAL **********
    window.closeUnassignModal = function() {
        document.getElementById('unassignModal').style.display = 'none';
    };

    // ********** HANDLE BATCH ASSIGN FORM **********
    document.getElementById('assignForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const mentorName = document.getElementById('mentorName').value;
        const batchSelect = document.getElementById('batchInput');
        const selectedOptions = Array.from(batchSelect.selectedOptions);
        const selectedBatches = selectedOptions.map(option => option.value);

        if (selectedBatches.length === 0) {
            showConfirmation('Please select at least one batch.');
            return;
        }

        // Find mentor by name to get userId
        const mentor = mentors.find(m => m.name === mentorName);
        if (!mentor) {
            showConfirmation('Mentor not found.');
            return;
        }

        // Map className to classId (assuming A=1, B=2, C=3)
        const classIdMap = { 'A': 1, 'B': 2, 'C': 3 };
        const token = localStorage.getItem('jwtToken');

        let successCount = 0;
        let failedBatches = [];

        // Assign each selected batch
        for (const className of selectedBatches) {
            const classId = classIdMap[className];
            if (!classId) {
                failedBatches.push(className);
                continue;
            }

            try {
                const response = await fetch(`http://localhost:8080/api/admin/classes/${classId}/assign-mentor/${mentor.userId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    successCount++;
                } else {
                    failedBatches.push(className);
                }
            } catch (error) {
                console.error(`Error assigning batch ${className}:`, error);
                failedBatches.push(className);
            }
        }

        // Re-fetch mentors to update UI with latest data from backend
        await fetchMentors();
        closeModal();

        // Show confirmation message
        if (successCount > 0) {
            const batchText = successCount === 1 ? 'batch' : 'batches';
            let message = `Successfully assigned ${successCount} ${batchText} to ${mentorName}!`;
            if (failedBatches.length > 0) {
                message += ` Failed to assign: ${failedBatches.join(', ')}`;
            }
            showConfirmation(message);
        } else {
            showConfirmation('Failed to assign any batches. Please try again.');
        }
    });

    // ********** HANDLE BATCH UNASSIGN FORM **********
    document.getElementById('unassignForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const mentorName = document.getElementById('unassignMentorName').value;
        const batchSelect = document.getElementById('unassignBatchInput');
        const selectedOptions = Array.from(batchSelect.selectedOptions);
        const selectedBatches = selectedOptions.map(option => option.value);

        if (selectedBatches.length === 0) {
            showConfirmation('Please select at least one batch to unassign.');
            return;
        }

        // Find mentor by name to get userId
        const mentor = mentors.find(m => m.name === mentorName);
        if (!mentor) {
            showConfirmation('Mentor not found.');
            return;
        }

        // Map className to classId (assuming A=1, B=2, C=3)
        const classIdMap = { 'A': 1, 'B': 2, 'C': 3 };
        const token = localStorage.getItem('jwtToken');

        let successCount = 0;
        let failedBatches = [];

        // Unassign each selected batch
        for (const className of selectedBatches) {
            const classId = classIdMap[className];
            if (!classId) {
                failedBatches.push(className);
                continue;
            }

            try {
                const response = await fetch(`http://localhost:8080/api/admin/classes/${classId}/remove-mentor/${mentor.userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    successCount++;
                } else {
                    failedBatches.push(className);
                }
            } catch (error) {
                console.error(`Error unassigning batch ${className}:`, error);
                failedBatches.push(className);
            }
        }

        // Re-fetch mentors to update UI with latest data from backend
        await fetchMentors();
        closeUnassignModal();

        // Show confirmation message
        if (successCount > 0) {
            const batchText = successCount === 1 ? 'batch' : 'batches';
            let message = `Successfully unassigned ${successCount} ${batchText} from ${mentorName}!`;
            if (failedBatches.length > 0) {
                message += ` Failed to unassign: ${failedBatches.join(', ')}`;
            }
            showConfirmation(message);
        } else {
            showConfirmation('Failed to unassign any batches. Please try again.');
        }
    });

    // ********** SHOW CONFIRMATION MESSAGE **********
    function showConfirmation(message) {
        const confirmation = document.createElement('div');
        confirmation.className = 'confirmation-message';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        confirmation.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #10b981;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(confirmation);

        setTimeout(() => {
            confirmation.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => document.body.removeChild(confirmation), 300);
        }, 3000);
    }

    // ********** INITIALIZE **********
    fetchMentors(); // fetch mentors from backend API
    batchFilter.addEventListener('change', filterMentors); // filter change listener
});
