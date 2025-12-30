import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Whatsapps", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "DISCONNECTED"
      },
      qrcode: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      retries: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      greetingMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      farewellMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      outOfHoursMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Whatsapps");
  }
};