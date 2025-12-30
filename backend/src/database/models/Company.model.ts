import { Table, Column, Model, HasMany } from 'sequelize-typescript';
import { User } from './User.model';

@Table({ tableName: 'Companies' })
export class Company extends Model<Company> {
  @Column
  declare name: string;
  
  @HasMany(() => User)
  declare users: User[];
}
