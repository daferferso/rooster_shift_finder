# Shift Automation Project

This project uses Puppeteer and Prisma to automate the scheduling of shifts on the website [https://bo.usehurrier.com/app/rooster/web/login](https://bo.usehurrier.com/app/rooster/web/login). It handles proxies, error recovery, and database storage.

## Requirements

- Node.js: v20.14.0 or higher
- TypeScript: Version 5.4.5

## Installation

1. Install all dependencies:

   ```sh
   npm install
   ```

2. Generate the database:
   ```sh
   npx prisma migrate dev --name init
   ```

## Database Setup

You need to add the following data to the database:

- 1 user
- 1 country
- 1 city
- As many zones as necessary
- At least 1 proxy for account connection

## Configuration File (config.json)

Create a `config.json` file in the `utils` folder with the following structure. This file is necessary to configure some program parameters and selectors that can be updated in case the web application changes. In the "headers" section, you will need to fill in the `cookie`, `baggage`, and `sentry-trace` values by intercepting a request made on the page https://bo.usehurrier.com/app/rooster/web/login:

```json
{
  "log": true,
  "requestDelay": 2100,
  "startDay": "2024-08-06",
  "endDay": "2024-08-06",
  "extensionPath": "C:\\Users\\Zenith\\Desktop\\rooster_shift_finder\\utils\\extension",
  "extensionUrl": "chrome-extension://ilommichiccmkhjghmjgmamnbocelocm",
  "browserPath": "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  "timeOutElements": 30000,
  "timeOutResponse": 20000,
  "conditions": [
    {
      "startDate": "2024-08-08",
      "endDate": "2024-08-08",
      "startTime": "19:00:00",
      "endTime": "01:00:00",
      "minTime": {
        "hours": 6,
        "minutes": 0
      },
      "placesId": [48]
    },
    {
      "startDate": "2024-08-08",
      "endDate": "2024-08-08",
      "startTime": "11:00:00",
      "endTime": "13:30:00",
      "minTime": {
        "hours": 2,
        "minutes": 0
      },
      "placesId": [2]
    }
  ],
  "selectors": {
    "emailInput": "#app > div.Login__StyledContainer-EIyCN.hOPUnB > form > div > div:nth-child(1) > input",
    "passwordInput": "#app > div.Login__StyledContainer-EIyCN.hOPUnB > form > div > div:nth-child(2) > input",
    "loginButton": "#app > div.Login__StyledContainer-EIyCN.hOPUnB > form > button",
    "pageTitle": "#app > div.Y_H7dxviaGWF8ClZOdze > div > header > div > div.No9IbYC1L1JdgIlAPE0R",
    "shiftsPanel": "#app > div.Y_H7dxviaGWF8ClZOdze > div > div.uSWxsCRpZKLcGVs6a7YQ > div > div.cOWIDMF8UbrRpI6N7npl > div > div.L_I3pXDJRKAtG8_Xex8j > div.WhmgCDYM0M8cdsoOfskc",
    "shiftButtons": "#app > div.Y_H7dxviaGWF8ClZOdze > div > div.uSWxsCRpZKLcGVs6a7YQ > div > div.cOWIDMF8UbrRpI6N7npl > div > div.L_I3pXDJRKAtG8_Xex8j > div > div > article > div.EzY56c3ysV9cTZrUKsds > div > button",
    "shiftBoxes": "#app > div.Y_H7dxviaGWF8ClZOdze > div > div.uSWxsCRpZKLcGVs6a7YQ > div > div.cOWIDMF8UbrRpI6N7npl > div > div.L_I3pXDJRKAtG8_Xex8j > div > div > article > div.EzY56c3ysV9cTZrUKsds",
    "menuFromAvailableTimes": "#app > div.Y_H7dxviaGWF8ClZOdze > div > header > div > div.o9zFWFWLuvwCbmWwEiEw > button",
    "menuFromMyProfile": "#app > div:nth-child(3) > header > div > div.o9zFWFWLuvwCbmWwEiEw > button",
    "myProfile": "#app > div.DrawerWrapperStyled__DrawerStyled-jiHDjs.bjfxRn > div > div > div > div > a:nth-child(7)",
    "myAvailableTimes": "#app > div.DrawerWrapperStyled__DrawerStyled-jiHDjs.bjfxRn > div > div > div > div > a:nth-child(2)",
    "buttonDays": "#weekSliderContainer > button"
  },
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "es-419,es;q=0.5",
    "baggage": "",
    "client-version": "v2.80.80-release",
    "content-type": "application/json",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Brave\";v=\"125\", \"Chromium\";v=\"125\", \"Not.A/Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": "\"Android\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "sentry-trace": "",
    "cookie": "",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  }
}
```

## Running the Program

1. To run the program in development mode:

   ```sh
   npm run dev
   ```

2. To build the program into the `bin/` folder:
   ```sh
   npm run build
   ```

The final executable will be named `rooster_shift_finder.exe`. The executable will need the `utils` folder to function. Within `utils`, the `extension` folder containing the proxy connection extension and the `config.json` file must be present.
