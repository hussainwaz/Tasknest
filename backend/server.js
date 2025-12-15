const express = require('express')
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 1000;
app.use(cors());

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Please update backend/.env with your Supabase credentials.');
}

const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('supabase.com')
        ? { require: true, rejectUnauthorized: false }
        : undefined,
    max: Number(process.env.PGPOOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT || 30000),
    connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT || 5000),
});

pool.on('error', (err) => {
    console.error('Unexpected database error', err);
});

(async () => {
    try {
        await pool.query('SELECT 1');
        console.log('Database connection verified');
    } catch (err) {
        console.error('Failed to connect to the database', err);
        process.exit(1);
    }
})();

//authentication
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


//user
app.get('/users/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    try {
        const result = await pool.query(
            'SELECT user_id, full_name, email FROM users WHERE user_id = $1',
            [userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const userData = result.rows[0];
        res.status(200).json({
            success: true,
            data: userData
        });

    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user data"
        });
    }
});

app.get('/users/summary/:user_id', async (req, res) => {
    const userId = req.params.user_id;

    try {
        const result = await pool.query(
            `SELECT
        COUNT(CASE WHEN completed = true THEN 1 END) AS completed,
        COUNT(CASE WHEN completed = false AND 
             (due_date IS NULL OR due_date >= CURRENT_DATE) THEN 1 END) AS pending,
        COUNT(CASE WHEN completed = false AND 
             due_date < CURRENT_DATE THEN 1 END) AS overdue
       FROM tasks
       WHERE user_id = $1`,
            [userId]
        );

        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error("Error fetching task summary:", err);
        res.status(500).json({
            error: "Failed to fetch task summary"
        });
    }
});
app.post('/user/resetpassword', async (req, res) => {
    const { user_id, old_password, new_password } = req.body;

    // Basic validation
    if (!user_id || !old_password || !new_password) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields"
        });
    }

    try {
        // 1. Verify old password
        const user = await pool.query(
            'SELECT password FROM users WHERE user_id = $1',
            [user_id]
        );

        if (user.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(old_password, user.rows[0].password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        // 2. Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(new_password, saltRounds);

        // 3. Update password
        await pool.query(
            'UPDATE users SET password = $1 WHERE user_id = $2',
            [hashedPassword, user_id]
        );

        res.status(200).json({
            success: true,
            message: "Password updated successfully!"
        });

    } catch (err) {
        console.error("Error updating password:", err);
        res.status(500).json({
            success: false,
            message: "Server error during password update"
        });
    }
});

//notes
app.get('/notes/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const { rows } = await pool.query(
            `SELECT 
                id, 
                title, 
                content, 
                creation_date AS "creationDate", 
                is_pinned AS "isPinned", 
                user_id AS "userId"
             FROM notes 
             WHERE user_id = $1
             ORDER BY creation_date DESC`,
            [userId]
        );

        res.json(rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});



