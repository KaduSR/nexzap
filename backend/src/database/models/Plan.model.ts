import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import Company from "./Company.model";

@Table({
  tableName: "Plans",
})
class Plan extends Model<Plan> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string; // Start, Pro, Enterprise

  @Column(DataType.STRING)
  stripePriceId!: string; // Price ID from Stripe Dashboard

  // Quantitative Limits (0 = Unlimited)
  @Column({ defaultValue: 0 })
  users!: number;

  @Column({ defaultValue: 0 })
  connections!: number;

  @Column({ defaultValue: 0 })
  queues!: number;

  // Feature Flags
  @Column({ defaultValue: false })
  useCampaigns!: boolean;

  @Column({ defaultValue: false })
  useSchedules!: boolean;

  @Column({ defaultValue: false })
  useInternalChat!: boolean;

  @Column({ defaultValue: false })
  useExternalApi!: boolean;

  @Column({ defaultValue: false })
  useKanban!: boolean;

  @Column({ defaultValue: false })
  useOpenAi!: boolean;

  @Column({ defaultValue: false })
  useIntegrations!: boolean;

  @Column({ defaultValue: false })
  useFieldService!: boolean; // App do Técnico

  @HasMany(() => Company)
  companies!: Company[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default Plan;
