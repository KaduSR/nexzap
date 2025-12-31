import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

@Table({
  tableName: "QueueIntegrations",
})
export class QueueIntegrations extends Model<QueueIntegrations> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  type!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  projectName!: string;

  @Column(DataType.TEXT)
  jsonContent!: string;

  @Column(DataType.STRING)
  urlN8N!: string;

  @Column(DataType.INTEGER)
  typebotDelayMessage!: number;

  @Column(DataType.INTEGER)
  companyId!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
