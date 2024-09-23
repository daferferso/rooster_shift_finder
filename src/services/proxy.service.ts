import { Browser, Page } from "puppeteer-core";
import { Proxy } from "../interfaces/interfaces";
import ProxyScript from "../scripts/proxy.script";
import { Logger } from "winston";
import { Config } from "../interfaces/interfaces";
import { sleep } from "./utils.service";

/**
 * Service class for managing proxy connections in a Puppeteer browser instance.
 */
export class ProxyService {
  public actualProxy!: Proxy;
  private proxies: string[];
  private browser: Browser;
  private config: Config;
  private logger: Logger;
  private proxyScript: ProxyScript;

  /**
   * Constructs a ProxyService instance.
   *
   * @param {string[]} proxies - Array of proxy strings.
   * @param {Browser} browser - The Puppeteer Browser instance.
   * @param {Config} config - Configuration settings.
   * @param {Logger} logger - Logger instance for logging information.
   */
  constructor(
    proxies: string[],
    browser: Browser,
    config: Config,
    logger: Logger
  ) {
    this.proxies = proxies;
    this.browser = browser;
    this.config = config;
    this.logger = logger;
    this.proxyScript = new ProxyScript();
  }

  /**
   * Handles the proxy connection by registering and activating the proxy.
   *
   * @returns {Promise<void>}
   */
  async handleProxyConnection(): Promise<void> {
    this.logger.info("Handling proxy connection");

    this.actualProxy = this.getNextProxy();
    const page: Page = await this.browser.newPage();

    try {
      await page.goto(`${this.config.extensionUrl}/options.html`);
      await this.proxyScript.registerProxy(this.actualProxy, page);

      await page.goto(`${this.config.extensionUrl}/popup.html`);
      await this.proxyScript.activateProxy(this.actualProxy, page);
    } catch (error) {
      this.logger.error(error);
      this.logger.info(
        "You have 60 seconds to get extension URL and save in config.json"
      );
      await sleep(60000);
      throw error;
    }

    try {
      await page.close();
    } catch (error) {}
  }

  /**
   * Retrieves the next proxy from the list and rotates it.
   *
   * @returns {Proxy} The next proxy object.
   */
  private getNextProxy(): Proxy {
    const nextProxyString = this.proxies.shift()!;
    this.proxies.push(nextProxyString);
    const nextProxy = this.parseProxyString(nextProxyString);
    return nextProxy;
  }

  /**
   * Parses a proxy string into a Proxy object.
   *
   * @param {string} proxyString - The proxy string in "host:port" format.
   * @returns {Proxy} The parsed Proxy object.
   */
  private parseProxyString(proxyString: string): Proxy {
    const [host, port] = proxyString.split(":");
    return {
      host,
      port: parseInt(port),
    };
  }
}
