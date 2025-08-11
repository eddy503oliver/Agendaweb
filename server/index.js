const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
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
      professor TEXT NOT NULL,
      day TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      classroom TEXT NOT NULL,
      color TEXT NOT NULL,
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
      due_date TEXT NOT NULL,
      priority TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (class_id) REFERENCES classes (id)
    )`);
  });
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Authentication routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Check if user already exists
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }

      if (user) {
        return res.status(400).json({ error: 'Usuario o email ya existe' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
        [username, email, hashedPassword], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error al crear usuario' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({
          message: 'Usuario creado exitosamente',
          token,
          user: { id: this.lastID, username, email }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Login exitoso',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  });
});

// Classes routes
app.get('/api/classes', authenticateToken, (req, res) => {
  db.all('SELECT * FROM classes WHERE user_id = ? ORDER BY day, start_time', [req.user.id], (err, classes) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener clases' });
    }
    res.json(classes);
  });
});

app.post('/api/classes', authenticateToken, (req, res) => {
  const { name, professor, day, startTime, endTime, classroom, color } = req.body;
  
  db.run(
    'INSERT INTO classes (user_id, name, professor, day, start_time, end_time, classroom, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, name, professor, day, startTime, endTime, classroom, color],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear clase' });
      }
      
      db.get('SELECT * FROM classes WHERE id = ?', [this.lastID], (err, newClass) => {
        if (err) {
          return res.status(500).json({ error: 'Error al obtener clase creada' });
        }
        res.status(201).json(newClass);
      });
    }
  );
});

app.put('/api/classes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, professor, day, startTime, endTime, classroom, color } = req.body;
  
  db.run(
    'UPDATE classes SET name = ?, professor = ?, day = ?, start_time = ?, end_time = ?, classroom = ?, color = ? WHERE id = ? AND user_id = ?',
    [name, professor, day, startTime, endTime, classroom, color, id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar clase' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Clase no encontrada' });
      }
      
      db.get('SELECT * FROM classes WHERE id = ?', [id], (err, updatedClass) => {
        if (err) {
          return res.status(500).json({ error: 'Error al obtener clase actualizada' });
        }
        res.json(updatedClass);
      });
    }
  );
});

app.delete('/api/classes/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM classes WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar clase' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }
    
    res.json({ message: 'Clase eliminada exitosamente' });
  });
});

// Tasks routes
app.get('/api/tasks', authenticateToken, (req, res) => {
  const { classId } = req.query;
  let query = 'SELECT * FROM tasks WHERE user_id = ?';
  let params = [req.user.id];
  
  if (classId) {
    query += ' AND class_id = ?';
    params.push(classId);
  }
  
  query += ' ORDER BY completed, priority DESC, due_date';
  
  db.all(query, params, (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener tareas' });
    }
    res.json(tasks);
  });
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title, description, dueDate, priority, classId } = req.body;
  
  db.run(
    'INSERT INTO tasks (user_id, class_id, title, description, due_date, priority, completed) VALUES (?, ?, ?, ?, ?, ?, 0)',
    [req.user.id, classId || null, title, description, dueDate, priority],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear tarea' });
      }
      
      db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, newTask) => {
        if (err) {
          return res.status(500).json({ error: 'Error al obtener tarea creada' });
        }
        res.status(201).json(newTask);
      });
    }
  );
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, priority, classId, completed } = req.body;
  
  db.run(
    'UPDATE tasks SET title = ?, description = ?, due_date = ?, priority = ?, class_id = ?, completed = ? WHERE id = ? AND user_id = ?',
    [title, description, dueDate, priority, classId || null, completed ? 1 : 0, id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar tarea' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
      }
      
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, updatedTask) => {
        if (err) {
          return res.status(500).json({ error: 'Error al obtener tarea actualizada' });
        }
        res.json(updatedTask);
      });
    }
  );
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar tarea' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json({ message: 'Tarea eliminada exitosamente' });
  });
});

// Toggle task completion
app.patch('/api/tasks/:id/toggle', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT completed FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id], (err, task) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener tarea' });
    }
    
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    const newCompleted = task.completed ? 0 : 1;
    
    db.run('UPDATE tasks SET completed = ? WHERE id = ? AND user_id = ?', 
      [newCompleted, id, req.user.id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar tarea' });
      }
      
      res.json({ completed: newCompleted === 1 });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
