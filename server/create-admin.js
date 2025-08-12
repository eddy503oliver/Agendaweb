const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    const adminUsername = 'admin';
    const adminEmail = 'admin@agenda.com';
    const adminPassword = 'admin123'; // Cambia esto por una contraseña segura
    
    // Verificar si el admin ya existe
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [adminUsername, adminEmail]);
    
    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists!');
      console.log('Username:', existingUser.rows[0].username);
      console.log('Email:', existingUser.rows[0].email);
      console.log('Role:', existingUser.rows[0].role);
      return;
    }
    
    // Crear el admin
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [adminUsername, adminEmail, hashedPassword, 'admin']
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('ID:', result.rows[0].id);
    console.log('Username:', result.rows[0].username);
    console.log('Email:', result.rows[0].email);
    console.log('Role:', result.rows[0].role);
    console.log('Password:', adminPassword);
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login!');
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();
