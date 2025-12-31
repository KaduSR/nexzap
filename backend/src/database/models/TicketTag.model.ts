import {
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Tag } from "./Tag.model";
import { Ticket } from "./Ticket.model";

@Table({
  tableName: "TicketTags",
})
export class TicketTag extends Model<TicketTag> {
  @ForeignKey(() => Ticket)
  @Column
  ticketId!: number;

  @ForeignKey(() => Tag)
  @Column
  tagId!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
