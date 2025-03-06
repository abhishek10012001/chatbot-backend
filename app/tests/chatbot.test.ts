import request from "supertest";
import { expressApp, server } from "../server";
import { StatusCode } from "../enums/auth_status_code";

describe("Chatbot API - sendMessage", () => {
  const validApiKey = process.env.API_SECRET_KEY!;
  const userId = "test-user-123";
  const messageId: string = "1741269454219";

  /**
   * The below test cases belong to sendMessage API
   */

  // When Invalid API key is used to call the API
  it("Should return 401 is invalid API key", async () => {
    const response = await request(expressApp)
      .post("/api/v1/sendMessage")
      .send({ text: "Hello!", userId });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("code", StatusCode.INVALID_API_KEY);
  });

  // When all required parameters are not passed
  it("Should return 400 if missing required param", async () => {
    const response = await request(expressApp)
      .post("/api/v1/sendMessage")
      .set("x-api-key", validApiKey)
      .send({ text: "" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("code", StatusCode.MISSING_REQUIRED_PARAMETERS);
  });

  // When all conditions are met to call the API
  it("Should return 200 and a bot response when sending a valid message", async () => {
    const response = await request(expressApp)
      .post("/api/v1/sendMessage")
      .set("x-api-key", validApiKey)
      .send({ text: "Hello!", userId });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("code", StatusCode.SUCCESS);
    expect(response.body).toHaveProperty("botResponseId");
    expect(response.body).toHaveProperty("userMessageId");
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBeTruthy();
  });

  /**
   * The below test cases belong to editMessage API
   */

  // When Invalid API key is used to call the API
  it("Should return 401 is invalid API key", async () => {
    const response = await request(expressApp)
      .post("/api/v1/editMessage")
      .send({ newText: "Hello!", userId: userId, messageId: messageId });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("code", StatusCode.INVALID_API_KEY);
  });

  // When all required parameters are not passed
  it("Should return 400 if missing required param", async () => {
    const response = await request(expressApp)
      .post("/api/v1/editMessage")
      .set("x-api-key", validApiKey)
      .send({ newText: "" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("code", StatusCode.MISSING_REQUIRED_PARAMETERS);
  });

  // When invalid user id is passed
  it("Should return 404 if invalid user id is passed", async () => {
    const response = await request(expressApp)
      .post("/api/v1/editMessage")
      .set("x-api-key", validApiKey)
      .send({ newText: "a",userId: "b", messageId: "c" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("code", StatusCode.USER_NOT_FOUND);
  });

  // When invalid message id is passed
  it("Should return 403 if invalid message id is passed", async () => {
    const response = await request(expressApp)
      .post("/api/v1/editMessage")
      .set("x-api-key", validApiKey)
      .send({ newText: "a",userId: userId, messageId: "c" });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("code", StatusCode.MESSAGE_NOT_FOUND);
  });

  // When all conditions are met to call the API
  it("Should return 200 and a bot response when sending a valid message", async () => {
    const response = await request(expressApp)
      .post("/api/v1/editMessage")
      .set("x-api-key", validApiKey)
      .send({ newText: "Hello!", userId: userId, messageId: messageId });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("code", StatusCode.SUCCESS);
    expect(response.body).toHaveProperty("botResponseId");
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
