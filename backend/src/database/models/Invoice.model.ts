import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
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
import { Company } from "./Company.model";
import { Contact } from "./Contact.model";

@Table({ tableName: "Invoices" })
export class Invoice extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.DECIMAL(10, 2))
  value!: number;

  @Column(DataType.DATEONLY)
  dueDate!: string;

  @Column(DataType.DATE)
  paidAt!: Date;

  @Default("open")
  @Column(DataType.STRING)
  status!: string; // 'paid', 'open', 'overdue'

  @AllowNull(true)
  @Column(DataType.INTEGER)
  ixcId: number;

  @ForeignKey(() => Contact)
  @Column
  contactId!: number;

  @BelongsTo(() => Contact)
  contact!: Contact;

  @ForeignKey(() => Company)
  @Column
  companyId!: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
