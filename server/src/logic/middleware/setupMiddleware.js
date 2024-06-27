import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { attachInstanceId } from "./attachInstanceId.js";

const corsOptions = {
  origin: [process.env.CLIENT_DEV_URL, process.env.CLIENT_PROD_URL],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies to be sent from client to server
};

/**
 * Configures standard middleware for the Express application.
 * @param {Object} app - Express application instance.
 */
export function setupMiddleware(app) {
  app.use(express.json());
  app.use(helmet());
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
  app.use(morgan("common"));
  app.use(bodyParser.json({ limit: "30mb", extended: true }));
  app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
  app.use(cookieParser());
  app.use(cors(corsOptions));
}

/**
 * Attaches custom middleware to the Express application.
 * @param {Object} app - Express application instance.
 */
export function attachCustomMiddleware(app) {
  app.use(attachInstanceId);
}
