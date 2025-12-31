// cspell:disable
import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Company } from "./Company.model"; // Use chaves
import { Queue } from "./Queue.model"; // Use chaves
import { UserQueue } from "./UserQueue.model"; // Use chaves

@Table({ tableName: "Users" })
export class User extends Model {
  // <--- ADICIONE 'export' AQUI
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  passwordHash!: string;

  @Default("admin")
  @Column(DataType.STRING)
  profile!: string;

  @Column(DataType.STRING)
  tokenVersion!: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  super!: boolean;

  @ForeignKey(() => Company)
  @Column(DataType.INTEGER)
  companyId!: number;

  @BelongsTo(() => Company)
  Company!: Company;

  @BelongsToMany(() => Queue, () => UserQueue)
  queues!: Queue[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
