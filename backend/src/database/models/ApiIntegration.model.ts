import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import Company from "./Company.model";

@Table({
  tableName: "ApiIntegrations",
})
class ApiIntegration extends Model<ApiIntegration> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  projectName!: string;

  @Column(DataType.TEXT)
  jsonContent!: string;

  @Column(DataType.STRING)
  url!: string;

  @Column(DataType.STRING)
  sessionId!: string;

  @Column(DataType.TEXT)
  qrcode!: string;

  @Column(DataType.STRING)
  status!: string; // DISCONNECTED, CONNECTED

  @Column(DataType.STRING)
  language!: string;

  @ForeignKey(() => Company)
  @Column
  companyId!: number;

  @BelongsTo(() => Company)
  company!: Company;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default ApiIntegration;
