const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Database setup
let db;
try {
  db = new sqlite3.Database('./server/database.sqlite', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database.');
      initializeDatabase();
    }
  });
} catch (error) {
  console.error('Database initialization error:', error);
}

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Classes table
    db.run(`CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      professor TEXT,
      day TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      classroom TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Tasks table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      class_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (class_id) REFERENCES classes (id)
    )`);
  });
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }

        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: this.lastID, username, email }
        });
      }
    );
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  });
});

// Classes routes
app.get('/api/classes', authenticateToken, (req, res) => {
  db.all('SELECT * FROM classes WHERE user_id = ? ORDER BY day, start_time', [req.user.id], (err, classes) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching classes' });
    }
    res.json(classes);
  });
});

app.post('/api/classes', authenticateToken, (req, res) => {
  const { name, professor, day, start_time, end_time, classroom } = req.body;

  if (!name || !day || !start_time || !end_time) {
    return res.status(400).json({ error: 'Name, day, start time, and end time are required' });
  }

  db.run(
    'INSERT INTO classes (user_id, name, professor, day, start_time, end_time, classroom) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, name, professor, day, start_time, end_time, classroom],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating class' });
      }
      res.status(201).json({ id: this.lastID, message: 'Class created successfully' });
    }
  );
});

app.put('/api/classes/:id', authenticateToken, (req, res) => {
  const { name, professor, day, start_time, end_time, classroom } = req.body;
  const classId = req.params.id;

  if (!name || !day || !start_time || !end_time) {
    return res.status(400).json({ error: 'Name, day, start time, and end time are required' });
  }

  db.run(
    'UPDATE classes SET name = ?, professor = ?, day = ?, start_time = ?, end_time = ?, classroom = ? WHERE id = ? AND user_id = ?',
    [name, professor, day, start_time, end_time, classroom, classId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating class' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Class not found' });
      }
      res.json({ message: 'Class updated successfully' });
    }
  );
});

app.delete('/api/classes/:id', authenticateToken, (req, res) => {
  const classId = req.params.id;

  db.run('DELETE FROM classes WHERE id = ? AND user_id = ?', [classId, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting class' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully' });
  });
});

// Tasks routes
app.get('/api/tasks', authenticateToken, (req, res) => {
  const { classId } = req.query;
  let query = 'SELECT t.*, c.name as class_name FROM tasks t LEFT JOIN classes c ON t.class_id = c.id WHERE t.user_id = ?';
  let params = [req.user.id];

  if (classId) {
    query += ' AND t.class_id = ?';
    params.push(classId);
  }

  query += ' ORDER BY t.due_date, t.created_at';

  db.all(query, params, (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching tasks' });
    }
    res.json(tasks);
  });
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title, description, due_date, class_id } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    'INSERT INTO tasks (user_id, class_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, class_id || null, title, description, due_date],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating task' });
      }
      res.status(201).json({ id: this.lastID, message: 'Task created successfully' });
    }
  );
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const { title, description, due_date, class_id } = req.body;
  const taskId = req.params.id;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    'UPDATE tasks SET title = ?, description = ?, due_date = ?, class_id = ? WHERE id = ? AND user_id = ?',
    [title, description, due_date, class_id || null, taskId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating task' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task updated successfully' });
    }
  );
});

app.patch('/api/tasks/:id/toggle', authenticateToken, (req, res) => {
  const taskId = req.params.id;

  db.run(
    'UPDATE tasks SET completed = CASE WHEN completed = 1 THEN 0 ELSE 1 END WHERE id = ? AND user_id = ?',
    [taskId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error toggling task' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task status updated successfully' });
    }
  );
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const taskId = req.params.id;

  db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting task' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
