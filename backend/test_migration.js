const { Sequelize } = require('sequelize');

// Test database connection and migration
const testMigration = async () => {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: console.log
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Check if expenses table exists
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='expenses'");
    if (tables.length === 0) {
      console.log('❌ Expenses table not found. Run migrations first.');
      return;
    }

    // Check if note column exists
    const [columns] = await sequelize.query("PRAGMA table_info(expenses)");
    const noteColumn = columns.find(col => col.name === 'note');
    
    if (noteColumn) {
      console.log('✅ Note column found in expenses table');
      console.log('Column details:', {
        name: noteColumn.name,
        type: noteColumn.type,
        notNull: noteColumn.notnull,
        defaultValue: noteColumn.dflt_value
      });
    } else {
      console.log('❌ Note column not found. Migration may have failed.');
    }

    // Test inserting an expense with note
    const [result] = await sequelize.query(`
      INSERT INTO expenses (user_id, amount, description, category_id, note, created_at, updated_at)
      VALUES (1, 100.50, 'Test expense with note', 1, 'This is a test note', datetime('now'), datetime('now'))
    `);
    
    console.log('✅ Test expense with note inserted successfully');

    // Test retrieving the expense
    const [expenses] = await sequelize.query(`
      SELECT * FROM expenses WHERE note IS NOT NULL ORDER BY id DESC LIMIT 1
    `);
    
    if (expenses.length > 0) {
      console.log('✅ Test expense retrieved successfully');
      console.log('Expense details:', {
        id: expenses[0].id,
        amount: expenses[0].amount,
        description: expenses[0].description,
        note: expenses[0].note
      });
    } else {
      console.log('❌ Failed to retrieve test expense');
    }

    // Clean up test data
    await sequelize.query("DELETE FROM expenses WHERE note = 'This is a test note'");
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await sequelize.close();
  }
};

testMigration();
