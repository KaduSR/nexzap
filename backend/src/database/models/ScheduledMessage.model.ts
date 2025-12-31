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
import { Contact } from "./Contact.model";
import { Ticket } from "./Ticket.model";

@Table({
  tableName: "ScheduledMessages",
})
export class ScheduledMessage extends Model<ScheduledMessage> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.TEXT)
  body!: string;

  @Column(DataType.DATE)
  sendAt!: Date;

  @Default("PENDING")
  @Column(DataType.STRING)
  status!: string; // PENDING, SENT, ERROR

  @ForeignKey(() => Ticket)
  @Column
  ticketId!: number;

  @BelongsTo(() => Ticket)
  ticket!: Ticket;

  @ForeignKey(() => Contact)
  @Column
  contactId!: number;

  @BelongsTo(() => Contact)
  contact!: Contact;

  @Column(DataType.STRING)
  mediaPath!: string;

  @Column(DataType.STRING)
  mediaName!: string;

  @Column(DataType.INTEGER)
  companyId!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default ScheduledMessage;
