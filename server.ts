import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { getRuntimeEnv, RuntimeEnv } from "./runtime_env";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const runtimeEnv: RuntimeEnv = getRuntimeEnv();
console.log(`RuntimeEnv: ${runtimeEnv}`);

dotenv.config({ path: `.env.${runtimeEnv}` });

const adminApp: admin.app.App = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = getFirestore();

const app = express();
app.use(cors());
app.use(express.json());

const getBotResponse = (userText: string) => {
  return `Bot response to: ${userText}`;
};

app.post("/api/v1/sendMessage", async (req: Request, res: Response): Promise<void> => {
    try {
      const { text, userId } = req.body;
  
      if (!text || !userId) {
        res.status(400).json({ error: "UserId and text are missing" });
        return;
      }

      const timestamp = Date.now().toString();
      const userMessage = { text, by: "user" };
      const botResponse = { text: getBotResponse(text), by: "bot" };

      const userRef = db.collection("Messages").doc(userId);
      await userRef.set({
        [timestamp]: userMessage,
        [Date.now() + 1000]: botResponse,
      }, { merge: true });
  
      res.status(201).json({ message: "Message saved", id: userId});
    } catch (error) {
      console.error("Error saving message:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

const PORT: number = parseInt(process.env.PORT || "5001", 10);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
