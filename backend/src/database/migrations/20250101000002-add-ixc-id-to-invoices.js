// cspell: disable
const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface) => {
    // 1. Obtém informações da tabela atual
    const tableInfo = await queryInterface.describeTable("Invoices");

    // 2. Só cria a coluna se ela NÃO existir
    if (!tableInfo.ixcId) {
      await queryInterface.addColumn("Invoices", "ixcId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      });

      // Adiciona o index
      await queryInterface.addIndex("Invoices", ["ixcId"]);
    }
  },

  down: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable("Invoices");

    // Só remove se existir
    if (tableInfo.ixcId) {
      await queryInterface.removeColumn("Invoices", "ixcId");
    }
  },
};
