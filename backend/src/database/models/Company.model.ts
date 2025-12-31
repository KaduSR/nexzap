// cspell:disable
import {
  AutoIncrement,
  BelongsTo,
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
import { Contact } from "./Contact.model";
import { Plan } from "./Plan.model";
import { User } from "./User.model";

@Table({
  tableName: "Companies",
})
export class Company extends Model<Company> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string; // Razão Social / Nome Fantasia

  @Column(DataType.STRING)
  email!: string; // Email Financeiro/Admin

  @Column(DataType.STRING)
  document!: string; // CNPJ ou CPF

  @Column(DataType.STRING)
  phone!: string; // Telefone de Contato

  @Column(DataType.STRING)
  address!: string;

  @Column(DataType.STRING)
  city!: string;

  @Column(DataType.STRING)
  state!: string;

  @Column(DataType.STRING)
  zipcode!: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  status!: boolean; // Active/Inactive

  @Column(DataType.DATEONLY)
  dueDate!: Date; // Payment Due Date

  @Column(DataType.STRING)
  stripeCustomerId!: string;

  @Column(DataType.STRING)
  stripeSubscriptionId!: string;

  @Default("inactive")
  @Column(DataType.STRING)
  stripeSubscriptionStatus!: string;

  @ForeignKey(() => Plan)
  @Column
  planId!: number;

  @ForeignKey(() => User)
  @Column
  userId!: number;

  @BelongsTo(() => Plan)
  plan!: Plan;

  @HasMany(() => User)
  users!: User[];

  @HasMany(() => Contact)
  contacts!: Contact[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
