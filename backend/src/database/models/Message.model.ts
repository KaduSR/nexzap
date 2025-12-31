import {
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
  tableName: "Messages",
})
export class Message extends Model<Message> {
  @PrimaryKey
  @Column
  id!: string;

  @Column(DataType.TEXT)
  body!: string;

  @Column(DataType.STRING)
  ack!: number;

  @Column(DataType.BOOLEAN)
  read!: boolean;

  @Column(DataType.STRING)
  mediaType!: string;

  @Column(DataType.STRING)
  mediaUrl!: string;

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
  quotedMsgId!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  fromMe!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isPrivate!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
