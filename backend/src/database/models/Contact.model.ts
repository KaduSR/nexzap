import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Ticket } from "./Ticket.model";

@Table({
  tableName: "Contacts",
})
class Contact extends Model<Contact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  number!: string;

  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  profilePicUrl!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isGroup!: boolean;

  @Column(DataType.INTEGER)
  companyId!: number;

  @HasMany(() => Ticket)
  tickets!: Ticket[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default Contact;
