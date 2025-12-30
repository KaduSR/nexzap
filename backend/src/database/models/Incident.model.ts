import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Tag } from "./Tag.model";

@Table({
  tableName: "Incidents",
})
class Incident extends Model<Incident> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  description!: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @Column(DataType.INTEGER)
  companyId!: number;

  @ForeignKey(() => Tag)
  @Column
  tagId!: number;

  @BelongsTo(() => Tag)
  tag!: Tag;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default Incident;
