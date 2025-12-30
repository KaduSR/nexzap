import { Sequelize } from 'sequelize-typescript';
import { Company } from './models/Company.model';
import { User } from './models/User.model';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './src/database/database.sqlite',
  models: [Company, User],
  logging: console.log, // Ative logs para debug
  define: {
    timestamps: true,
    underscored: false,
  },
});

// Teste a conexão e sincronização
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco estabelecida com sucesso.');
    
    // Sincronize os modelos com o banco
    await sequelize.sync({ force: false });
    console.log('Modelos sincronizados com o banco.');
    
    return sequelize;
  } catch (error) {
    console.error('Erro na conexão com o banco:', error);
    throw error;
  }
}

export { sequelize, testConnection };
