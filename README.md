# Rooster Shift Finder

This project automates the scheduling of shifts on the website [https://bo.usehurrier.com/app/rooster/web/login](https://bo.usehurrier.com/app/rooster/web/login) using Puppeteer. It supports proxy management and error recovery mechanisms.

## Requirements

- **Node.js**: v20.14.0 or higher
- **TypeScript**: Version 5.4.5

## Installation

1. Install all dependencies:

   ```sh
   npm install
   ```

## Configuration File (config.json)

You must configure the config.json file before running the program. Below is an explanation of each field:

- **requestDelay:** Delay (in milliseconds) between requests for shifts.
- **extensionPath:** Path to the ProxySharp extension.
- **extensionUrl:** URL of the extension. It can change when the browser is reopened, so you may need to update it each time.
- **browserPath:** Path to the browser executable (Chrome, Brave, Edge, or any Chromium-based browser).
- **timeOutElements:** Maximum wait time (in milliseconds) for each element on the page before throwing an error.
- **timeOutResponse:** Maximum wait time (in milliseconds) for a page response before throwing an error.
- **selectors:** CSS selectors to identify page components such as the email input, password input, login button, and page title.

Example config.json:

```json
{
  "requestDelay": 2500,
  "extensionPath": "modify_this_part\\utils\\extension",
  "extensionUrl": "chrome-extension://cpmhjliddapgdeodmklfbibnchacikpl",
  "browserPath": "modify_this_part\\Application\\brave.exe",
  "timeOutElements": 20000,
  "timeOutResponse": 20000,
  "selectors": {
    "emailInput": "#app > div.Login__StyledContainer-EIyCN.hOPUnB > form > div > div:nth-child(1) > input",
    "passwordInput": "#app > div.Login__StyledContainer-EIyCN.hOPUnB > form > div > div:nth-child(2) > input",
    "loginButton": "#app > div.Login__StyledContainer-EIyCN.hOPUnB > form > button",
    "pageTitle": "#app > div.Y_H7dxviaGWF8ClZOdze > div > header > div > div.No9IbYC1L1JdgIlAPE0R"
  }
}
```

## Data File (data.json)

The data.json file needs to be properly configured with the account that will be used to log in and search for shifts. Here's a breakdown:

- **id:** The correct account ID.
- **email and password:** Account credentials for logging into the website.
- **country:** The country code, city ID, and timezone for the account.
- **useProxy:** Set to false to use the local IP, or true to use proxies from the provided list.
- **proxies:** A list of proxies to be used if useProxy is true.
- **schedule:** The date range (start and end) for finding shifts.
- **conditions:** Filters for shifts. Shifts are evaluated based on these conditions, including date and time range, minimum duration, and location - (place IDs).
- **shifts[]:** Array to store all found and taken shifts.
  Example data.json:

```json
{
  "account": {
    "id": 12345,
    "email": "email@email.com",
    "password": "12345",
    "country": {
      "code": "bo",
      "cityId": 1,
      "tz": "América/La_Paz"
    },
    "useProxy": false,
    "proxies": ["host:port"],
    "schedule": {
      "start": "2024-09-23",
      "end": "2024-09-23"
    },
    "conditions": [
      {
        "startDate": "2024-09-23",
        "endDate": "2024-09-23",
        "startTime": "07:00:00",
        "endTime": "03:00:00",
        "minTime": {
          "hours": 1,
          "minutes": 0
        },
        "placesId": []
      }
    ],
    "shifts": []
  }
}
```

## Running the Program

To run the program in development mode:

```sh
npm run dev
```

To build the program into the bin/ folder:

```sh
npm run build
```

The final executable will be named `rooster_shift_finder.exe`. Note that the executable requires the utils folder to function. Inside the utils folder, the following items must be present:

- extension folder containing the proxy connection extension.
- config.json and data.json files properly configured as described above.
