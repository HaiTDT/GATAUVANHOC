import { Request, Response } from "express";
import { aiService } from "../services/ai.service";

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { history = [], message } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const response = await aiService.chat(history, message);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error("AI Controller Error:", error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
};
