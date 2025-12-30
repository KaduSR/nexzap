import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { Optional } from "sequelize";

// Interface para definir atributos opcionais na criação (ex: ID é gerado auto)
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password_hash: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

@Table({
  tableName: "users", // Nome da tabela no banco
  timestamps: true, // Cria created_at e updated_at
})
export class User extends Model<UserAttributes, UserCreationAttributes> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password_hash!: string;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;
}
