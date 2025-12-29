
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
import Ticket from "./Ticket";
import TicketTag from "./TicketTag";

@Table({
  tableName: "Tags",
})
class Tag extends Model<Tag> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  color!: string;

  @Column(DataType.BOOLEAN)
  kanban!: boolean;

  @BelongsToMany(() => Ticket, () => TicketTag)
  tickets!: Ticket[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}

export default Tag;
