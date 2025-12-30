import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Company } from "./Company.model";

@Table({ tableName: "contacts", timestamps: true })
export class Contact extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  number!: string;

  @Column({ type: DataType.STRING })
  profilePicUrl!: string;

  @Column({ defaultValue: false })
  isGroup!: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId!: number;

  @BelongsTo(() => Company)
  company!: Company;
}
