import { readFileSync, writeFileSync } from "fs";
import { Account, Data } from "../interfaces/interfaces";
import Joi from "joi";

/**
 * Default account object used if the account data is not found
 * or is invalid in the file.
 */
const defaultAccount: Account = {
  id: 1,
  email: "",
  password: "",
  country: {
    code: "",
    cityId: 1,
    tz: "",
  },
  useProxy: false,
  proxies: [""],
  schedule: {
    start: new Date().toISOString().substring(0, 10),
    end: new Date().toISOString().substring(0, 10),
  },
  conditions: [
    {
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date().toISOString().substring(0, 10),
      startTime: "07:00:00",
      endTime: "03:00:00",
      minTime: {
        hours: 1,
        minutes: 0,
      },
      placesId: [],
    },
  ],
  shifts: [],
};

/**
 * Validation schema for the account data using Joi.
 * Ensures that the account data meets specified requirements.
 */
const dataSchema = Joi.object({
  account: Joi.object({
    id: Joi.number().integer().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    country: Joi.object({
      code: Joi.string().required(),
      cityId: Joi.number().integer().required(),
      tz: Joi.string().required(),
    }).required(),
    useProxy: Joi.boolean().required(),
    proxies: Joi.array().items(Joi.string()).required(),
    schedule: Joi.object({
      start: Joi.string().isoDate().required(),
      end: Joi.string().isoDate().required(),
    }).required(),
    conditions: Joi.array()
      .items(
        Joi.object({
          startDate: Joi.string().isoDate().required(),
          endDate: Joi.string().isoDate().required(),
          startTime: Joi.string()
            .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
            .required(),
          endTime: Joi.string()
            .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
            .required(),
          minTime: Joi.object({
            hours: Joi.number().integer().min(0).required(),
            minutes: Joi.number().integer().min(0).required(),
          }).required(),
          placesId: Joi.array().items(Joi.number().integer()).required(),
        })
      )
      .required(),
    shifts: Joi.array().optional(),
  }).required(),
});

/**
 * Service class for loading and saving account data.
 */
export class DataService {
  /**
   * Loads account data from a JSON file.
   * If the file is not found or the data is invalid,
   * the default account is saved and returned.
   *
   * @returns {Account} The loaded or default account.
   */
  loadData(): Account {
    try {
      const data: Data = JSON.parse(
        readFileSync("utils/data.json", { encoding: "utf-8" })
      );
      this.validateData(data);
      return data.account;
    } catch (err) {
      writeFileSync(
        "utils/data.json",
        JSON.stringify({ account: defaultAccount }, null, 2)
      );
      return defaultAccount;
    }
  }

  /**
   * Saves the provided account data to a JSON file.
   *
   * @param {Data} data - The data object to save.
   */
  saveData(data: Data): void {
    writeFileSync("utils/data.json", JSON.stringify(data, null, 2));
  }

  /**
   * Validates the provided account data against the defined schema.
   * Throws an error if the data is invalid.
   *
   * @param {Data} data - The data object to validate.
   * @throws {Error} If the data is invalid.
   */
  private validateData(data: Data): void {
    const { error } = dataSchema.validate(data);
    if (error) {
      throw new Error(`Invalid data.json: ${error.message}`);
    }
  }
}
