// cspell:disable
import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Company } from "./Company.model"; // Use chaves {} se o Company já tiver sido corrigido
import { Ticket } from "./Ticket.model"; // Use chaves {} se o Ticket já tiver sido corrigido

@Table({ tableName: "Contacts" })
export class Contact extends Model {
  // <--- ADICIONE 'export' AQUI
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  number!: string;

  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  profilePicUrl!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isGroup!: boolean;

  @ForeignKey(() => Company)
  @Column(DataType.INTEGER)
  companyId!: number;

  @HasMany(() => Ticket)
  tickets!: Ticket[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
