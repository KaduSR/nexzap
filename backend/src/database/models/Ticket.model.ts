import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Contact } from "./Contact.model";
import { Tag } from "./Tag.model";
import { TicketTag } from "./TicketTag.model";
import { User } from "./User.model";
import { Whatsapp } from "./Whatsapp.model";

@Table({
  tableName: "Tickets",
})
export class Ticket extends Model<Ticket> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column({ defaultValue: "pending" })
  status!: string; // open, pending, closed

  @Column
  unreadMessages!: number;

  @Column
  lastMessage!: string;

  @Default(false)
  @Column
  isGroup!: boolean;

  @ForeignKey(() => User)
  @Column
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Contact)
  @Column
  contactId!: number;

  @BelongsTo(() => Contact)
  contact!: Contact;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId!: number;

  @BelongsTo(() => Whatsapp)
  whatsapp!: Whatsapp;

  @Default(false)
  @Column
  useIntegration!: boolean;

  @Column
  integrationId!: number;

  @Column
  typebotSessionId!: string;

  @Default(false)
  @Column
  typebotStatus!: boolean;

  @Column
  promptId!: number;

  @Column
  companyId!: number;

  // --- FLOWBUILDER COLUMNS ---
  @Column
  flowCampaignId!: number; // ID of active Flow

  @Column
  flowStepId!: string; // Current Node ID

  @Column(DataType.JSON)
  flowContext!: any; // Stores variables (e.g., input names, email)

  @Default(false)
  @Column
  flowStopped!: boolean; // If true, bot is paused (handover or finished)

  @BelongsToMany(() => Tag, () => TicketTag)
  tags!: Tag[];

  @HasMany(() => TicketTag)
  ticketTags!: TicketTag[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
