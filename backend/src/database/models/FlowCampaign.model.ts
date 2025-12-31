import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

@Table({
  tableName: "FlowCampaigns",
})
export class FlowCampaign extends Model<FlowCampaign> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  phrase!: string; // Trigger Keyword

  @Default(true)
  @Column(DataType.BOOLEAN)
  active!: boolean;

  @Column(DataType.JSON)
  flow!: any; // JSON containing { nodes: [], edges: [] }

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
