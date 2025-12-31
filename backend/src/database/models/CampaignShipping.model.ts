import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Campaign } from "./Campaign.model";
import { Contact } from "./Contact.model";

@Table({ tableName: "CampaignShipping" })
export class CampaignShipping extends Model<CampaignShipping> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.DATE)
  deliveredAt!: Date;

  @Column(DataType.BOOLEAN)
  confirmationRequested!: boolean; // Used as error/ack flag

  @ForeignKey(() => Contact)
  @Column
  contactId!: number;

  @BelongsTo(() => Contact)
  contact!: Contact;

  @ForeignKey(() => Campaign)
  @Column
  campaignId!: number;

  @BelongsTo(() => Campaign)
  campaign!: Campaign;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
