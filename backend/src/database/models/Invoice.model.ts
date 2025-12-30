import {
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
import Contact from "./Contact.model";

@Table({ tableName: "Invoices" })
class Invoice extends Model<Invoice> {
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

  @ForeignKey(() => Contact)
  @Column
  contactId!: number;

  @BelongsTo(() => Contact)
  contact!: Contact;

  @Column
  companyId!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default Invoice;
