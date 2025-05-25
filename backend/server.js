const express = require('express')
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
const PORT = 1000;
app.use(cors());
require('dotenv').config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.get('/', async (req, res) => {
    res.send("hello there");
});

app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/notes/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const result = await pool.query('SELECT * FROM notes where user_id = $1', [userId]);
        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

app.post('/notes', async (req, res) => {
    const { title, content, creation_date, user_id } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO notes(title, content, creation_date, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, content, creation_date, user_id]
        );

        const newNote = result.rows[0];
        res.status(201).json({ success: true, note: newNote });
    } catch (err) {
        console.error("Error inserting note:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


app.put('/notes/update', async (req, res) => {
    const { noteId, is_pinned } = req.body;
    try {
        await pool.query('UPDATE notes set is_pinned = $1 WHERE id = $2', [is_pinned, noteId]);
        res.status(201).send("Note Updated");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});
app.put('/tasks/update', async (req, res) => {
    const { taskId, is_pinned, completed } = req.body;
    try {
        await pool.query('UPDATE tasks set is_pinned = $1, completed = $2 WHERE id = $3', [is_pinned, completed, taskId]);
        res.status(201).send("Task Updated");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

app.delete('/notes/:id', async (req, res) => {
    const noteId = req.params.id;
    try {
        const result = await pool.query('DELETE FROM notes where id = $1', [noteId]);
        if (result.rowCount === 0) {
            return res.status(404).send('Note not found');
        }

        res.status(204).send();
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

app.get('/tasks/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const result = await pool.query('SELECT * FROM tasks where user_id = $1', [userId]);
        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});
app.post('/tasks', async (req, res) => {
    const { title, description, creation_date, due_date, completed, user_id } = req.body;
    try {
        await pool.query('INSERT INTO tasks(title, description, creation_date, due_date, completed, user_id) VALUES ($1, $2, $3, $4, $5, $6)', [title, description, creation_date, due_date, completed, user_id]);
        res.status(201).send("Task added");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

app.delete('/tasks/:id', async (req, res) => {
    const taskId = req.params.id;
    try {
        const result = await pool.query('DELETE FROM tasks where id = $1', [taskId]);
        if (result.rowCount === 0) {
            return res.status(404).send('Task not found');
        }

        res.status(204).send();
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

app.post('/users/signup', async (req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rowCount > 0) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users(full_name, email, password) VALUES ($1, $2, $3)',
            [full_name, email, hashedPassword]
        );

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rowCount === 0) {
            return res.json({ success: false, message: "User not found" });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Wrong password" });
        }

        res.json({ success: true, userId: user.user_id });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});