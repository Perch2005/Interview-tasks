const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');

const app = express();
const port = 3000;

const db = new sqlite3.Database('todos.db');

app.use(express.json());

db.run(`
    CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT,
        date TEXT,
        time TEXT,
        isDone BOOLEAN DEFAULT 0,
        description TEXT
    )
`);

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/reminders', (req, res) => {
    const { text, date, time, description } = req.body;

    if (!text || !date || !time) {
        return res.status(400).json({ error: 'Text, date, and time are required for a reminder.' });
    }

    db.run('INSERT INTO reminders (text, date, time, description) VALUES (?, ?, ?, ?)', [text, date, time, description], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Error saving the reminder.' });
        }

        const reminderId = this.lastID;
        res.status(201).json({ id: reminderId, text, date, time, isDone: false, description });
    });
});

app.get('/api/reminders', (req, res) => {
    db.all('SELECT * FROM reminders', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching reminders.' });
        }

        res.json(rows);
    });
});

app.patch('/api/reminders/:id', (req, res) => {
    const { id } = req.params;
    const { isDone } = req.body;

    db.run('UPDATE reminders SET isDone = ? WHERE id = ?', [isDone, id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Error updating completion status.' });
        }

        res.json({ id, isDone });
    });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});