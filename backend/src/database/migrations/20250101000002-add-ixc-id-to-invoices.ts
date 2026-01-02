import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript/dist";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Invoices", "ixcId", {
      type: DataType.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addIndex("Invoice", ["ixcId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Invoices", "ixcId");
  },
};
