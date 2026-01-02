// cspell:disable
import * as Yup from "yup";
import { Whatsapp } from "../../database/models/Whatsapp.model";
import AppError from "../../errors/AppError";

interface WhatsappData {
  name?: string;
  status?: string;
  session?: string;
  isDefault?: boolean;
  greetingMessage?: string;
  farewellMessage?: string;
  outOfHoursMessage?: string;
  queueIds?: number[];
  token?: string;
}

interface Request {
  whatsappData: WhatsappData;
  whatsappId: string;
  companyId: number;
}

interface Response {
  whatsapp: Whatsapp;
}

const UpdateWhatsAppService = async ({
  whatsappData,
  whatsappId,
  companyId,
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    isDefault: Yup.boolean(),
  });

  const {
    name,
    status,
    isDefault,
    session,
    greetingMessage,
    farewellMessage,
    outOfHoursMessage,
    token,
  } = whatsappData;

  try {
    await schema.validate({ name, status, isDefault });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (isDefault) {
    await Whatsapp.update(
      { isDefault: false },
      { where: { companyId, isDefault: true } }
    );
  }

  const whatsapp = await Whatsapp.findOne({
    where: { id: whatsappId, companyId },
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  await whatsapp.update({
    name,
    status,
    session,
    greetingMessage,
    farewellMessage,
    outOfHoursMessage,
    isDefault,
    token,
  });

  return { whatsapp };
};

export default UpdateWhatsAppService;
