import express, { Express, Request, Response } from "express";
import { ChatbotController } from "../controllers/chatbot_controller";

/**
 * Class responsible for defining and managing API routes.
 * This class initializes all chatbot-related API endpoints
 * and delegates the request handling to the `ChatbotController`.
 */
export class ApiRoutes {
  /** The Express application instance */
  private expressApp: Express;

  /** The controller handling chatbot API logic */
  private chatbotController: ChatbotController;

  /**
   * Creates an instance of `ApiRoutes` and initializes the chatbot controller.
   * 
   * @param {Express} app - The Express application instance.
   */
  constructor(
    app: Express
  ) {
    this.expressApp = app;
    this.chatbotController = new ChatbotController();
  }

  /**
   * Starts listening for incoming API requests.
   * Defines the API endpoints and maps them to corresponding controller methods.
   */
  public startListening(): void {
    
    /**
     * POST /api/v1/sendMessage
     * Handles sending a message to the chatbot.
     * Delegates request handling to `ChatbotController.sendMessage`.
     */
    this.expressApp.post(
      "/api/v1/sendMessage",
      express.json(),
      (req: Request, resp: Response) => {
        void this.chatbotController.sendMessage(
          req,
          resp,
        );
      },
    );

    /**
     * DELETE /api/v1/deleteMessage
     * Handles deleting a user message.
     * Delegates request handling to `ChatbotController.deleteMessage`.
     */
    this.expressApp.delete(
      "/api/v1/deleteMessage",
      express.json(),
      (req: Request, resp: Response) => {
        void this.chatbotController.deleteMessage(
          req,
          resp,
        );
      },
    );

    /**
     * POST /api/v1/editMessage
     * Handles editing an existing user message.
     * Delegates request handling to `ChatbotController.editMessage`.
     */
    this.expressApp.post(
      "/api/v1/editMessage",
      express.json(),
      (req: Request, resp: Response) => {
        void this.chatbotController.editMessage(
          req, 
          resp,
        );
      },
    );
  }
}
