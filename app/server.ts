import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { getRuntimeEnv, RuntimeEnv } from "../runtime_env";
import * as admin from "firebase-admin";
import { ApiRoutes } from "./routes/api_routes";

const runtimeEnv: RuntimeEnv = getRuntimeEnv();
console.log(`RuntimeEnv: ${runtimeEnv}`);

dotenv.config({ path: `.env.${runtimeEnv}` });

const adminApp: admin.app.App = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());


const PORT: number = parseInt(process.env.PORT || "5001", 10);
expressApp.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  const apiRoutes = new ApiRoutes(expressApp);
  apiRoutes.startListening();
});
