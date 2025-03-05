import { Request, Response } from "express";
import { ChatbotControllerInterface } from "./user_controller_interface";
import { Logger } from "@firebase/logger";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getBotResponse } from "./utils/bot_response";

export class ChatbotController implements ChatbotControllerInterface {
    private db = getFirestore();
    
    async sendMessage(req: Request, resp: Response): Promise<Response<unknown, Record<string, unknown>>> {
        const logger = new Logger("sendMessage");
        try {
          const { text, userId } = req.body;
      
          if (!text || !userId) {
            logger.error("Either of userId, text is missing")
            return resp.status(400).json({ error: "Missing required parameters" });
          }
    
          logger.info(`UserId: ${userId}, text: ${text}`);
    
          const timestamp = Date.now().toString();
          const userMessage = { text, by: "user" };
          const botResponse = { text: getBotResponse(text), by: "bot" };
          logger.info(`UserMessage: ${JSON.stringify(userMessage)}, botResponse: ${JSON.stringify(botResponse)}`);
    
          const userRef = this.db.collection("Messages").doc(userId);
          const botResponseId: string = timestamp+1000;
          await userRef.set({
            [timestamp]: userMessage,
            [botResponseId]: botResponse,
          }, { merge: true });
    
          logger.info(`Successfully replied and saved user message for userId: ${userId}`);
      
          return resp.status(200).json({ message: botResponse.text, botResponseId: botResponseId, userMessageId: timestamp});
        } catch (error) {
          console.error("Error saving message:", error);
          return resp.status(500).json({ error: "Internal Server Error" });
        }
   }
    
    async deleteMessage(req: Request, resp: Response): Promise<Response<unknown, Record<string, unknown>>> {
        const logger = new Logger("deleteMessage");
        const { userId, messageId } = req.body;
        
        if (!userId || !messageId) {
            logger.error("Either of userId, text is missing")
            return resp.status(400).json({ error: "Missing required parameters" });
        }

        logger.info(`UserId:${userId}, messageID: ${messageId}`);

        const userRef = this.db.collection("Messages").doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            logger.error(`User doc doesn't exist for userId:${userId}`);
            return resp.status(404).json({ error: "User not found" });
            
        }

        const messages = userDoc.data() || {};

        if (!messages[messageId] || messages[messageId].by !== "user") {
            logger.error(`MessageId: ${messageId} not found for userId: ${userId}`);
            return resp.status(403).json({ error: "Message not found" });
        }

        logger.info(`Message found for messageId: ${messageId}, userId: ${userId}, messageDetails: ${JSON.stringify(messages[messageId])}`);

        if (messages[messageId].by !== "user") {
            logger.error(`Non user message tried to be deleted by user for messageId:${messageId}, userId: ${userId}. Please investigate`);
            return resp.status(403).json({ error: "Cannot delete this message" });
        }

        logger.info(`Successfully deleted user message for messageId: ${messageId}, userId: ${userId}`);

        await userRef.update({ [messageId]: admin.firestore.FieldValue.delete() });
        return resp.status(200).json({ success: true, message: "Message deleted" });
    }

    async editMessage(req: Request, resp: Response): Promise<Response<unknown, Record<string, unknown>>> {
        const logger = new Logger("editMessage");
        try {
            const { userId, messageId, newText } = req.body;

            if (!userId || !messageId || !newText) {
            logger.error("Either of userId, messageId or newText is missing");
            return resp.status(400).json({ error: "Missing required parameters" });
            }

            logger.info(`UserId: ${userId}, messageId: ${messageId}, newText: ${newText}`);

            const userRef = this.db.collection("Messages").doc(userId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
            logger.error(`No messages found for userId: ${userId}`);
            return resp.status(404).json({ error: "User not found" });
            }

            const messages = userDoc.data() || {};

            if (!messages[messageId] || messages[messageId].by !== "user") {
            logger.error(`MessageId: ${messageId} not found for userId: ${userId}`);
            return resp.status(403).json({ error: "Message not found" });
            }

            logger.info(`Existing message details: ${JSON.stringify(messages[messageId])}`);

            messages[messageId] = { text: newText, by: "user" };

            logger.info(`Updated message details: ${JSON.stringify(messages[messageId])}`);

            const botResponse = { text: getBotResponse(newText), by: "bot" };
            const botResponseId = (Date.now() + 1000).toString();
            logger.info(`New bot response id: ${botResponseId}, new bot response: ${JSON.stringify(botResponse)}`);

            messages[botResponseId] = botResponse;

            await userRef.set(messages, { merge: true });

            logger.info(`Message ${messageId} edited successfully for userId: ${userId}`);
            return resp.status(200).json({ message: botResponse.text, botResponseId: botResponseId });
        } catch (error) {
            logger.error("Error editing message:", error);
            return resp.status(500).json({ error: "Internal Server Error" });
        }
    }
}