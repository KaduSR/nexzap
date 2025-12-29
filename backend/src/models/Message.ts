import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  Default
} from "sequelize-typescript";
import Ticket from "./Ticket";
import Contact from "./Contact";

@Table({
  tableName: "Messages",
})
class Message extends Model<Message> {
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

export default Message;