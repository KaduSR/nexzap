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
import { Company } from "./Company.model";
import { ContactList } from "./ContactList.model";

@Table({
  tableName: "ContactListItems",
})
export class ContactListItem extends Model<ContactListItem> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  number!: string;

  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.BOOLEAN)
  isWhatsappValid!: boolean;

  @ForeignKey(() => ContactList)
  @Column
  contactListId!: number;

  @BelongsTo(() => ContactList)
  contactList!: ContactList;

  @ForeignKey(() => Company)
  @Column
  companyId!: number;

  @BelongsTo(() => Company)
  company!: Company;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
