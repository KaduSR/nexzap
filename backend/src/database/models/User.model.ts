import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Company } from './Company.model';

@Table({ tableName: 'Users' })
export class User extends Model<User> {
  @Column
  declare name: string;
  
  @Column
  declare email: string;
  
  @Column
  declare password: string;
  
  @ForeignKey(() => Company)
  @Column({ allowNull: true })
  declare companyId: number;
  
  @BelongsTo(() => Company)
  declare company: Company;
}
