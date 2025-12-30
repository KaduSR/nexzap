import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Plans", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      users: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      connections: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      queues: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      useCampaigns: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      useSchedules: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      useInternalChat: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      useExternalApi: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      useKanban: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      useOpenAi: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      useIntegrations: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      useFieldService: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      stripePriceId: {
        type: DataTypes.STRING,
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
    return queryInterface.dropTable("Plans");
  }
};