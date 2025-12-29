import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
  HasMany,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import User from "./User";
import Contact from "./Contact";
import Plan from "./Plan";

@Table({
  tableName: "Companies",
})
class Company extends Model<Company> {
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
  dueDate!: string; // Payment Due Date

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

export default Company;