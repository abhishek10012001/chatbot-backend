import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { getRuntimeEnv, RuntimeEnv } from "./runtime_env";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { Logger } from "@firebase/logger";

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
  const logger = new Logger("sendMessage");
    try {
      const { text, userId } = req.body;
  
      if (!text || !userId) {
        logger.error("Either of userId, text is missing")
        res.status(400).json({ error: "Missing required parameters" });
        return;
      }

      logger.info(`UserId: ${userId}, text: ${text}`);

      const timestamp = Date.now().toString();
      const userMessage = { text, by: "user" };
      const botResponse = { text: getBotResponse(text), by: "bot" };
      logger.info(`UserMessage: ${JSON.stringify(userMessage)}, botResponse: ${JSON.stringify(botResponse)}`);

      const userRef = db.collection("Messages").doc(userId);
      await userRef.set({
        [timestamp]: userMessage,
        [timestamp + 1000]: botResponse,
      }, { merge: true });

      logger.info(`Successfully replied and saved user message for userId: ${userId}`);
  
      res.status(201).json({ message: "Message saved", id: userId});
    } catch (error) {
      console.error("Error saving message:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete("/api/v1/deleteMessage", async (req: Request, res: Response): Promise<void> =>  {
  const logger = new Logger("deleteMessage");
  const { userId, messageId } = req.body;
  
  if (!userId || !messageId) {
    logger.error("Either of userId, text is missing")
    res.status(400).json({ error: "Missing required parameters" });
    return;
  }

  logger.info(`UserId:${userId}, messageID: ${messageId}`);

  const userRef = db.collection("Messages").doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    logger.error(`User doc doesn't exist for userId:${userId}`);
    res.status(404).json({ error: "User not found" });
    return;
  }

  const messages = userDoc.data() || {};

  if (!messages[messageId] || messages[messageId].by !== "user") {
      logger.error(`MessageId: ${messageId} not found for userId: ${userId}`);
      res.status(403).json({ error: "Message not found" });
      return;
  }

  logger.info(`Message found for messageId: ${messageId}, userId: ${userId}, messageDetails: ${JSON.stringify(messages[messageId])}`);

  if (messages[messageId].by !== "user") {
    logger.error(`Non user message tried to be deleted by user for messageId:${messageId}, userId: ${userId}. Please investigate`);
    res.status(403).json({ error: "Cannot delete this message" });
    return;
  }

  logger.info(`Successfully deleted user message for messageId: ${messageId}, userId: ${userId}`);

  await userRef.update({ [messageId]: admin.firestore.FieldValue.delete() });
  res.json({ success: true, message: "Message deleted" });
});

app.post("/api/v1/editMessage", async (req: Request, res: Response): Promise<void> => {
  const logger = new Logger("editMessage");
  try {
    const { userId, messageId, newText } = req.body;

    if (!userId || !messageId || !newText) {
      logger.error("Either of userId, messageId or newText is missing");
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    logger.info(`UserId: ${userId}, messageId: ${messageId}, newText: ${newText}`);

    const userRef = db.collection("Messages").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      logger.error(`No messages found for userId: ${userId}`);
      res.status(404).json({ error: "User not found" });
      return;
    }

    const messages = userDoc.data() || {};

    if (!messages[messageId] || messages[messageId].by !== "user") {
      logger.error(`MessageId: ${messageId} not found for userId: ${userId}`);
      res.status(403).json({ error: "Message not found" });
      return;
    }

    logger.info(`Existing message details: ${JSON.stringify(messages[messageId])}`);

    messages[messageId] = { text: newText, by: "user" };

    logger.info(`Updated message details: ${JSON.stringify(messages[messageId])}`);

    const botResponse = { text: getBotResponse(newText), by: "bot" };
    const botMessageId = (Date.now() + 1000).toString();
    logger.info(`New bot response id: ${botMessageId}, new bot response: ${JSON.stringify(botResponse)}`);

    messages[botMessageId] = botResponse;

    await userRef.set(messages, { merge: true });

    logger.info(`Message ${messageId} edited successfully for userId: ${userId}`);
    res.status(200).json({ message: "Message edited successfully" });
  } catch (error) {
    logger.error("Error editing message:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT: number = parseInt(process.env.PORT || "5001", 10);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
