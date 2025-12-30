import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import Setting from "../../database/models/Setting";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
// Fix: Import Buffer explicitely to avoid type errors
import { Buffer } from "buffer";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
}

interface Request {
  companyId: number;
  audio: MulterFile;
}

export const TranscriptionService = async ({
  companyId,
  audio,
}: Request): Promise<string> => {
  try {
    const settings = await (Setting as any).findAll({
      where: {
        key: [
          "ai_transcription_provider",
          "ai_transcription_api_key",
          "ai_transcription_model",
        ],
      },
    });

    const getSettingValue = (
      key: string,
      defaultValue: string | null = null
    ) => {
      const setting = settings.find((s: any) => s.key === key);
      return setting ? setting.value : defaultValue;
    };

    const provider = getSettingValue("ai_transcription_provider", "gemini");
    const apiKey = getSettingValue("ai_transcription_api_key");
    const model = getSettingValue(
      "ai_transcription_model",
      "gemini-2.5-flash-native-audio-preview-09-2025"
    );

    // Handle both MemoryStorage (buffer) and DiskStorage (path)
    let audioBuffer = audio.buffer;
    if (!audioBuffer && audio.path) {
      audioBuffer = fs.readFileSync(audio.path);
    }

    if (!audioBuffer) {
      throw new AppError("Could not read audio file buffer.", 400);
    }

    const base64Audio = audioBuffer.toString("base64");

    if (provider === "gemini") {
      const finalApiKey = apiKey || process.env.API_KEY;
      if (!finalApiKey) {
        throw new AppError("API Key for transcription is not configured.", 500);
      }

      const ai = new GoogleGenAI({ apiKey: finalApiKey });

      const audioPart = {
        inlineData: { mimeType: audio.mimetype, data: base64Audio },
      };
      const textPart = { text: "Transcribe this audio in Portuguese." };

      const response = await ai.models.generateContent({
        model: model || "gemini-2.5-flash-native-audio-preview-09-2025",
        contents: { parts: [audioPart, textPart] },
      });

      const text = response.text;
      if (!text) {
        throw new AppError("Transcription returned empty.", 500);
      }
      return text;
    } else {
      throw new AppError(
        `Transcription provider '${provider}' is not supported yet.`,
        501
      );
    }
  } catch (error) {
    logger.error(`Error in TranscriptionService: ${error}`);
    if (error instanceof AppError) {
      throw error;
    }
    // Tratamento genérico para erros de API (ex: chave inválida, modelo não existe)
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("API key")) {
      throw new AppError("Chave de API inválida ou sem saldo.", 401);
    }
    throw new AppError(
      "Failed to communicate with AI transcription service.",
      500
    );
  }
};
