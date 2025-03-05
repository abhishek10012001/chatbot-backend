import express, { Express, Request, Response } from "express";
import { ChatbotController } from "../controllers/chatbot_controller";


export class ApiRoutes {
  private expressApp: Express;

  private chatbotController: ChatbotController;

  constructor(
    app: Express
  ) {
    this.expressApp = app;
    this.chatbotController = new ChatbotController();
  }

  public startListening(): void {
    
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
