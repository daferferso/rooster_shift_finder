import winston, { Logger } from "winston";
import { ConfigService } from "./services/config.service";
import { DataService } from "./services/data.service";
import { BrowserService } from "./services/browser.service";
import { AuthService } from "./services/auth.service";
import { LoopService } from "./services/loop.service";
import { ProxyService } from "./services/proxy.service";
import { HTTPRequest } from "puppeteer-core";
import { sleep } from "./services/utils.service";

const URL = "https://bo.usehurrier.com/app/rooster/web/shifts";

/**
 * Main application class that initializes services and handles the main execution loop.
 */
class App {
  private configService: ConfigService;
  private dataService: DataService;
  private browserService: BrowserService;
  private logger: Logger;

  /**
   * Constructor for the App class. Initializes services and logger.
   */
  constructor() {
    this.configService = new ConfigService();
    this.logger = this.createLogger();
    this.dataService = new DataService();
    this.browserService = new BrowserService(
      this.configService.loadConfig(),
      this.logger
    );
  }

  /**
   * Starts the application by loading configuration, launching the browser,
   * and handling the main execution loop for interacting with web shifts.
   */
  async start(): Promise<void> {
    const config = this.configService.loadConfig();

    const account = this.dataService.loadData();

    const browser = await this.browserService.launchBrowser();

    const [page] = await browser.pages();

    const authService = new AuthService(page, config, this.logger);

    if (account.useProxy && account.proxies.length <= 0) {
      this.logger.error("There is not proxies, you need to add proxies");
      await browser.close();
      return;
    }

    const proxyService = new ProxyService(
      [...account.proxies],
      browser,
      config,
      this.logger
    );

    const loopService = new LoopService(page, account, config, this.logger);

    let logged = false;

    while (true) {
      try {
        await page.goto(URL);
        if (!logged) {
          if (account.useProxy) await proxyService.handleProxyConnection();
          await authService.handleLogin(account);
          logged = true;
        }

        page.removeAllListeners("request");
        page.setRequestInterception(true);

        page.on("request", async (req: HTTPRequest) => {
          if (req.isInterceptResolutionHandled()) return;
          try {
            if (req.url().includes("available_unassigned_shifts")) {
              loopService.baseRequests["availableUnassignedShifts"] = {
                url: req.url(),
                headers: req.headers(),
              };
            }
            if (req.url().includes("available_swaps")) {
              loopService.baseRequests["availableSwaps"] = {
                url: req.url(),
                headers: req.headers(),
              };
            }
            req.continue();
          } catch (error) {
            this.logger.error(`Error processing request: ${error}`);
            req.continue();
            throw error;
          }
        });

        await sleep(2000);

        await authService.checkIfLogged();

        await loopService.startLoop();
      } catch (error: any) {
        this.logger.error(`An error occurred in the main loop: ${error.name}`);
        switch (error.name) {
          case "ProxyBannedError":
          case "ProtocolError":
          case "TimeoutError":
            this.logger.error("Proxy or protocol error");
            if (account.useProxy) await proxyService.handleProxyConnection();
            await page.goto(URL);
            break;
          case "AccountNotLoggedError":
            this.logger.error("Logout error");
            await this.browserService.clearDataBrowser(page);
            await authService.handleLogin(account);
            logged = true;
            break;
          default:
            this.logger.error(`Other type of error: ${error}`);
            await page.goto(URL);
            break;
        }
      }
    }
  }

  /**
   * Creates a logger using winston with specified configurations.
   * @returns {Logger} - The configured logger instance.
   */
  private createLogger(): Logger {
    let loggerTransports = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.timestamp(),
          winston.format.printf(
            (info) => `${info.timestamp} - ${info.level}: ${info.message}`
          )
        ),
      }),
      new winston.transports.File({
        filename: "./utils/app.log",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(
            (info) => `${info.timestamp} - ${info.level}: ${info.message}`
          )
        ),
      }),
    ];

    const logger = winston.createLogger({
      level: "debug",
      transports: loggerTransports,
    });
    return logger;
  }
}

const app = new App();
app.start();