app.post('/notes', async (req, res) => {
    const {
        title = '',
        content = '',
        creationDate,
        creation_date,
        user_id,
        userId,
        isPinned,
        is_pinned,
    } = req.body;

    const ownerId = user_id ?? userId;
    const createdAt = creationDate ?? creation_date ?? new Date();
    const pinned = typeof (isPinned ?? is_pinned) === 'boolean' ? (isPinned ?? is_pinned) : false;

    if (!ownerId) {
        return res.status(400).json({ success: false, message: 'user_id is required' });
    }

    try {
        const { rows } = await pool.query(
            `INSERT INTO notes(title, content, creation_date, is_pinned, user_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, title, content, creation_date AS "creationDate", is_pinned AS "isPinned", user_id AS "userId"`,
            [title, content, createdAt, pinned, ownerId]
        );

        res.status(201).json({ success: true, note: rows[0] });
    } catch (err) {
        console.error('Error inserting note:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


app.patch('/notes/:id', async (req, res) => {
    const noteId = req.params.id;
    const { title, content, isPinned, is_pinned, creationDate, creation_date } = req.body;

    const fields = [];
    const values = [];

    if (typeof title === 'string') {
        fields.push(`title = $${fields.length + 1}`);
        values.push(title);
    }
    if (typeof content === 'string') {
        fields.push(`content = $${fields.length + 1}`);
        values.push(content);
    }
    if (typeof (isPinned ?? is_pinned) === 'boolean') {
        fields.push(`is_pinned = $${fields.length + 1}`);
        values.push(isPinned ?? is_pinned);
    }
    if (creationDate || creation_date) {
        fields.push(`creation_date = $${fields.length + 1}`);
        values.push(creationDate ?? creation_date);
    }

    if (fields.length === 0) {
        return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }

    values.push(noteId);

    try {
        await pool.query(
            `UPDATE notes SET ${fields.join(', ')} WHERE id = $${values.length}`,
            values
        );

        const { rows } = await pool.query(
            'SELECT id, title, content, creation_date AS "creationDate", is_pinned AS "isPinned", user_id AS "userId" FROM notes WHERE id = $1',
            [noteId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        res.status(200).json({ success: true, note: rows[0] });
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
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

//tasks
app.get('/tasks/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const { rows } = await pool.query(
            `SELECT 
                id,
                title,
                description,
                creation_date AS "creationDate",
                due_date AS "dueDate",
                completed,
                is_pinned AS "isPinned",
                priority,
                category,
                user_id AS "userId"
             FROM tasks 
             WHERE user_id = $1
             ORDER BY due_date NULLS LAST, creation_date DESC`,
            [userId]
        );
        res.json(rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
});

app.post('/tasks', async (req, res) => {
    const {
        title,
        description = '',
        creationDate,
        creation_date,
        dueDate,
        due_date,
        completed = false,
        user_id,
        userId,
        isPinned,
        is_pinned,
        priority = 'Medium',
        category = 'Personal'
    } = req.body;

    const ownerId = user_id ?? userId;

    if (!ownerId || !title) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const createdAt = creationDate ?? creation_date ?? new Date();
    const dueAt = dueDate ?? due_date ?? null;
    const pinned = typeof (isPinned ?? is_pinned) === 'boolean' ? (isPinned ?? is_pinned) : false;

    try {
        const { rows } = await pool.query(
            `INSERT INTO tasks(title, description, creation_date, due_date, completed, is_pinned, priority, category, user_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, title, description, creation_date AS "creationDate", due_date AS "dueDate", completed, is_pinned AS "isPinned", priority, category, user_id AS "userId"`,
            [title, description, createdAt, dueAt, completed, pinned, priority, category, ownerId]
        );

        res.status(201).json({ success: true, task: rows[0] });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

app.patch('/tasks/:id', async (req, res) => {
    const taskId = req.params.id;
    const {
        title,
        description,
        completed,
        dueDate,
        due_date,
        creationDate,
        creation_date,
        isPinned,
        is_pinned,
        priority,
        category
    } = req.body;

    const fields = [];
    const values = [];

    if (typeof title === 'string') {
        fields.push(`title = $${fields.length + 1}`);
        values.push(title);
    }
    if (typeof description === 'string') {
        fields.push(`description = $${fields.length + 1}`);
        values.push(description);
    }
    if (typeof completed === 'boolean') {
        fields.push(`completed = $${fields.length + 1}`);
        values.push(completed);
    }
    if (dueDate || due_date) {
        fields.push(`due_date = $${fields.length + 1}`);
        values.push(dueDate ?? due_date);
    }
    if (creationDate || creation_date) {
        fields.push(`creation_date = $${fields.length + 1}`);
        values.push(creationDate ?? creation_date);
    }
    if (typeof (isPinned ?? is_pinned) === 'boolean') {
        fields.push(`is_pinned = $${fields.length + 1}`);
        values.push(isPinned ?? is_pinned);
    }
    if (typeof priority === 'string') {
        fields.push(`priority = $${fields.length + 1}`);
        values.push(priority);
    }
    if (typeof category === 'string') {
        fields.push(`category = $${fields.length + 1}`);
        values.push(category);
    }

    if (fields.length === 0) {
        return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }

    values.push(taskId);

    try {
        await pool.query(
            `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${values.length}`,
            values
        );

        const { rows } = await pool.query(
            'SELECT id, title, description, creation_date AS "creationDate", due_date AS "dueDate", completed, is_pinned AS "isPinned", priority, category, user_id AS "userId" FROM tasks WHERE id = $1',
            [taskId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({ success: true, task: rows[0] });
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
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


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});