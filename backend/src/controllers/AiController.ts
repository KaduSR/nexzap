import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { TranscriptionService } from "../services/AiServices/TranscriptionService";

export const transcribe = async (req: any, res: Response): Promise<Response> => {
    const file = req.file;
    const { companyId } = req.user; // Provided by isAuth middleware

    if (!file) {
        throw new AppError("No audio file provided.", 400);
    }

    try {
        const transcription = await TranscriptionService({
            companyId,
            audio: file
        });
        
        return res.json({ transcription });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to transcribe audio.";
        console.error("Transcription Controller Error:", error);
        // Check if it's an AppError to preserve status code
        const statusCode = (error as AppError).statusCode || 500;
        throw new AppError(message, statusCode);
    }
};
