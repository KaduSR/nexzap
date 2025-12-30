
import { Model, DataTypes } from "sequelize";

export class Setting extends Model {
  public key!: string;
  public value!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export default Setting;
