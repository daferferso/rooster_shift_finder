import { Page } from "puppeteer-core";
import { Account, Config } from "../interfaces/interfaces";
import LoginScript from "../scripts/login.script";
import { AccountNotLoggedError } from "../errors/errors";
import { Logger } from "winston";

/**
 * The `AuthService` class is responsible for handling user authentication
 * in the Puppeteer-driven automation process. It manages login operations
 * and checks whether the user is logged in by interacting with the web page.
 */
export class AuthService {
  private page: Page;
  private config: Config;
  private logger: Logger;
  private loginScript: LoginScript;

  /**
   * Constructs a new `AuthService` instance.
   *
   * @param page - The Puppeteer `Page` instance representing the browser page.
   * @param config - The configuration object that includes various settings like timeouts and selectors.
   * @param logger - A Winston logger instance for logging important messages or errors.
   */
  constructor(page: Page, config: Config, logger: Logger) {
    this.page = page;
    this.config = config;
    this.logger = logger;
    this.loginScript = new LoginScript(page, this.config);
  }

  /**
   * Logs in the user using the provided `Account` information.
   * This method handles the login process and validates the login state.
   * If the login fails, an error is thrown and logged.
   *
   * @param account - The user account details (email, password, etc.).
   * @throws Will throw an error if login fails.
   */
  async handleLogin(account: Account): Promise<void> {
    await this.loginScript.login(account);
    const logged = await this.loginScript.validateLogin();
    if (!logged) {
      this.logger.error(`Credentials error - ${account.email}`);
      throw new Error(`Login failed for ${account.email}`);
    }
    this.logger.info(`Login successful - ${account.email}`);
    await this.page.reload();
  }

  /**
   * Checks if the user is already logged in by verifying if the authentication token is present in `localStorage`.
   *
   * @throws `AccountNotLoggedError` if the token is not found, indicating that the user is not logged in.
   */
  async checkIfLogged(): Promise<void> {
    const token: string | null = await this.page.evaluate(() => {
      return localStorage.getItem("token");
    });
    if (!token) {
      throw new AccountNotLoggedError();
    }
  }

  async deleteLocalStorageToLogout(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
    });
  }
}
