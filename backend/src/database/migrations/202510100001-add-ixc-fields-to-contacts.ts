import { DataTypes, QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Contacts", "ixcId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn("Contacts", "cpf", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Contacts", "ixcId");
    await queryInterface.removeColumn("Contacts", "cpf");
  },
};
