// cspell: disable
import readline from "readline";
import { Readable } from "stream";
import { Contact } from "../../database/models/Contact.model";
import { logger } from "../../utils/logger";

interface IRequest {
  companyId: number;
  file: Express.Multer.File;
}

export const ImportIxcContactsService = async ({
  companyId,
  file,
}: IRequest): Promise<void> => {
  const { buffer } = file;
  const readableFile = new Readable();
  readableFile.push(buffer);
  readableFile.push(null);

  const contactLine = readline.createInterface({
    input: readableFile,
  });

  const contacts = [];
  let isFirstLine = true;

  // Itera linha a linha do CSV
  for await (let line of contactLine) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }

    // Regex para separar por ; ignorando o que está entre aspas
    const cells = line.split(/;(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const cleanCell = (val: string) =>
      val ? val.replace(/^"|"$/g, "").trim() : "";

    // Mapeamento baseado no CSV do IXC enviado
    const ixcId = parseInt(cleanCell(cells[1]));
    const name = cleanCell(cells[3]);
    const cpf = cleanCell(cells[5]);
    const email = cleanCell(cells[24]);
    let phone = cleanCell(cells[30]); // Telefone celular

    if (phone) {
      phone = phone.replace(/\D/g, ""); // Remove não numéricos
      if (phone.length >= 10) {
        if (!phone.startsWith("55")) {
          phone = `55${phone}`;
        }

        contacts.push({
          name,
          number: phone,
          email,
          ixcId,
          cpf,
          companyId,
          isGroup: false,
        });
      }
    }
  }

  // Insere ou Atualiza na BD
  for (const contactData of contacts) {
    try {
      const existingContact = await Contact.findOne({
        where: { number: contactData.number, companyId },
      });

      if (existingContact) {
        await existingContact.update({
          email: contactData.email,
          ixcId: contactData.ixcId,
          cpf: contactData.cpf,
        });
      } else {
        await Contact.create(contactData);
      }
    } catch (err) {
      logger.error(`Erro importar contato: ${err}`);
    }
  }
};
