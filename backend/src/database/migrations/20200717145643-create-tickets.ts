import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Tickets", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending"
      },
      unreadMessages: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      lastMessage: {
        type: DataTypes.STRING,
        defaultValue: ""
      },
      isGroup: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      contactId: {
        type: DataTypes.INTEGER,
        references: { model: "Contacts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      whatsappId: {
        type: DataTypes.INTEGER,
        references: { model: "Whatsapps", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      queueId: {
        type: DataTypes.INTEGER,
        references: { model: "Queues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      useIntegration: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      integrationId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      promptId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      flowCampaignId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      flowStepId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      flowContext: {
        type: DataTypes.JSON,
        allowNull: true
      },
      flowStopped: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      typebotSessionId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      typebotStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    return queryInterface.dropTable("Tickets");
  }
};