import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "queues", timestamps: true })
export class Queue extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  color!: string;

  @Column({ type: DataType.TEXT })
  greetingMessage!: string;
}
