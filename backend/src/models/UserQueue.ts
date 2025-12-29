
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey
} from "sequelize-typescript";
import User from "./User";
import Queue from "./Queue";

@Table({
  tableName: "UserQueues",
})
class UserQueue extends Model<UserQueue> {
  @ForeignKey(() => User)
  @Column
  userId!: number;

  @ForeignKey(() => Queue)
  @Column
  queueId!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default UserQueue;
