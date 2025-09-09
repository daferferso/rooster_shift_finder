import winston, { Logger } from "winston";
import { ConfigService } from "./services/config.service";
import { DataService } from "./services/data.service";
import { BrowserService } from "./services/browser.service";
import { AuthService } from "./services/auth.service";
import { LoopService } from "./services/loop.service";
import { ProxyService } from "./services/proxy.service";
import { HTTPRequest } from "puppeteer-core";
import { sleep } from "./services/utils.service";
import {
  ConsoleTransportInstance,
  FileTransportInstance,
} from "winston/lib/winston/transports";
import moment from "moment";


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
      this.configService.config,
      this.logger
    );
  }

  /**
   * Starts the application by loading configuration, launching the browser,
   * and handling the main execution loop for interacting with web shifts.
   */
  async start(): Promise<void> {


    const account = this.dataService.loadData();

    const browser = await this.browserService.launchBrowser();

    const [page] = await browser.pages();

    await sleep(60000) // Sleep to config proxy manual

    const authService = new AuthService(
      page,
      this.configService.config,
      this.logger
    );

    if (account.useProxy && account.proxies.length <= 0) {
      this.logger.error("There is not proxies, you need to add proxies");
      await browser.close();
      return;
    }

    const proxyService = new ProxyService(
      [...account.proxies],
      browser,
      this.configService.config,
      this.logger
    );

    const loopService = new LoopService(
      page,
      account,
      this.configService.config,
      this.logger
    );

    loopService.iterationLimit = Math.floor(
      7200000 / this.configService.config.requestDelay
    );

    let logged = false;

    while (true) {
      try {
        await page.goto(this.configService.config.login_url);
        if (!logged) {
          if (account.useProxy) await proxyService.handleProxyConnection();
          await authService.handleLogin(account);
          await page.goto(this.configService.config.app_url);
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
            await page.goto(this.configService.config.app_url);
            continue;
          case "AccountNotLoggedError":
            this.logger.error("Logout error");
            await page.goto(this.configService.config.login_url);
            await sleep(60000) // Add sleep to avoid Credential error
            await authService.handleLogin(account);
            await page.goto(this.configService.config.app_url);
            logged = true;
            loopService.iterationCount = 0;
            await page.goto(this.configService.config.app_url);
            continue;
          default:
            this.logger.error(`Other type of error: ${error}`);
            await page.goto(this.configService.config.login_url);
            await authService.handleLogin(account);
            await page.goto(this.configService.config.app_url);
            logged = true;
            loopService.iterationCount = 0;
            continue;
        }
      }
    }
  }

  /**
   * Creates a logger using winston with specified configurations.
   * @returns {Logger} - The configured logger instance.
   */
  private createLogger(): Logger {
    const timezone = "America/La_Paz";

    const timestampWithTZ = winston.format((info) => {
      info.timestamp = moment().tz(timezone).format("YYYY-MM-DD HH:mm:ss.SSS");
      return info;
    });

    const consoleTransport = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        timestampWithTZ(),
        winston.format.printf(
          (info) => `${info.timestamp} - ${info.level}: ${info.message}`
        )
      ),
    });

    const loggerTransports: (
      | ConsoleTransportInstance
      | FileTransportInstance
    )[] = [consoleTransport];

    if (this.configService.config.debugFile) {
      const fileTransport = new winston.transports.File({
        filename: "./utils/app.log",
        format: winston.format.combine(
          timestampWithTZ(),
          winston.format.printf(
            (info) => `${info.timestamp} - ${info.level}: ${info.message}`
          )
        ),
      });
      loggerTransports.push(fileTransport);
    }

    const logger = winston.createLogger({
      level: "debug",
      transports: loggerTransports,
    });
    return logger;
  }
}

const app = new App();
app.start();
