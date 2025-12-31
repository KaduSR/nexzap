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
import { Company } from "./Company.model";
@Table({
  tableName: "Plans",
})
export class Plan extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  stripePriceId!: string;

  @Column({ defaultValue: 0 })
  users!: number;

  @Column({ defaultValue: 0 })
  connections!: number;

  @Column({ defaultValue: 0 })
  queues!: number;

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
  useFieldService!: boolean;

  @HasMany(() => Company)
  companies!: Company[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
