const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixAdminRole() {
  try {
    console.log('🔍 Verificando usuarios admin...');
    
    // Verificar usuarios existentes
    const result = await pool.query('SELECT id, username, email, role FROM users WHERE username LIKE \'%admin%\';');
    
    console.log('\n📋 Usuarios encontrados:');
    result.rows.forEach(user => {
      console.log(`- ID: ${user.id} | Usuario: ${user.username} | Email: ${user.email} | Rol: ${user.role}`);
    });
    
    // Actualizar rol de admin si es necesario
    const updateResult = await pool.query(`
      UPDATE users 
      SET role = 'admin' 
      WHERE username = 'admin' AND (role IS NULL OR role != 'admin')
    `);
    
    if (updateResult.rowCount > 0) {
      console.log('\n✅ Rol de admin actualizado correctamente');
    } else {
      console.log('\nℹ️ El rol de admin ya está correcto');
    }
    
    // Crear un nuevo admin si no existe
    const adminExists = await pool.query('SELECT * FROM users WHERE username = \'superadmin\'');
    
    if (adminExists.rows.length === 0) {
      console.log('\n🆕 Creando nuevo usuario superadmin...');
      await pool.query(`
        INSERT INTO users (username, email, password, role) 
        VALUES ('superadmin', 'superadmin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
      `);
      console.log('✅ Usuario superadmin creado');
      console.log('📝 Credenciales:');
      console.log('   Usuario: superadmin');
      console.log('   Contraseña: password');
    } else {
      console.log('\nℹ️ Usuario superadmin ya existe');
    }
    
    // Mostrar usuarios finales
    const finalResult = await pool.query('SELECT id, username, email, role FROM users WHERE role = \'admin\';');
    
    console.log('\n👑 Usuarios con rol admin:');
    finalResult.rows.forEach(user => {
      console.log(`- ${user.username} (${user.email})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

fixAdminRole();
