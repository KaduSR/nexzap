import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Company } from "./Company.model";

@Table({ tableName: "settings", timestamps: true })
export class Setting extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  key!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  value!: string;

  @ForeignKey(() => Company)
  @Column
  companyId!: number;

  @BelongsTo(() => Company)
  company!: Company;
}
