import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Company } from "./Company.model";

@Table({ tableName: "invoices", timestamps: true })
export class Invoice extends Model {
  @Column({ type: DataType.DECIMAL(10, 2) })
  value!: number;

  @Column
  status!: string;

  @Column
  paidAt!: Date;

  @Column
  dueDate!: Date;

  @ForeignKey(() => Company)
  @Column
  companyId!: number;
}
