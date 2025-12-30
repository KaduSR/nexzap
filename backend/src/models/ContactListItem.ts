import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType
} from "sequelize-typescript";
import ContactList from "./ContactList";
import Company from "./Company";

@Table({
  tableName: "ContactListItems",
})
class ContactListItem extends Model<ContactListItem> {
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

export default ContactListItem;