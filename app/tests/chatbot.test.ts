import request from "supertest";
import { expressApp, server } from "../server";

describe("Chatbot API - sendMessage", () => {
  const validApiKey = process.env.API_SECRET_KEY!;
  const userId = "test-user-123";

  it("Should return 401 is invalid API key", async () => {
    const response = await request(expressApp)
      .post("/api/v1/sendMessage")
      .send({ text: "Hello!", userId });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Invalid API key");
  });

  it("Should return 400 if missing required param", async () => {
    const response = await request(expressApp)
      .post("/api/v1/sendMessage")
      .set("x-api-key", validApiKey)
      .send({ text: "" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Missing required parameters");
  });

  it("Should return 200 and a bot response when sending a valid message", async () => {
    const response = await request(expressApp)
      .post("/api/v1/sendMessage")
      .set("x-api-key", validApiKey)
      .send({ text: "Hello!", userId });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("botResponseId");
    expect(response.body).toHaveProperty("userMessageId");
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBeTruthy();
  });

  afterAll((done) => {
    server.close(() => {
      console.log("Server closed after tests.");
      done();
    });
  });
});
