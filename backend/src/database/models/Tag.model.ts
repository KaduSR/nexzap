import {
  AutoIncrement,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import Ticket from "./Ticket.model";
import TicketTag from "./TicketTag.model";

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
