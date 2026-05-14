import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { prisma } from "../lib/prisma";

const searchLessonsDeclaration: FunctionDeclaration = {
  name: "searchLessons",
  description: "Search for lessons in the database by title. Use this to find real lessons to recommend to the user.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description: "The search query, e.g., 'Tây Tiến', 'Đất Nước', 'Đọc hiểu'.",
      },
    },
    required: ["query"],
  },
};

export class AiService {
  private getModel() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    return genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [
        {
          functionDeclarations: [searchLessonsDeclaration],
        },
      ],
      systemInstruction: `You are a helpful and polite academic support chatbot for "Ga Tàu Văn Học" education platform.
You help students find lessons, understand literature, and guide them in their learning progress.
You MUST use the searchLessons tool to look up real lessons from the database when the student asks for topics or specific literature works.
When displaying a lesson, provide its title and a direct link to the lesson using Markdown link format: [Tên bài học](/lessons/{id}). Make sure to use the 'id' returned from the searchLessons tool.
Your responses should be in Vietnamese. Be concise, friendly, academic but approachable, and use markdown formatting.`,
    });
  }

  public async chat(history: any[], message: string) {
    try {
      const model = this.getModel();
      
      let formattedHistory = history.map((msg) => ({
        role: msg.role,
        parts: msg.parts.map((p: any) => ({ text: p.text })),
      }));

      while (formattedHistory.length > 0 && formattedHistory[0].role === "model") {
        formattedHistory.shift();
      }

      const chat = model.startChat({
        history: formattedHistory,
      });

      let result = await chat.sendMessage(message);
      
      const calls = result.response.functionCalls();
      if (calls && calls.length > 0) {
        const call = calls[0];
        if (call.name === "searchLessons") {
          const query = (call.args as any).query as string;
          
          const lessons = await prisma.lesson.findMany({
            where: {
              title: {
                contains: query,
                mode: 'insensitive'
              },
              isActive: true
            },
            select: {
              id: true,
              title: true,
              slug: true
            },
            take: 5
          });

          result = await chat.sendMessage([{
            functionResponse: {
              name: 'searchLessons',
              response: { lessons }
            }
          }]);
        }
      }

      return {
        role: "model",
        text: result.response.text(),
      };
    } catch (error) {
      console.error("AI Chat Error:", error);
      throw new Error("Failed to process chat message");
    }
  }
}

export const aiService = new AiService();
