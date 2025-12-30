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
import Queue from "./Queue.model";

@Table({
  tableName: "Prompts",
})
class Prompt extends Model<Prompt> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  apiKey!: string;

  @Column(DataType.TEXT)
  prompt!: string;

  @Column(DataType.INTEGER)
  maxTokens!: number;

  @Column(DataType.INTEGER)
  temperature!: number;

  @Column(DataType.INTEGER)
  promptTokens!: number;

  @Column(DataType.INTEGER)
  completionTokens!: number;

  @Column(DataType.INTEGER)
  totalTokens!: number;

  @Column(DataType.STRING)
  voice!: string;

  @Column(DataType.STRING)
  voiceKey!: string;

  @ForeignKey(() => Queue)
  @Column
  queueId!: number;

  @BelongsTo(() => Queue)
  queue!: Queue;

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

export default Prompt;
