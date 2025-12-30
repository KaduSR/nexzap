import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

@Table({
  tableName: "DunningSettings",
})
class DunningSettings extends Model<DunningSettings> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.INTEGER)
  companyId!: number;

  @Column(DataType.STRING)
  frequencyType!: string; // 'before_due', 'on_due', 'after_due'

  @Column(DataType.INTEGER)
  days!: number;

  @Column(DataType.TEXT)
  messageTemplate!: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default DunningSettings;
