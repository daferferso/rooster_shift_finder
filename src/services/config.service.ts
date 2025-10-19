import { readFileSync, writeFileSync } from "fs";
import { Config } from "../interfaces/interfaces";
import Joi from "joi";

/**
 * Default configuration values used if the configuration is not found
 * or is invalid in the file.
 */
const defaultConfig: Config = {
  login_url: "https://bo.usehurrier.com/app/compliance/web/login",
  app_url: "https://bo.usehurrier.com/app/rooster/web/shifts",
  debugFile: false,
  requestDelay: 3000,
  iterationLimit: 12600000,
  extensionPath: "modify_this_part\\utils\\extension",
  extensionDelay: 30000,
  extensionUrl: "chrome-extension://cpmhjliddapgdeodmklfbibnchacikpl",
  browserPath: "modify_this_part\\Application\\chrome.exe",
  timeOutElements: 20000,
  timeOutResponse: 20000,
  selectors: {
    emailInput: "",
    passwordInput: "",
    loginButton: "",
    pageTitle: "",
  },
};

/**
 * Validation schema for the configuration using Joi.
 * Ensures that configuration values are of the correct type and meet specified requirements.
 */
const configSchema = Joi.object({
  login_url: Joi.string().uri().required(),
  app_url: Joi.string().uri().required(),
  debugFile: Joi.boolean().required(),
  requestDelay: Joi.number().integer().min(0).required(),
  iterationLimit: Joi.number().integer().min(0).required(),
  extensionPath: Joi.string().required(),
  extensionDelay: Joi.number().integer().min(0).required(),
  extensionUrl: Joi.string().required(),
  browserPath: Joi.string().required(),
  timeOutElements: Joi.number().integer().min(0).required(),
  timeOutResponse: Joi.number().integer().min(0).required(),
  selectors: Joi.object({
    emailInput: Joi.string().required(),
    passwordInput: Joi.string().required(),
    loginButton: Joi.string().required(),
    pageTitle: Joi.string().required(),
  }).required(),
});

/**
 * Service class for loading and validating configuration settings.
 *
 * This class reads configuration settings from a JSON file upon instantiation
 * and stores them in a public `config` attribute, making them easily accessible
 * throughout the application. If the configuration file is missing or invalid,
 * a default configuration is saved and loaded.
 */
export class ConfigService {
  public config: Config;

  /**
   * Initializes the ConfigService instance by loading the configuration settings.
   *
   * If the configuration file is missing or invalid, a default configuration
   * is generated and stored.
   */
  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Loads the configuration from a JSON file.
   * If the configuration file is not found or is invalid, the default configuration is saved and returned.
   *
   * @returns {Config} The loaded or default configuration.
   */
  loadConfig(): Config {
    try {
      const config: Config = JSON.parse(
        readFileSync("utils/config.json", { encoding: "utf-8" })
      );
      this.validateConfig(config);
      return config;
    } catch (err) {
      writeFileSync(
        "utils/config.json",
        JSON.stringify(defaultConfig, null, 2)
      );
      return defaultConfig;
    }
  }

  /**
   * Validates the provided configuration against the defined schema.
   * Throws an error if the configuration is invalid.
   *
   * @param {Config} config - The configuration object to validate.
   * @throws {Error} If the configuration is invalid.
   */
  private validateConfig(config: Config): void {
    const { error } = configSchema.validate(config);
    if (error) {
      throw new Error(`Invalid config.json: ${error.message}`);
    }
  }
}
