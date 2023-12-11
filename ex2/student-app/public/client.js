document.addEventListener('DOMContentLoaded', () => {
    fetchStudents();
});

function addStudent() {
    const addStudentForm = document.getElementById('addStudentForm');
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const middleName = document.getElementById('middleName').value;
    const birthDate = document.getElementById('birthDate').value;
    const groupNumber = document.getElementById('groupNumber').value;
    const studentId = document.getElementById('studentId').value;

    if (!firstName || !lastName || !groupNumber || !studentId) {
        console.error('All fields must be filled');
        return;
    }

    const trimmedStudentData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: middleName.trim(),
        birthDate: birthDate.trim(),
        groupNumber: groupNumber.trim(),
        studentId: studentId.trim(),
    };

    fetch('http://localhost:3000/students', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(trimmedStudentData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(() => {
            fetchStudents();
            addStudentForm.reset();
        })
        .catch(error => console.error('Error adding student:', error));
}

function fetchStudents() {
    fetch('http://localhost:3000/students')
        .then(response => response.json())
        .then(data => {
            const studentList = document.getElementById('studentList');
            studentList.innerHTML = '';

            data.students.forEach(student => {
                const li = document.createElement('li');
                li.textContent = `${student.firstName} ${student.lastName} - ${student.groupNumber} ${student.studentId}`;
                studentList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching students:', error));
}

function deleteStudent() {
    const deleteStudentForm = document.getElementById('deleteStudentForm');
    const studentId = document.getElementById('deleteStudentId').value;

    console.log('Deleting student with ID:', studentId);

    if (!studentId) {
        console.error('Student ID must be provided');
        return;
    }

    fetch(`http://localhost:3000/students/${studentId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(() => {
            fetchStudents();
            deleteStudentForm.reset();
        })
        .catch(error => {
            console.error('Error deleting student:', error);
        });
}
