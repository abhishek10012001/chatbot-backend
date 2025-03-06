/**
 * Integration tests for the Chatbot API endpoints using Jest and Supertest.
 * 
 * This test suite covers:
 * - `sendMessage` API
 * - `editMessage` API
 * - `deleteMessage` API
 * 
 * The tests ensure proper validation of API key, required parameters, and expected responses.
 */

import request from "supertest";
import { expressApp, server } from "../server";
import { StatusCode } from "../enums/auth_status_code";

describe("Chatbot API - sendMessage", () => {
  const validApiKey = process.env.API_SECRET_KEY!;
  const userId = "test-user-123";
  const messageId: string = "1741269454219";

  /**
   * Test cases for sendMessage API
   */

  /**
   * Test: Should return 401 if API key is missing or invalid.
   */
  it("SEND MESSAGE API - Should return 401 is invalid API key", async () => {
    const response = await request(expressApp)
      .post("/api/v1/sendMessage")
      .send({ text: "Hello!", userId });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("code", StatusCode.INVALID_API_KEY);
  });

  /**
   * Test: Should return 400 if required parameters are missing.
   */
  it("SEND MESSAGE API - Should return 400 if missing required param", async () => {
    const response = await request(expressApp)
      .post("/api/v1/sendMessage")
      .set("x-api-key", validApiKey)
      .send({ text: "" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("code", StatusCode.MISSING_REQUIRED_PARAMETERS);
  });

  /**
   * Test: Should return 200 and a bot response when sending a valid message.
   */
  it("SEND MESSAGE API - Should return 200 and a bot response when sending a valid message", async () => {
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
   * Test cases for editMessage API
   */

  /**
   * Test: Should return 401 if API key is missing or invalid.
   */
  it("EDIT MESSAGE API - Should return 401 is invalid API key", async () => {
    const response = await request(expressApp)
      .post("/api/v1/editMessage")
      .send({ newText: "Hello!", userId: userId, messageId: messageId });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("code", StatusCode.INVALID_API_KEY);
  });

  /**
   * Test: Should return 400 if required parameters are missing.
   */
  it("EDIT MESSAGE API - Should return 400 if missing required param", async () => {
    const response = await request(expressApp)
      .post("/api/v1/editMessage")
      .set("x-api-key", validApiKey)
      .send({ newText: "" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("code", StatusCode.MISSING_REQUIRED_PARAMETERS);
  });

  /**
   * Test: Should return 404 if invalid user ID is passed.
   */
  it("EDIT MESSAGE API - Should return 404 if invalid user id is passed", async () => {
    const response = await request(expressApp)
      .post("/api/v1/editMessage")
      .set("x-api-key", validApiKey)
      .send({ newText: "a",userId: "b", messageId: "c" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("code", StatusCode.USER_NOT_FOUND);
  });

  /**
   * Test: Should return 403 if invalid message ID is passed.
   */
  it("EDIT MESSAGE API - Should return 403 if invalid message id is passed", async () => {
    const response = await request(expressApp)
      .post("/api/v1/editMessage")
      .set("x-api-key", validApiKey)
      .send({ newText: "a",userId: userId, messageId: "c" });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("code", StatusCode.MESSAGE_NOT_FOUND);
  });

  /**
   * Test: Should return 200 and a bot response when editing a valid message.
   */
  it("EDIT MESSAGE API - Should return 200 and a bot response when sending a valid message", async () => {
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

  /**
   * Test cases for deleteMessage API
   */

  /**
   * Test: Should return 401 if API key is missing or invalid.
   */
  it("DELETE MESSAGE API - Should return 401 is invalid API key", async () => {
    const response = await request(expressApp)
      .delete("/api/v1/deleteMessage")
      .send({ userId: userId, messageId: messageId });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("code", StatusCode.INVALID_API_KEY);
  });

  /**
   * Test: Should return 400 if required parameters are missing.
   */
  it("DELETE MESSAGE API - Should return 400 if missing required param", async () => {
    const response = await request(expressApp)
      .delete("/api/v1/deleteMessage")
      .set("x-api-key", validApiKey)
      .send({ userId: "" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("code", StatusCode.MISSING_REQUIRED_PARAMETERS);
  });

  /**
   * Test: Should return 404 if invalid user ID is passed.
   */
  it("DELETE MESSAGE API - Should return 404 if invalid user id is passed", async () => {
    const response = await request(expressApp)
      .delete("/api/v1/deleteMessage")
      .set("x-api-key", validApiKey)
      .send({ userId: "b", messageId: "c" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("code", StatusCode.USER_NOT_FOUND);
  });

  /**
   * Test: Should return 403 if invalid message ID is passed.
   */
  it("DELETE MESSAGE API - Should return 403 if invalid message id is passed", async () => {
    const response = await request(expressApp)
      .delete("/api/v1/deleteMessage")
      .set("x-api-key", validApiKey)
      .send({ userId: userId, messageId: "c" });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("code", StatusCode.MESSAGE_NOT_FOUND);
  });

  /**
   * Closes the server after tests are completed to avoid open handles.
   */
  afterAll((done) => {
    server.close(() => {
      console.log("Server closed after tests.");
      done();
    });
  });
});
