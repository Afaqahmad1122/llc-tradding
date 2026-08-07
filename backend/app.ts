import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import type { NextFunction, Request, Response, RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { authRouter } from "./routes/auth.route.js";
import { carsRouter } from "./routes/cars.route.js";
import { contactMessagesRouter } from "./routes/contact-messages.route.js";
import { healthRouter } from "./routes/health.route.js";
import { jobsRouter } from "./routes/jobs.route.js";
import { ledgerRouter } from "./routes/ledger.route.js";
import { referenceRouter } from "./routes/reference.route.js";
import { reviewsRouter } from "./routes/reviews.route.js";
import { shippingRouter } from "./routes/shipping.route.js";
import { usersRouter } from "./routes/users.route.js";

export const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
/** Dev stays quiet; set HTTP_ACCESS_LOG=true to see request lines. Production always logs. */
if (env.NODE_ENV !== "development" || process.env.HTTP_ACCESS_LOG === "true") {
  app.use(morgan("combined"));
}
app.use(apiLimiter);
app.use(hpp() as unknown as RequestHandler);
app.use(cookieParser(env.COOKIE_SECRET) as unknown as RequestHandler);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

app.get("/", (_req, res) => {
  res.status(200).json({ message: "LLC Trading API is running" });
});

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/cars", carsRouter);
app.use("/reviews", reviewsRouter);
app.use("/jobs", jobsRouter);
app.use("/ledger", ledgerRouter);
app.use("/contact-messages", contactMessagesRouter);
app.use("/reference", referenceRouter);
app.use("/shipping", shippingRouter);
app.use("/users", usersRouter);

app.use((req: Request, res: Response) => {
  notFoundHandler(req, res);
});
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});
