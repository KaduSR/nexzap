
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  BelongsToMany
} from "sequelize-typescript";
import User from "./User";
import UserQueue from "./UserQueue";

@Table({
  tableName: "Queues",
})
class Queue extends Model<Queue> {
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
}

export default Queue;
