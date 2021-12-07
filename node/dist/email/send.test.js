import { jest } from "@jest/globals";
import chalk from "chalk";
import send from "./send";
import setAppSettingsForTest from "../tests/lib/setAppSettingsForTest";
setAppSettingsForTest({
  "config": {
    "databases": [
      {
        "provider": "mongodb",
        "users": true,
        "options": {}
      }
    ],
    "i18n": {
      "defaultLanguage": "en-US"
    },
    "middleware": {},
    "email": {
      "from": "app@test.com",
      "smtp": {}
    }
  },
  "global": {},
  "public": {},
  "private": {}
});
console.warn = jest.fn();
describe("send.js", () => {
  test("console.warns an error when bad smtp settings are passed", async () => {
    const result = await send({ template: "test", props: {} });
    expect(result).toBe(null);
    expect(console.warn.mock.calls).toEqual([
      [chalk.redBright("Invalid SMTP settings: config.smtp not defined in settings.test.js")],
      [chalk.redBright("Cannot send email, invalid SMTP settings.")]
    ]);
  });
});
