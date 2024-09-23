import { Page } from "puppeteer-core";
import { Proxy } from "../interfaces/interfaces";
import { sleep } from "../services/utils.service";

export default class ProxyScript {
  constructor() {}

  /**
   * Registers a new proxy in the browser extension by filling out the proxy details in the extension's UI.
   *
   * @param proxy - The proxy object containing host and port information.
   * @param page - The Puppeteer 'Page' instance representing the browser page.
   */
  async registerProxy(proxy: Proxy, page: Page): Promise<void> {
    await this.closeFirstWindows(page);
    await page.waitForSelector("#optionsTable", { timeout: 5000 });
    await page.evaluate(() => {
      const checkbox = document.querySelector(
        "#useSameProxy"
      ) as HTMLInputElement;
      checkbox.click();
    });
    await page.evaluate(this.writeText, "#profileName", proxy.host);
    await page.evaluate(this.writeText, "#httpProxyHost", proxy.host);
    await page.evaluate(this.writeText, "#httpProxyPort", String(proxy.port));
    await sleep(1000);
    await page.locator("#saveOptions").click();
  }

  /**
   * Activates a proxy by selecting it from the list of saved proxies in the extension.
   *
   * @param proxy - The proxy object containing host information.
   * @param page - The Puppeteer 'Page' instance representing the browser page.
   */
  async activateProxy(proxy: Proxy, page: Page): Promise<void> {
    await page.waitForSelector("#menu");
    const proxiesButton = await page.$$("#proxies > div.item.proxy > span");
    for (const element of proxiesButton) {
      const value = await page.evaluate((el) => el.textContent, element);
      if (!(value === proxy.host)) continue;
      await element.click();
      return;
    }
  }

  /**
   * Helper function that simulates typing text into a form input by selecting
   * an element and triggering necessary input and change events.
   *
   * @param selector - The CSS selector for the input element.
   * @param text - The text to be typed into the input field.
   */
  private writeText(selector: any, text: string): void {
    const input = document.querySelector(selector);
    if (input) {
      input.value = text;
      input.dispatchEvent(new InputEvent("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  /**
   * Closes any initial windows that might block interaction with the proxy setup page.
   * This method waits for a "Cancel" button and clicks it if found, otherwise continues silently.
   *
   * @param page - The Puppeteer 'Page' instance representing the browser page.
   */
  private async closeFirstWindows(page: Page): Promise<void> {
    try {
      await page.waitForSelector("#btnCancel", { timeout: 2000 });
      await page.click("#btnCancel");
    } catch (error) {
      return;
    }
  }
}
