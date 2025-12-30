import {
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

@Table({
  tableName: "Settings",
})
class Setting extends Model {
  @PrimaryKey
  @Column
  key!: string;

  @Column(DataType.TEXT)
  value!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default Setting;
