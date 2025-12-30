import { Sequelize } from 'sequelize-typescript';
import { Company } from './models/Company.model';
import { User } from './models/User.model';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './src/database/database.sqlite',
  models: [Company, User],
  logging: false,
});

export async function initializeDatabase() {
  try {
    // Primeiro, sincronize o banco (isso cria as tabelas se não existirem)
    await sequelize.sync({ force: false });
    console.log('Banco de dados sincronizado com sucesso!');
    
    // Depois, verifique se há dados
    const companies = await Company.count();
    const users = await User.count();
    
    console.log(`Empresas no banco: ${companies}`);
    console.log(`Usuários no banco: ${users}`);
    
    return sequelize;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
}
