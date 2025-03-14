import { Request, Response } from "express";
import { ChatbotControllerInterface } from "./user_controller_interface";
import { Logger } from "@firebase/logger";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getBotResponse } from "../utils/bot_response";
import { DBCollection } from "../utils/constants";
import { StatusCode } from "../enums/auth_status_code";

/**
 * Controller for handling chatbot-related API requests.
 * Implements the `ChatbotControllerInterface` to manage messages exchanged with the bot.
 */
export class ChatbotController implements ChatbotControllerInterface {
    /** Firestore database instance */
    private db = getFirestore();

    /** Secret API key for request authentication */
    private SECRET_KEY: string = process.env.API_SECRET_KEY!;
    
    /**
     * Handles sending a message to the chatbot.
     * - Validates the API key.
     * - Checks if required parameters (`text` and `userId`) are present.
     * - Generates a unique message ID for the user message and bot response.
     * - Stores the message and bot response in Firestore.
     * - Returns the bot's response.
     *
     * @async
     * @function sendMessage
     * @param {Request} req - The Express request object containing `text` and `userId`.
     * @param {Response} resp - The Express response object to return the bot's reply.
     * @returns {Promise<Response>} A response containing the bot's message and generated IDs.
     */
    async sendMessage(req: Request, resp: Response): Promise<Response<unknown, Record<string, unknown>>> {
        const logger = new Logger("sendMessage");
        try {

          const apiKey = req.headers["x-api-key"];

          if (!apiKey || apiKey !== this.SECRET_KEY) {
            logger.error("Invalid or missing API key");
            return resp.status(401).json({
                code: StatusCode.INVALID_API_KEY, 
                message: "Invalid API key" 
            });
          }

          const { text, userId } = req.body;
      
          if (!text || !userId) {
            logger.error("Either of userId, text is missing")
            return resp.status(400).json({
                code: StatusCode.MISSING_REQUIRED_PARAMETERS, 
                error: "Few parameters are missing" 
            });
          }
    
          logger.info(`UserId: ${userId}, text: ${text}`);

          const now: number = Date.now();
          const messageId = now.toString();
          const userMessage = { text, by: "user" };
          const botResponse = { text: getBotResponse(text), by: "bot" };
          logger.info(`UserMessage: ${JSON.stringify(userMessage)}, botResponse: ${JSON.stringify(botResponse)}`);
    
          const userRef = this.db.collection(DBCollection.Messages).doc(userId);
          const botResponseId: string = (now+1000).toString();
          await userRef.set({
            [messageId]: userMessage,
            [botResponseId]: botResponse,
          }, { merge: true });
    
          logger.info(`Successfully replied and saved user message for userId: ${userId}`);
      
          return resp.status(200).json({
            code:StatusCode.SUCCESS, 
            message: botResponse.text, 
            botResponseId: botResponseId, 
            userMessageId: messageId
          });
        } catch (error) {
            console.error("Error saving message:", error);
            return resp.status(500).json({
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                message: "Internal Server Error" 
            });
        }
   }
    
