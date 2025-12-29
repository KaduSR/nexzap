
import { Request, Response } from "express";
import * as SipService from "../services/SipService";

export const getSettings = async (req: any, res: any) => {
    try {
        const settings = await SipService.getConfig();
        return res.json(settings);
    } catch (err) {
        return res.status(500).json({ error: "Erro ao buscar configurações SIP." });
    }
};

export const saveSettings = async (req: any, res: any) => {
    const data = req.body;

    try {
        const result = await SipService.saveConfig(data);
        return res.json(result);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        return res.status(400).json({ error: errorMessage });
    }
};