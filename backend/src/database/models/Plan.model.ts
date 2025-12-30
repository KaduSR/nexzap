import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { Company } from "./Company.model";

@Table({ tableName: "plans", timestamps: true })
export class Plan extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

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

  @Column
  stripePriceId!: string;

  @HasMany(() => Company)
  companies!: Company[];
}