    /**
     * Handles deleting a user message.
     * - Validates the API key.
     * - Checks if `userId` and `messageId` are provided.
     * - Checks if the message exists in Firestore.
     * - Deletes the message if it was sent by the user.
     *
     * @async
     * @function deleteMessage
     * @param {Request} req - The Express request object containing `userId` and `messageId`.
     * @param {Response} resp - The Express response object confirming deletion.
     * @returns {Promise<Response>} A response confirming message deletion.
     */
    async deleteMessage(req: Request, resp: Response): Promise<Response<unknown, Record<string, unknown>>> {
        const logger = new Logger("deleteMessage");

        try {
            const apiKey = req.headers["x-api-key"];

            if (!apiKey || apiKey !== this.SECRET_KEY) {
                logger.error("Invalid or missing API key");
                return resp.status(401).json({
                    code: StatusCode.INVALID_API_KEY, 
                    message: "Invalid API key" 
                });
            }

            const { userId, messageId } = req.body;
        
            if (!userId || !messageId) {
                logger.error("Either of userId, text is missing")
                return resp.status(400).json({
                    code: StatusCode.MISSING_REQUIRED_PARAMETERS, 
                    error: "Few parameters are missing" 
                });
            }

            logger.info(`UserId:${userId}, messageID: ${messageId}`);

            const userRef = this.db.collection(DBCollection.Messages).doc(userId);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                logger.error(`User doc doesn't exist for userId:${userId}`);
                return resp.status(404).json({
                    code: StatusCode.USER_NOT_FOUND, 
                    message: "User not found for the user id" 
                });
            }
    
            const messages = userDoc.data() || {};

            if (!messages[messageId] || messages[messageId].by !== "user") {
                logger.error(`MessageId: ${messageId} not found for userId: ${userId}`);
                return resp.status(403).json({
                    code: StatusCode.MESSAGE_NOT_FOUND, 
                    message: "Message not found for the message id" 
                });
            }
    
            logger.info(`Message found for messageId: ${messageId}, userId: ${userId}, messageDetails: ${JSON.stringify(messages[messageId])}`);
    
            if (messages[messageId].by !== "user") {
                logger.error(`Non user message tried to be deleted by user for messageId:${messageId}, userId: ${userId}. Please investigate`);
                return resp.status(403).json({
                    code: StatusCode.BAD_REQUEST,
                     message: "Cannot delete this message by user" 
                });
            }
    
            logger.info(`Successfully deleted user message for messageId: ${messageId}, userId: ${userId}`);

            await userRef.update({ [messageId]: admin.firestore.FieldValue.delete() });
            return resp.status(200).json({
                code: StatusCode.SUCCESS, 
                message: "Message deleted" 
            });

        } catch(error){
            logger.error("Error deleting message:", error);
            return resp.status(500).json({
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                message: "Internal Server Error" 
            });
        }   
    }

    /**
     * Handles editing a user message.
     * - Validates the API key.
     * - Checks if `userId`, `messageId`, and `newText` are provided.
     * - Checks if the message exists in Firestore.
     * - Updates the message and generates a new bot response.
     *
     * @async
     * @function editMessage
     * @param {Request} req - The Express request object containing `userId`, `messageId`, and `newText`.
     * @param {Response} resp - The Express response object returning the updated bot response.
     * @returns {Promise<Response>} A response containing the updated bot response.
     */
    async editMessage(req: Request, resp: Response): Promise<Response<unknown, Record<string, unknown>>> {
        const logger = new Logger("editMessage");
        try {
            const apiKey = req.headers["x-api-key"];

            if (!apiKey || apiKey !== this.SECRET_KEY) {
                logger.error("Invalid or missing API key");
                return resp.status(401).json({
                    code: StatusCode.INVALID_API_KEY, 
                    message: "Invalid API key" 
                });
             }

            const { userId, messageId, newText } = req.body;

            if (!userId || !messageId || !newText) {
                logger.error("Either of userId, messageId or newText is missing");
                return resp.status(400).json({
                    code: StatusCode.MISSING_REQUIRED_PARAMETERS, 
                    message: "Few required parameters are missing" 
                });
            }

            logger.info(`UserId: ${userId}, messageId: ${messageId}, newText: ${newText}`);

            const userRef = this.db.collection(DBCollection.Messages).doc(userId);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                logger.error(`No messages found for userId: ${userId}`);
                return resp.status(404).json({
                    code:StatusCode.USER_NOT_FOUND,
                     message: "User not found"
                });
            }

            const messages = userDoc.data() || {};

            if (!messages[messageId] || messages[messageId].by !== "user") {
                logger.error(`MessageId: ${messageId} not found for userId: ${userId}`);
                return resp.status(403).json({
                    code: StatusCode.MESSAGE_NOT_FOUND, 
                    message: "Message not found" 
                });
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
            return resp.status(200).json({
                code: StatusCode.SUCCESS, 
                message: botResponse.text, 
                botResponseId: botResponseId 
            });
        } catch (error) {
            logger.error("Error editing message:", error);
            return resp.status(500).json({
                code: StatusCode.INTERNAL_SERVER_ERROR, 
                message: "Internal Server Error" 
            });
        }
    }
}