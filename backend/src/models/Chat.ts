import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import User from "./User";
import Company from "./Company";

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