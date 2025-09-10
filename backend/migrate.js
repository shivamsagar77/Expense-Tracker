const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Adjust path as needed
  logging: false
});

// Migration tracking table
const createMigrationTable = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// Get all migration files
const getMigrationFiles = () => {
  const migrationsDir = path.join(__dirname, 'migrations');
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort()
    .map(file => ({
      name: file,
      path: path.join(migrationsDir, file)
    }));
};

// Get executed migrations
const getExecutedMigrations = async () => {
  const [results] = await sequelize.query('SELECT name FROM migrations ORDER BY id');
  return results.map(row => row.name);
};

// Run migration
const runMigration = async (migration) => {
  console.log(`Running migration: ${migration.name}`);
  const migrationModule = require(migration.path);
  
  try {
    await migrationModule.up(sequelize.getQueryInterface(), Sequelize);
    await sequelize.query('INSERT INTO migrations (name) VALUES (?)', {
      replacements: [migration.name]
    });
    console.log(`✅ Migration ${migration.name} completed successfully`);
  } catch (error) {
    console.error(`❌ Migration ${migration.name} failed:`, error.message);
    throw error;
  }
};

// Rollback migration
const rollbackMigration = async (migration) => {
  console.log(`Rolling back migration: ${migration.name}`);
  const migrationModule = require(migration.path);
  
  try {
    await migrationModule.down(sequelize.getQueryInterface(), Sequelize);
    await sequelize.query('DELETE FROM migrations WHERE name = ?', {
      replacements: [migration.name]
    });
    console.log(`✅ Rollback ${migration.name} completed successfully`);
  } catch (error) {
    console.error(`❌ Rollback ${migration.name} failed:`, error.message);
    throw error;
  }
};

// Main migration function
const migrate = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    await createMigrationTable();
    
    const migrationFiles = getMigrationFiles();
    const executedMigrations = await getExecutedMigrations();
    
    const pendingMigrations = migrationFiles.filter(
      migration => !executedMigrations.includes(migration.name)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }
    
    console.log(`Found ${pendingMigrations.length} pending migrations`);
    
    for (const migration of pendingMigrations) {
      await runMigration(migration);
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Rollback function
const rollback = async (migrationName) => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    const migrationFiles = getMigrationFiles();
    const migration = migrationFiles.find(m => m.name === migrationName);
    
    if (!migration) {
      console.error(`Migration ${migrationName} not found`);
      return;
    }
    
    await rollbackMigration(migration);
    console.log('Rollback completed successfully!');
  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Command line interface
const command = process.argv[2];
const migrationName = process.argv[3];

if (command === 'migrate') {
  migrate();
} else if (command === 'rollback' && migrationName) {
  rollback(migrationName);
} else {
  console.log('Usage:');
  console.log('  node migrate.js migrate                    - Run all pending migrations');
  console.log('  node migrate.js rollback <migration_name>  - Rollback specific migration');
  console.log('');
  console.log('Available migrations:');
  getMigrationFiles().forEach(migration => {
    console.log(`  - ${migration.name}`);
  });
}
