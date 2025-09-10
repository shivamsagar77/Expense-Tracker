const { Sequelize } = require('sequelize');

const fixNoteColumn = async () => {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: console.log
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Check if note column already exists
    const [columns] = await sequelize.query("PRAGMA table_info(expenses)");
    const noteColumn = columns.find(col => col.name === 'note');
    
    if (noteColumn) {
      console.log('✅ Note column already exists');
      return;
    }

    // Add the note column
    console.log('Adding note column to expenses table...');
    await sequelize.query(`
      ALTER TABLE expenses 
      ADD COLUMN note VARCHAR(500) DEFAULT NULL
    `);
    
    console.log('✅ Note column added successfully!');

    // Verify the column was added
    const [newColumns] = await sequelize.query("PRAGMA table_info(expenses)");
    const newNoteColumn = newColumns.find(col => col.name === 'note');
    
    if (newNoteColumn) {
      console.log('✅ Verification: Note column now exists');
      console.log('Column details:', {
        name: newNoteColumn.name,
        type: newNoteColumn.type,
        notNull: newNoteColumn.notnull,
        defaultValue: newNoteColumn.dflt_value
      });
    } else {
      console.log('❌ Failed to add note column');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
};

fixNoteColumn();
