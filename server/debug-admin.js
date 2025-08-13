const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function debugAdmin() {
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO DEL ADMIN');
    console.log('=====================================\n');
    
    // 1. Verificar conexión a la base de datos
    console.log('1️⃣ Verificando conexión a la base de datos...');
    const connectionTest = await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa:', connectionTest.rows[0].now);
    
    // 2. Verificar estructura de la tabla users
    console.log('\n2️⃣ Verificando estructura de la tabla users...');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estructura de la tabla users:');
    tableInfo.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 3. Verificar todos los usuarios
    console.log('\n3️⃣ Verificando todos los usuarios...');
    const allUsers = await pool.query('SELECT id, username, email, role, created_at FROM users ORDER BY id;');
    
    console.log('👥 Todos los usuarios:');
    allUsers.rows.forEach(user => {
      console.log(`   - ID: ${user.id} | Usuario: ${user.username} | Email: ${user.email} | Rol: "${user.role}" | Creado: ${user.created_at}`);
    });
    
    // 4. Verificar usuarios admin específicamente
    console.log('\n4️⃣ Verificando usuarios admin...');
    const adminUsers = await pool.query('SELECT * FROM users WHERE username LIKE \'%admin%\' OR role = \'admin\';');
    
    console.log('👑 Usuarios admin encontrados:');
    if (adminUsers.rows.length === 0) {
      console.log('   ❌ No se encontraron usuarios admin');
    } else {
      adminUsers.rows.forEach(user => {
        console.log(`   - ID: ${user.id} | Usuario: ${user.username} | Email: ${user.email} | Rol: "${user.role}"`);
      });
    }
    
    // 5. Verificar valores únicos en la columna role
    console.log('\n5️⃣ Verificando valores únicos en la columna role...');
    const uniqueRoles = await pool.query('SELECT DISTINCT role FROM users WHERE role IS NOT NULL;');
    
    console.log('🎭 Roles únicos encontrados:');
    uniqueRoles.rows.forEach(role => {
      console.log(`   - "${role.role}"`);
    });
    
    // 6. Intentar arreglar el problema
    console.log('\n6️⃣ Intentando arreglar el problema...');
    
    // Buscar usuarios que deberían ser admin
    const potentialAdmins = await pool.query('SELECT * FROM users WHERE username LIKE \'%admin%\';');
    
    if (potentialAdmins.rows.length > 0) {
      console.log('🛠️ Actualizando roles de usuarios admin...');
      
      for (const user of potentialAdmins.rows) {
        if (user.role !== 'admin') {
          console.log(`   🔄 Actualizando ${user.username} de "${user.role}" a "admin"`);
          await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', user.id]);
        } else {
          console.log(`   ✅ ${user.username} ya tiene rol "admin"`);
        }
      }
    }
    
    // 7. Crear un nuevo superadmin si no existe
    console.log('\n7️⃣ Creando nuevo superadmin...');
    const superAdminExists = await pool.query('SELECT * FROM users WHERE username = \'superadmin\';');
    
    if (superAdminExists.rows.length === 0) {
      console.log('🆕 Creando usuario superadmin...');
      await pool.query(`
        INSERT INTO users (username, email, password, role) 
        VALUES ('superadmin', 'superadmin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
      `);
      console.log('✅ Usuario superadmin creado exitosamente');
    } else {
      console.log('ℹ️ Usuario superadmin ya existe');
    }
    
    // 8. Verificación final
    console.log('\n8️⃣ Verificación final...');
    const finalAdmins = await pool.query('SELECT id, username, email, role FROM users WHERE role = \'admin\';');
    
    console.log('🎯 Usuarios con rol admin (final):');
    if (finalAdmins.rows.length === 0) {
      console.log('   ❌ NO HAY USUARIOS ADMIN');
    } else {
      finalAdmins.rows.forEach(user => {
        console.log(`   ✅ ${user.username} (${user.email}) - Rol: "${user.role}"`);
      });
    }
    
    // 9. Generar token de prueba
    if (finalAdmins.rows.length > 0) {
      console.log('\n9️⃣ Generando token de prueba...');
      const jwt = require('jsonwebtoken');
      const testUser = finalAdmins.rows[0];
      const testToken = jwt.sign({ 
        id: testUser.id, 
        username: testUser.username,
        role: testUser.role
      }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });
      
      console.log('🔑 Token de prueba generado:');
      console.log(`   Usuario: ${testUser.username}`);
      console.log(`   Token: ${testToken.substring(0, 50)}...`);
      
      // Decodificar token para verificar
      const decoded = jwt.decode(testToken);
      console.log('📋 Contenido del token:');
      console.log(`   - ID: ${decoded.id}`);
      console.log(`   - Username: ${decoded.username}`);
      console.log(`   - Role: "${decoded.role}"`);
    }
    
    console.log('\n🎉 Diagnóstico completado');
    console.log('\n📝 INSTRUCCIONES:');
    console.log('1. Cierra sesión completamente');
    console.log('2. Limpia el localStorage del navegador');
    console.log('3. Inicia sesión con superadmin/password');
    console.log('4. Verifica que aparezca el panel de administrador');
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  } finally {
    await pool.end();
  }
}

debugAdmin();
