# Database Migrations Guide

This project uses a custom migration system to manage database schema changes.

## What are Migrations?

Migrations are version-controlled database schema changes that help you:
- Track database changes over time
- Apply changes consistently across different environments
- Rollback changes if needed
- Collaborate with team members on database changes

## Migration Files

All migration files are stored in the `migrations/` directory and follow this naming convention:
- `001_create_expenses_table.js`
- `002_add_note_column_to_expenses.js`
- `003_add_new_feature.js`
- etc.

## Running Migrations

### Run All Pending Migrations
```bash
cd backend
npm run migrate
```

### Rollback a Specific Migration
```bash
cd backend
npm run migrate:rollback 002_add_note_column_to_expenses.js
```

### Manual Migration (Alternative)
```bash
cd backend
node migrate.js migrate
node migrate.js rollback <migration_name>
```

## Migration File Structure

Each migration file exports two functions:

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Code to apply the migration
    await queryInterface.addColumn('expenses', 'note', {
      type: Sequelize.STRING(500),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Code to rollback the migration
    await queryInterface.removeColumn('expenses', 'note');
  }
};
```

## Available Migration Commands

- `queryInterface.createTable()` - Create a new table
- `queryInterface.dropTable()` - Drop a table
- `queryInterface.addColumn()` - Add a column to existing table
- `queryInterface.removeColumn()` - Remove a column from table
- `queryInterface.changeColumn()` - Modify a column
- `queryInterface.addIndex()` - Add an index
- `queryInterface.removeIndex()` - Remove an index

## Migration Tracking

The system automatically creates a `migrations` table to track which migrations have been executed. This prevents running the same migration twice.

## Best Practices

1. **Always test migrations** on a copy of your database first
2. **Write reversible migrations** - always implement the `down` function
3. **Use descriptive names** for migration files
4. **Don't edit existing migrations** - create new ones instead
5. **Backup your database** before running migrations in production

## Current Migrations

1. **001_create_expenses_table.js** - Creates the expenses table with all necessary columns
2. **002_add_note_column_to_expenses.js** - Adds the `note` column to expenses table

## Troubleshooting

If a migration fails:
1. Check the error message
2. Fix the issue in the migration file
3. Run the migration again
4. If needed, rollback and fix the issue

## Example: Adding a New Column

```javascript
// migrations/003_add_status_column.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('expenses', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('expenses', 'status');
  }
};
```
