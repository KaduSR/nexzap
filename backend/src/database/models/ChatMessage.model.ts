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
import { Chat } from "./Chat.model";
import { User } from "./User.model";

@Table({
  tableName: "ChatMessages",
})
export class ChatMessage extends Model<ChatMessage> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @ForeignKey(() => Chat)
  @Column
  chatId!: number;

  @BelongsTo(() => Chat)
  chat!: Chat;

  @ForeignKey(() => User)
  @Column
  senderId!: number;

  @BelongsTo(() => User)
  sender!: User;

  @Column(DataType.TEXT)
  message!: string;

  @Column(DataType.STRING)
  mediaPath!: string;

  @Column(DataType.STRING)
  mediaName!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
