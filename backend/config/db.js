// config/db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres', 'postgres', 'shivam1234', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  logging: false, // Disable SQL query logging; set to true for debugging
});

// Optional: Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connected to PostgreSQL via Sequelize');
  })
  .catch((err) => {
    console.error('❌ Unable to connect to PostgreSQL via Sequelize:', err);
  });

module.exports = { sequelize };
