
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
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import Whatsapp from "./Whatsapp";
import CampaignShipping from "./CampaignShipping";

@Table({ tableName: "Campaigns" })
class Campaign extends Model<Campaign> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.TEXT)
  message1!: string;

  @Column(DataType.TEXT)
  message2!: string;

  @Column(DataType.TEXT)
  message3!: string;

  @Column(DataType.STRING)
  status!: string; // SCHEDULED, PROCESSING, FINISHED, CANCELED

  @Column(DataType.DATE)
  scheduledAt!: Date;

  @Column(DataType.DATE)
  completedAt!: Date;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId!: number;

  @BelongsTo(() => Whatsapp)
  whatsapp!: Whatsapp;

  @HasMany(() => CampaignShipping)
  shipping!: CampaignShipping[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default Campaign;
