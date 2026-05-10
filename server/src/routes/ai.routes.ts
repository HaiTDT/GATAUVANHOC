import { Router } from "express";
import { chat } from "../controllers/ai.controller";

export const aiRouter = Router();

aiRouter.post("/chat", chat);
