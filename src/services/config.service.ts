import { readFileSync, writeFileSync } from "fs";
import { Config } from "../interfaces/interfaces";
import Joi from "joi";

/**
 * Default configuration values used if the configuration is not found
 * or is invalid in the file.
 */
const defaultConfig: Config = {
  requestDelay: 3000,
  extensionPath: "",
  extensionUrl: "",
  browserPath: "",
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
  requestDelay: Joi.number().integer().min(0).required(),
  extensionPath: Joi.string().required(),
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
 */
export class ConfigService {
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
