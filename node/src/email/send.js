import chalk from "chalk";
import nodemailer from "nodemailer";
import fs from "fs";
import { htmlToText } from "html-to-text";
import juice from "juice";
import settings from "../settings";
import validateSMTPSettings from "./validateSMTPSettings";
import render from "./render";

export default async ({ template: templateName, props, ...restOfOptions }) => {
  const validSMTPSettings = validateSMTPSettings(settings?.config?.email?.smtp);

  if (!validSMTPSettings) {
    console.warn(chalk.redBright("Cannot send email, invalid SMTP settings."));
    return;
  }

  const smtp = validSMTPSettings
    ? nodemailer.createTransport({
        host: settings?.config?.email?.smtp?.host,
        port: settings?.config?.email?.smtp?.port,
        secure: process.env.NODE_ENV !== "development",
        auth: {
          user: settings?.config?.email?.smtp?.username,
          pass: settings?.config?.email?.smtp?.password,
        },
      })
    : null;

  let templatePath = process.env.NODE_ENV === 'test' ? `${process.cwd()}/src/email/templates/reset-password.js` : `${process.cwd()}/.joystick/build/email/${templateName}.js`;
  const options = {
    from: settings?.config?.email?.from,
    ...restOfOptions,
  };

  if (templateName && !fs.existsSync(templatePath)) {
    templatePath = `./templates/reset-password.js`;
  }

  if (templateName && fs.existsSync(templatePath)) {
    try {
      const template = (await import(templatePath)).default;
      const html = render({
        Component: template,
        props,
      });
  
      const text = htmlToText(html);
      const htmlWithStylesInlined = juice(html);
  
      options.html = htmlWithStylesInlined;
      options.text = text;
    } catch (exception) {
      console.warn(exception);
    }
  }

  console.log(options);

  return smtp.sendMail(options);
};
