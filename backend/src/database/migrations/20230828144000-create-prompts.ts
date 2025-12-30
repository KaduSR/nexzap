import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Prompts", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      apiKey: {
        type: DataTypes.STRING,
        allowNull: false
      },
      prompt: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      maxTokens: {
        type: DataTypes.INTEGER,
        defaultValue: 1000
      },
      temperature: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      promptTokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      completionTokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      totalTokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      voice: {
        type: DataTypes.STRING,
        allowNull: true
      },
      voiceKey: {
        type: DataTypes.STRING,
        allowNull: true
      },
      queueId: {
        type: DataTypes.INTEGER,
        references: { model: "Queues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: true
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
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
    return queryInterface.dropTable("Prompts");
  }
};