/**
 * Enum representing status codes for the Chatbot API responses.
 * These status codes are used to indicate the success or failure of API operations.
 */
export enum StatusCode {
    /** Indicates that the request was successfully processed */
    SUCCESS="SUCCESS",

    /** Indicates that the API request was made with an invalid or missing API key */
    INVALID_API_KEY="INVALID_API_KEY",

    /** Indicates that required parameters were missing from the API request */
    MISSING_REQUIRED_PARAMETERS="MISSING_REQUIRED_PARAMETERS",

    /** Indicates that the specified user was not found in the database */
    USER_NOT_FOUND="USER_NOT_FOUND",

    /** Indicates that the specified message was not found for the user */
    MESSAGE_NOT_FOUND="MESSAGE_NOT_FOUND",

    /** Indicates that the request was invalid or not allowed */
    BAD_REQUEST="BAD_REQUEST",

    /** Indicates that an unexpected internal server error occurred */
    INTERNAL_SERVER_ERROR="INTERNAL_SERVER_ERROR"
  }
  