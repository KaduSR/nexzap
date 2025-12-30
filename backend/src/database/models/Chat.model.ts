import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import Company from "./Company.model";
import User from "./User.model";

@Table({
  tableName: "Chats",
})
class Chat extends Model<Chat> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column
  title!: string;

  @Column
  uuid!: string;

  @ForeignKey(() => User)
  @Column
  ownerId!: number;

  @BelongsTo(() => User)
  owner!: User;

  @ForeignKey(() => Company)
  @Column
  companyId!: number;

  @BelongsTo(() => Company)
  company!: Company;

  @Column(DataType.TEXT)
  lastMessage!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default Chat;
