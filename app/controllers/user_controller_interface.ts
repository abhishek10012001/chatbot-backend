import { Request, Response } from "express";

/**
 * Interface defining the contract for chatbot-related API operations.
 */
export interface ChatbotControllerInterface {
    
    /**
     * Handles sending a message to the chatbot and returns the bot's response.
     *
     * @async
     * @function sendMessage
     * @param {Request} req - The Express request object containing the user message.
     * @param {Response} resp - The Express response object used to return the bot's response.
     * @returns {Promise<Response<unknown, Record<string, unknown>>>} A promise that resolves with the bot's response.
     */
    sendMessage(
      req: Request,
      resp: Response,
    ): Promise<Response<unknown, Record<string, unknown>>>;

    /**
     * Handles editing an existing message sent by the user.
     *
     * @async
     * @function editMessage
     * @param {Request} req - The Express request object containing the message ID and new text.
     * @param {Response} resp - The Express response object used to return the updated message.
     * @returns {Promise<Response<unknown, Record<string, unknown>>>} A promise that resolves with the updated message details.
     */
    editMessage(
      req: Request,
      resp: Response,
    ): Promise<Response<unknown, Record<string, unknown>>>;

    /**
     * Handles deleting a user message from the database.
     *
     * @async
     * @function deleteMessage
     * @param {Request} req - The Express request object containing the message ID to be deleted.
     * @param {Response} resp - The Express response object used to confirm message deletion.
     * @returns {Promise<Response<unknown, Record<string, unknown>>>} A promise that resolves when the message is successfully deleted.
     */
    deleteMessage(
      req: Request,
      resp: Response,
    ): Promise<Response<unknown, Record<string, unknown>>>;
  }