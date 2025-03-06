import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { getRuntimeEnv, RuntimeEnv } from "../runtime_env";
import * as admin from "firebase-admin";
import { ApiRoutes } from "./routes/api_routes";

/**
 * Determines the runtime environment (development, production, or test).
 * @constant {RuntimeEnv} runtimeEnv - The current runtime environment.
 */
const runtimeEnv: RuntimeEnv = getRuntimeEnv();
console.log(`RuntimeEnv: ${runtimeEnv}`);

/**
 * Loads environment variables from the corresponding `.env` file based on the runtime environment.
 */
dotenv.config({ path: `.env.${runtimeEnv}` });

/**
 * Initializes Firebase Admin SDK using application default credentials.
 * @constant {admin.app.App} adminApp - The initialized Firebase Admin app instance.
 */
const adminApp: admin.app.App = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

/**
 * Creates an Express application instance.
 * @constant {express.Application} expressApp - The Express application.
 */
const expressApp = express();

/**
 * Configures Express middleware:
 * - Enables Cross-Origin Resource Sharing (CORS).
 * - Parses incoming JSON requests.
 */
expressApp.use(cors());
expressApp.use(express.json());

/**
 * Retrieves the server's port from environment variables or defaults to 5001.
 * @constant {number} PORT - The port number the server listens on.
 */
const PORT: number = parseInt(process.env.PORT || "5001", 10);

/**
 * Starts the Express server and initializes API routes.
 * @constant {import("http").Server} server - The HTTP server instance.
 */
const server = expressApp.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  const apiRoutes = new ApiRoutes(expressApp);
  apiRoutes.startListening();
});

export { expressApp, server };