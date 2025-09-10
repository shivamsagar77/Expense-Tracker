'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('expenses', 'note', {
      type: Sequelize.STRING(500),
      allowNull: true,
      defaultValue: null,
      comment: 'Short description or comment for the expense'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('expenses', 'note');
  }
};
