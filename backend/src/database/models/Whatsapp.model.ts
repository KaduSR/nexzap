import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
} from "sequelize-typescript";

@Table({
  tableName: "Whatsapps",
})
export class Whatsapp extends Model<Whatsapp> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  status!: string;

  @Column(DataType.TEXT)
  qrcode!: string;

  @Column(DataType.INTEGER)
  retries!: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isDefault!: boolean;

  @Column(DataType.TEXT)
  greetingMessage!: string;

  @Column(DataType.TEXT)
  farewellMessage!: string;

  @Column(DataType.TEXT)
  outOfHoursMessage!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
