const { Sequelize } = require('sequelize');

const checkSchema = async () => {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Check if expenses table exists
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='expenses'");
    if (tables.length === 0) {
      console.log('❌ Expenses table not found');
      return;
    }

    // Check table structure
    const [columns] = await sequelize.query("PRAGMA table_info(expenses)");
    console.log('\n📋 Current expenses table structure:');
    console.log('=====================================');
    columns.forEach(col => {
      console.log(`${col.name.padEnd(20)} | ${col.type.padEnd(15)} | ${col.notnull ? 'NOT NULL' : 'NULL'}`);
    });

    // Check if note column exists
    const noteColumn = columns.find(col => col.name === 'note');
    if (noteColumn) {
      console.log('\n✅ Note column found!');
    } else {
      console.log('\n❌ Note column NOT found. Running migration...');
      
      // Run the migration manually
      const { addColumn } = require('sequelize');
      await sequelize.getQueryInterface().addColumn('expenses', 'note', {
        type: 'VARCHAR(500)',
        allowNull: true,
        defaultValue: null
      });
      
      console.log('✅ Note column added successfully!');
      
      // Verify the column was added
      const [newColumns] = await sequelize.query("PRAGMA table_info(expenses)");
      const newNoteColumn = newColumns.find(col => col.name === 'note');
      if (newNoteColumn) {
        console.log('✅ Verification: Note column now exists');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
};

checkSchema();
