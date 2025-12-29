
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  DataType
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
