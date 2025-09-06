import { Page } from "puppeteer-core";
import { Account, Config } from "../interfaces/interfaces";

export default class LoginScript {
  private page: Page;
  private config: Config;

  /**
   * Constructor for initializing the LoginScript class with a Puppeteer page instance and configuration.
   *
   * @param page - The Puppeteer 'Page' instance representing the browser page.
   * @param config - The configuration object that includes selectors and other settings for interaction.
   */
  constructor(page: Page, config: Config) {
    this.page = page;
    this.config = config;
  }

  /**
   * Performs the login process by navigating to the login page, filling in the credentials, and submitting the form.
   *
   * @param account - The account object containing the email and password for login.
   * @returns Promise<void> - Resolves once the login process is complete.
   */
  async login(account: Account): Promise<void> {
    await this.page.waitForSelector(this.config.selectors.emailInput);
    await this.page.type(this.config.selectors.emailInput, account.email);
    await this.page.type(this.config.selectors.passwordInput, account.password);
    await this.page.click(this.config.selectors.loginButton);
  }

  /**
   * Validates if the login was successful by checking for the presence of the page title element after login.
   *
   * @returns Promise<boolean> - Returns true if login is successful, otherwise false.
   */
  async validateLogin(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.config.selectors.pageTitle);
      return true;
    } catch (err) {
      return false;
    }
  }
}
