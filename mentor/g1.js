document.addEventListener('DOMContentLoaded', () => {
  const g1Modal = document.getElementById('g1Modal');
  const closeBtn = document.getElementById('closeG1Modal');
  const goalsList = document.querySelector('.g1-goals-list');
  const modalTitle = document.querySelector('.g1-modal-title');

  let exampleGoals = [];

  window.openG1Modal = async function(studentName) {
    if (modalTitle) {
      modalTitle.textContent = `Goals assigned to ${studentName}`;
    }

    // Remove dummy data and fetch real goals from API
    const studentId = await getStudentIdByName(studentName);
    if (studentId) {
      exampleGoals = await fetchGoalsForStudent(studentId);
    } else {
      exampleGoals = [];
    }

    populateGoals('all');
    if (g1Modal) {
      g1Modal.classList.add('show');
    }
  };

  async function getStudentIdByName(name) {
    const rows = document.querySelectorAll('#studentsTableBody tr');
    for (const row of rows) {
      const studentNameElem = row.querySelector('.student-name');
      if (studentNameElem && studentNameElem.textContent.trim() === name) {
        const assignBtn = row.querySelector('.assign-btn');
        if (assignBtn) {
          return assignBtn.getAttribute('data-student-id');
        }
      }
    }
    return null;
  }

  async function fetchGoalsForStudent(studentId) {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`http://localhost:8080/api/dashboard/student/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }
      const goals = await response.json();
      return goals.map(goal => ({
        id: goal.id,
        title: goal.title,
        dueDate: new Date(goal.dueDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
        status: goal.status || 'all',
        assignedByMentor: goal.assignedByMentor || false
      }));
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  }

  function closeG1Modal() {
    if (g1Modal) {
      g1Modal.classList.remove('show');
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeG1Modal);
  }

  if (g1Modal) {
    g1Modal.addEventListener('click', (e) => {
      if (e.target === g1Modal) {
        closeG1Modal();
      }
    });
  }

  function populateGoals(filter) {
    if (!goalsList) return;

    goalsList.innerHTML = '';

    let filteredGoals = exampleGoals;

    if (filter !== 'all') {
      filteredGoals = exampleGoals.filter(goal => goal.status === filter);
    }

    filteredGoals.forEach(goal => {
      const goalCard = document.createElement('div');
      goalCard.className = `g1-goal-card ${goal.assignedByMentor ? 'highlighted' : ''}`;

      goalCard.innerHTML = `
        <h4 class="g1-goal-title">${goal.title}</h4>
        <p class="g1-goal-due-date">Due by ${goal.dueDate}</p>
      `;

      goalsList.appendChild(goalCard);
    });
  }
});