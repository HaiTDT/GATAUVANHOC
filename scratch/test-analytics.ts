import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../server/.env") });

import { analyticsService } from "../server/src/services/analytics.service";

async function run() {
  try {
    const res = await analyticsService.getStudentClassification();
    console.log("SUCCESS:", res);
  } catch (error) {
    console.error("ERROR:", error);
  }
}

run();
