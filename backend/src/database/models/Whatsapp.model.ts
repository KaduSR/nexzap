// cspell:disable
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
  AllowNull,
  HasMany,
  Unique,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
} from "sequelize-typescript";
import { Queue } from "./Queue.model";
import { User } from "./User.model";
import { Company } from "./Company.model"; // <--- Importar Company

@Table
export class Whatsapp extends Model<Whatsapp> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(true)
  @Unique
  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.TEXT)
  session: string;

  @Column(DataType.TEXT)
  qrcode: string;

  @Column
  status: string;

  @Column
  battery: string;

  @Column
  plugged: boolean;

  @Column
  retries: number;

  @Column(DataType.TEXT)
  greetingMessage: string;

  @Column(DataType.TEXT)
  farewellMessage: string;

  @Column(DataType.TEXT)
  outOfHoursMessage: string;

  @Default(false)
  @Column
  isDefault: boolean;

  @Column(DataType.TEXT)
  token: string;

  // --- CORREÇÃO: Adicionar companyId ---
  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;
  // -------------------------------------

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
