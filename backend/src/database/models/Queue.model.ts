import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Company } from "./Company.model";
import { User } from "./User.model";
import { UserQueue } from "./UserQueue.model";
import { Whatsapp } from "./Whatsapp.model";

@Table({
  tableName: "Queues",
})
export class Queue extends Model<Queue> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  color!: string;

  @Column(DataType.STRING)
  greetingMessage!: string;

  @BelongsToMany(() => User, () => UserQueue)
  users!: User[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @BelongsToMany(() => Whatsapp, () => Whatsapp, "queueId", "whatsappId")
  whatsapp: Whatsapp[];
}
