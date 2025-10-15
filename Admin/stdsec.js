document.addEventListener('DOMContentLoaded', function() {
    const filterDropdown = document.getElementById('classFilter');
    const tableBody = document.getElementById('studentTableBody');

    let students = []; // Will store fetched student data

    // ********** FETCH STUDENTS FROM BACKEND **********
    async function fetchStudents(selectedClass = 'A') {
        try {
            const token = localStorage.getItem('jwtToken');
            let studentData = [];

            // Map class name to classId
            const classIdMap = { 'A': 1, 'B': 2, 'C': 3 };
            const classId = classIdMap[selectedClass];

            console.log('Fetching students for class:', selectedClass, 'classId:', classId);
            const response = await fetch(`http://localhost:8080/api/admin/classes/${classId}/students`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Response status:', response.status);
            if (response.ok) {
                studentData = await response.json();
                console.log('Students received for class', selectedClass, ':', studentData);
                studentData.forEach(student => {
                    student.className = selectedClass;
                });

                // Fetch goals for each student
                for (let student of studentData) {
                    try {
                        const goalsResponse = await fetch(`http://localhost:8080/api/dashboard/student/${student.userId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        if (goalsResponse.ok) {
                            student.goals = await goalsResponse.json();
                        } else {
                            student.goals = [];
                        }
                    } catch (goalsError) {
                        console.error('Error fetching goals for student', student.userId, ':', goalsError);
                        student.goals = [];
                    }
                }
            } else {
                console.error('Failed to fetch students:', response.statusText);
            }

            students = studentData;
            renderStudents(students);
        } catch (error) {
            console.error('Error fetching students:', error);
            tableBody.innerHTML = '<tr><td colspan="4">Failed to load student data.</td></tr>';
        }
    }

    // ********** FUNCTION TO RENDER STUDENTS **********
    function renderStudents(studentList) {
        tableBody.innerHTML = '';
        if (!studentList || studentList.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3">No students found.</td></tr>';
            return;
        }

        studentList.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>Class ${student.className || 'N/A'}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // ********** FILTER STUDENTS BY CLASS **********
    filterDropdown.addEventListener('change', function() {
        const selectedClass = this.value;
        fetchStudents(selectedClass); // Fetch students for the selected class
    });

    // ********** UPDATE BUTTON HANDLER **********
    const updateButton = document.getElementById('updateButton');
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    updateButton.addEventListener('click', function() {
        confirmationModal.classList.remove('hidden'); // Show the modal
    });

    // ********** CONFIRM YES BUTTON HANDLER **********
    confirmYes.addEventListener('click', async function() {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('http://localhost:8080/api/admin/classes/promote', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                console.log('Classes promoted successfully');
                const selectedClass = filterDropdown.value;
                fetchStudents(selectedClass); // Refresh students for the selected class
            } else {
                console.error('Failed to promote classes:', response.statusText);
                alert('Failed to update student classes. Please try again.');
            }
        } catch (error) {
            console.error('Error promoting classes:', error);
            alert('An error occurred while updating student classes.');
        }
        confirmationModal.classList.add('hidden'); // Hide the modal
    });

    // ********** CONFIRM NO BUTTON HANDLER **********
    confirmNo.addEventListener('click', function() {
        confirmationModal.classList.add('hidden'); // Hide the modal
    });

    // ********** INITIALIZE **********
    fetchStudents(); // fetch data from backend API
});
