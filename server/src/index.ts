import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { adminRouter } from "./routes/admin.routes";
import { authRouter } from "./routes/auth";
import { categoryRouter } from "./routes/categories";
import { healthRouter } from "./routes/health";
import { analyticsRouter } from "./routes/analytics.routes";
import { blogRouter } from "./routes/blogs.routes";
import { userRouter } from "./routes/user.routes";
import { aiRouter } from "./routes/ai.routes";

// New routes to be added
import { lessonRouter } from "./routes/lessons.routes";
import { assignmentRouter } from "./routes/assignments.routes";
import { bannerRouter } from "./routes/banners.routes";
import { adminAssignmentRouter } from "./routes/admin.assignments.routes";
import { adminCourseRouter } from "./routes/admin.courses.routes";
import { publicCourseRouter } from "./routes/courses.routes";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const app = express();
const port = Number(process.env.PORT ?? 4000);
const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [clientUrl, "http://localhost:3000", "https://mis-hasaki-client.vercel.app"];
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    name: "Ga Tau Van Hoc API",
    status: "running"
  });
});

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/lessons", lessonRouter);
app.use("/api/courses", publicCourseRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/api/admin", adminCourseRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin", adminAssignmentRouter);
app.use("/api/admin/analytics", analyticsRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/banners", bannerRouter);
app.use("/api/user", userRouter);
app.use("/api/ai", aiRouter);

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
