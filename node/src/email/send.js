import chalk from "chalk";
import nodemailer from "nodemailer";
import fs from "fs";
import { htmlToText } from "html-to-text";
import juice from "juice";
import settings from "../settings";
import validateSMTPSettings from "./validateSMTPSettings";
import render from "./render";

// TODO: Fallback to default reset-password.js in /templates/reset-password.js here.

export default ({ template: templateName, props, ...restOfOptions }) => {
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

  const templatePath = `${process.cwd()}/.joystick/build/email/${templateName}.js`;
  const options = {
    from: settings?.config?.email?.from,
    ...restOfOptions,
  };

  if (templateName && !fs.existsSync(templatePath)) {
    console.warn(
      chalk.redBright(
        `Could not find an email template with the name ${templateName}.js in /email.`
      )
    );
  }

  console.log({
    templateName,
    exists: fs.existsSync(templatePath),
  });

  if (templateName && fs.existsSync(templatePath)) {
    const template = require(templatePath);
    console.log(template);
    const html = render({
      Component: template,
      props,
    });

    const text = htmlToText(html);
    const htmlWithStylesInlined = juice(html);

    options.html = htmlWithStylesInlined;
    options.text = text;
  }

  console.log(options);

  return smtp.sendMail(options);
};
