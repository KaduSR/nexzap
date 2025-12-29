
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
import Contact from "./Contact";
import Campaign from "./Campaign";

@Table({ tableName: "CampaignShipping" })
class CampaignShipping extends Model<CampaignShipping> {
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

export default CampaignShipping;
