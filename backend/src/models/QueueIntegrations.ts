import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType
} from "sequelize-typescript";

@Table({
  tableName: "QueueIntegrations",
})
class QueueIntegrations extends Model<QueueIntegrations> {
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

export default QueueIntegrations;