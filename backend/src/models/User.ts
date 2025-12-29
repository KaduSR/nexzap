import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
  BelongsToMany
} from "sequelize-typescript";
import Queue from "./Queue";
import UserQueue from "./UserQueue";

@Table({
  tableName: "Users",
})
class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  passwordHash!: string;

  @Default("admin")
  @Column(DataType.STRING)
  profile!: string;

  @Column(DataType.STRING)
  tokenVersion!: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active!: boolean;

  @Column(DataType.INTEGER)
  companyId!: number;

  @BelongsToMany(() => Queue, () => UserQueue)
  queues!: Queue[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default User;