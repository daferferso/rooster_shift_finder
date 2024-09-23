/**
 * A base class for custom errors, extending the native `Error` class.
 * This class sets the correct prototype chain to ensure that instanceof checks work correctly.
 */
export class CustomError extends Error {
  /**
   * Constructs a new `CustomError` instance with an optional error message.
   *
   * @param message - The error message to display (default: undefined).
   */
  constructor(message?: string) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

/**
 * Error thrown when an account is not logged in (i.e., a token is missing).
 */
export class AccountNotLoggedError extends CustomError {
  /**
   * Constructs a new `AccountNotLoggedError` with a default or custom message.
   *
   * @param message - The error message to display (default: "The token was not found").
   */
  constructor(message: string = "The token was not found") {
    super(message);
    this.name = "AccountNotLoggedError";
  }
}

/**
 * Error thrown when a proxy is detected as banned during an operation.
 */
export class ProxyBannedError extends CustomError {
  /**
   * Constructs a new `ProxyBannedError` with a default or custom message.
   *
   * @param message - The error message to display (default: "The proxy was banned").
   */
  constructor(message: string = "The proxy was banned") {
    super(message);
    this.name = "ProxyBannedError";
  }
}
