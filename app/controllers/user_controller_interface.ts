import { Request, Response } from "express";

export interface ChatbotControllerInterface {
    sendMessage(
      req: Request,
      resp: Response,
    ): Promise<Response<unknown, Record<string, unknown>>>;

    editMessage(
      req: Request,
      resp: Response,
    ): Promise<Response<unknown, Record<string, unknown>>>;

    deleteMessage(
      req: Request,
      resp: Response,
    ): Promise<Response<unknown, Record<string, unknown>>>;
  }