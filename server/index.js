const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { pool, initializeDatabase } = require('./database');
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

// Initialize database
initializeDatabase();

// Authentication middleware
function authenticateToken(req, res, next) {
  console.log('🔐 Middleware de autenticación ejecutándose...');
  console.log('📋 Headers recibidos:', req.headers);
  
  const authHeader = req.headers['authorization'];
  console.log('🔑 Authorization header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('🎫 Token extraído:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');

  if (!token) {
    console.log('❌ No se encontró token');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Error verificando token:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('✅ Token válido, usuario:', user);
    req.user = user;
    next();
  });
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    
    if (!pool) {
      return res.status(500).json({ error: 'Database not available' });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, role',
      [username, email, hashedPassword, 'user'] // Default role is 'user'
    );

    const token = jwt.sign({ 
      id: result.rows[0].id, 
      username, 
      role: result.rows[0].role 
    }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { 
        id: result.rows[0].id, 
        username, 
        email,
        role: result.rows[0].role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ 
      id: user.id, 
      username: user.username,
      role: user.role
    }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    console.log('👤 Ruta /auth/me ejecutándose...');
    console.log('🔍 Usuario del token:', req.user);
    console.log('🆔 ID del usuario:', req.user.id);
    
    const result = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [req.user.id]);
    console.log('📊 Resultado de la consulta:', result.rows);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado en la base de datos');
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = result.rows[0];
    console.log('✅ Usuario encontrado:', userData);
    console.log('🎭 Rol del usuario:', userData.role);
    
    res.json(userData);
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
});

// Change password route
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Get current user
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Error changing password' });
  }
});

// Classes routes
app.get('/api/classes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes WHERE user_id = $1 ORDER BY day, start_time', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Error fetching classes' });
  }
});

app.post('/api/classes', authenticateToken, async (req, res) => {
  try {
    const { name, professor, day, start_time, end_time, classroom } = req.body;

    if (!name || !day || !start_time || !end_time) {
      return res.status(400).json({ error: 'Name, day, start time, and end time are required' });
    }

    const result = await pool.query(
      'INSERT INTO classes (user_id, name, professor, day, start_time, end_time, classroom) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [req.user.id, name, professor, day, start_time, end_time, classroom]
    );
    
    res.status(201).json({ id: result.rows[0].id, message: 'Class created successfully' });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Error creating class' });
  }
});

app.put('/api/classes/:id', authenticateToken, async (req, res) => {
  try {
    const { name, professor, day, start_time, end_time, classroom } = req.body;
    const classId = req.params.id;

    if (!name || !day || !start_time || !end_time) {
      return res.status(400).json({ error: 'Name, day, start time, and end time are required' });
    }

    const result = await pool.query(
      'UPDATE classes SET name = $1, professor = $2, day = $3, start_time = $4, end_time = $5, classroom = $6 WHERE id = $7 AND user_id = $8',
      [name, professor, day, start_time, end_time, classroom, classId, req.user.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json({ message: 'Class updated successfully' });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'Error updating class' });
  }
});

app.delete('/api/classes/:id', authenticateToken, async (req, res) => {
  try {
    const classId = req.params.id;

    const result = await pool.query('DELETE FROM classes WHERE id = $1 AND user_id = $2', [classId, req.user.id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'Error deleting class' });
  }
});

// Tasks routes
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.query;
    let query = 'SELECT t.*, c.name as class_name FROM tasks t LEFT JOIN classes c ON t.class_id = c.id WHERE t.user_id = $1';
    let params = [req.user.id];

    if (classId) {
      query += ' AND t.class_id = $2';
      params.push(classId);
    }

    query += ' ORDER BY t.due_date, t.created_at';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, due_date, class_id } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      'INSERT INTO tasks (user_id, class_id, title, description, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.user.id, class_id || null, title, description, due_date]
    );
    
    res.status(201).json({ id: result.rows[0].id, message: 'Task created successfully' });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Error creating task' });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, due_date, class_id } = req.body;
    const taskId = req.params.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, due_date = $3, class_id = $4 WHERE id = $5 AND user_id = $6',
      [title, description, due_date, class_id || null, taskId, req.user.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Error updating task' });
  }
});

app.patch('/api/tasks/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;

    const result = await pool.query(
      'UPDATE tasks SET completed = NOT completed WHERE id = $1 AND user_id = $2',
      [taskId, req.user.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task status updated successfully' });
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ error: 'Error toggling task' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;

    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [taskId, req.user.id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Error deleting task' });
  }
});

// Admin routes
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [usersCount, classesCount, tasksCount] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM classes'),
      pool.query('SELECT COUNT(*) as count FROM tasks')
    ]);

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalClasses: parseInt(classesCount.rows[0].count),
      totalTasks: parseInt(tasksCount.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

app.put('/api/admin/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role',
      [role, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'User role updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Error updating user role' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
