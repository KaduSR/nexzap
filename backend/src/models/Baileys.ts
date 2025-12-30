import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Whatsapp from "./Whatsapp";

@Table({
  tableName: "Baileys",
})
class Baileys extends Model<Baileys> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId!: number;

  @BelongsTo(() => Whatsapp)
  whatsapp!: Whatsapp;

  @Column(DataType.JSON)
  contacts!: any;

  @Column(DataType.JSON)
  chats!: any;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default Baileys;