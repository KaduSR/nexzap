import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Company } from "./Company.model";
import { Contact } from "./Contact.model";
import { User } from "./User.model";

@Table({ tableName: "tickets", timestamps: true })
export class Ticket extends Model {
  @Column({ defaultValue: "pending" })
  status!: string;

  @Column({ type: DataType.TEXT })
  lastMessage!: string;

  @Column({ defaultValue: 0 })
  unreadMessages!: number;

  @Column
  whatsappId!: number; // Mockado por enquanto

  @Column
  queueId!: number;

  @ForeignKey(() => Contact)
  @Column
  contactId!: number;

  @BelongsTo(() => Contact)
  contact!: Contact;

  @ForeignKey(() => User)
  @Column
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Company)
  @Column
  companyId!: number;
}
