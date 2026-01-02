// cspell: disable
const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable("Contacts");

    // Verifica se a coluna ixcId já existe antes de adicionar
    if (!tableInfo.ixcId) {
      await queryInterface.addColumn("Contacts", "ixcId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      });
    }

    // Verifica se a coluna cpf já existe antes de adicionar
    if (!tableInfo.cpf) {
      await queryInterface.addColumn("Contacts", "cpf", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  down: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable("Contacts");

    if (tableInfo.cpf) {
      await queryInterface.removeColumn("Contacts", "cpf");
    }
    if (tableInfo.ixcId) {
      await queryInterface.removeColumn("Contacts", "ixcId");
    }
  },
};
