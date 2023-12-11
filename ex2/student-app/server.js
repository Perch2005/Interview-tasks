const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');

const app = express();
const port = 3000;

const db = new sqlite3.Database('students.db');

app.use(express.json())

db.run(`
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT,
        lastName TEXT,
        middleName TEXT,
        birthDate TEXT,
        groupNumber TEXT,
        studentId TEXT UNIQUE
    )
`);

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/students', (req, res) => {
    try {
        const { firstName, lastName, middleName, birthDate, groupNumber, studentId } = req.body;
        const query = `
            INSERT INTO students (firstName, lastName, middleName, birthDate, groupNumber, studentId)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(query, [firstName, lastName, middleName, birthDate, groupNumber, studentId], function (err) {
            if (err) {
                console.error('Error adding student to the database:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.status(201).json({ id: this.lastID });
        });
    } catch (err) {
        console.error('Unexpected error in /students POST route:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/students', (req, res) => {
    const query = 'SELECT * FROM students';

    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ students: rows });
    });
});

app.delete('/students/:id', (req, res) => {
    const studentId = req.params.id;
    const query = 'DELETE FROM students WHERE studentId = ?';

    db.run(query, [studentId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Deleted', changes: this.changes });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
