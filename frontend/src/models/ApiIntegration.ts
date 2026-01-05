// cspell: disable
import { Model } from "sequelize";

class ApiIntegration extends Model {
  public id!: number;
  public name!: string;
  public projectName!: string;
  public jsonContent!: string;
  public url!: string;
  public sessionId!: string;
  public qrcode!: string;
  public status!: string;
  public language!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public tenantId!: number | null;
}

export default ApiIntegration;
