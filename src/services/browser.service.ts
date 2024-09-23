import puppeteer, { Browser, Page } from "puppeteer-core";
import { Config } from "../interfaces/interfaces";
import { sleep } from "./utils.service";
import { Logger } from "winston";

const minimal_args = [
  "--autoplay-policy=user-gesture-required",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-breakpad",
  "--disable-client-side-phishing-detection",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-domain-reliability",
  "--disable-extensions",
  "--disable-features=AudioServiceOutOfProcess",
  "--disable-hang-monitor",
  "--disable-ipc-flooding-protection",
  "--disable-notifications",
  "--disable-offer-store-unmasked-wallet-cards",
  "--disable-popup-blocking",
  "--disable-print-preview",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--disable-speech-api",
  "--disable-sync",
  "--hide-scrollbars",
  "--ignore-gpu-blacklist",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-default-browser-check",
  "--no-first-run",
  "--no-pings",
  "--no-sandbox",
  "--no-zygote",
  "--password-store=basic",
  "--use-gl=swiftshader",
  "--use-mock-keychain",
  "--disable-gpu",
  "--disable-canvas-aa",
  "--disable-2d-canvas-clip-aa",
  "--disable-gl-drawing-for-tests",
  "--disable-default-apps",
  "--disable-sync",
  "--safebrowsing-disable-auto-update",
  "--disable-accelerated-2d-canvas",
];

/**
 * The `BrowserService` class manages browser operations such as launching a new browser instance
 * with specific configurations and clearing browser data.
 */
export class BrowserService {
  private config: Config;
  private logger: Logger;

  /**
   * Constructs a new `BrowserService` instance.
   *
   * @param config - Configuration object containing browser path, timeout, and extension details.
   * @param logger - Logger instance for logging actions related to browser operations.
   */
  constructor(config: Config, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Launches a new browser instance using Puppeteer with predefined arguments, including
   * loading specific extensions and setting a mobile viewport.
   *
   * @returns A promise that resolves with a `Browser` instance.
   */
  async launchBrowser(): Promise<Browser> {
    const browser: Browser = await puppeteer.launch({
      executablePath: this.config.browserPath,
      protocolTimeout: this.config.timeOutResponse,
      headless: false,
      defaultViewport: { width: 400, height: 650, isMobile: true },
      args: [
        ...minimal_args,
        `--window-size=400,650`,
        `--disable-extensions-except=${this.config.extensionPath}`,
        `--load-extension=${this.config.extensionPath}`,
      ],
      ignoreDefaultArgs: ["--enable-automation"],
    });

    // await page.setUserAgent(
    //   "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36"
    // );

    // // Cambiar las propiedades del navegador en la página
    // await page.evaluateOnNewDocument(() => {
    //   Object.defineProperty(navigator, "webdriver", {
    //     get: () => false,
    //   });
    //   // Evitar detección de plugins
    //   Object.defineProperty(navigator, "plugins", {
    //     get: () => [1, 2, 3, 4, 5],
    //   });
    //   // Cambiar propiedades de navigator
    //   Object.defineProperty(navigator, "languages", {
    //     get: () => ["en-US", "en"],
    //   });
    // });

    return browser;
  }

  /**
   * Clears browser data (e.g., cookies, cache) by navigating to the browser's settings page.
   * This method simulates keyboard navigation to interact with the Chrome settings page and
   * clear browsing data.
   *
   * @param page - The Puppeteer `Page` instance representing the browser page where data will be cleared.
   */
  async clearDataBrowser(page: Page): Promise<void> {
    this.logger.info("Cleaning data");
    await page.goto("chrome://settings/clearBrowserData");

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      await sleep(300);
    }

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("ArrowDown");
      await sleep(100);
    }

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      await sleep(300);
    }

    await page.keyboard.press("Enter");
    this.logger.info("Data cleaned");
  }
}
