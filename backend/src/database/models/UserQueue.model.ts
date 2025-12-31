import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Queue } from "./Queue.model";
import { User } from "./User.model";

@Table({ tableName: "UserQueues" })
export class UserQueue extends Model<UserQueue> {
  @ForeignKey(() => User)
  @Column
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Queue)
  @Column
  queueId!: number;

  @BelongsTo(() => Queue)
  queue!: Queue;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
