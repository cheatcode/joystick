import chalk from "chalk";
import nodemailer from "nodemailer";
import fs from "fs";
import { htmlToText } from "html-to-text";
import juice from "juice";
import settings from "../settings";
import validateSMTPSettings from "./validateSMTPSettings";
import render from "./render";
import getBuildPath from "../lib/getBuildPath";
var send_default = async ({ template: templateName, props, base: baseName, ...restOfOptions }) => {
  const validSMTPSettings = validateSMTPSettings(settings?.config?.email?.smtp);
  if (!validSMTPSettings) {
    console.warn(chalk.redBright("Cannot send email, invalid SMTP settings."));
    return Promise.resolve(null);
  }
  const isNoSecurePort = [587, 25, "587", "25"].includes(settings?.config?.email?.smtp?.port);
  const smtp = validSMTPSettings ? nodemailer.createTransport({
    host: settings?.config?.email?.smtp?.host,
    port: settings?.config?.email?.smtp?.port,
    secure: !isNoSecurePort && process.env.NODE_ENV !== "development",
    auth: {
      user: settings?.config?.email?.smtp?.username,
      pass: settings?.config?.email?.smtp?.password
    }
  }) : null;
  let templatePath = `${process.cwd()}/${getBuildPath()}email/${templateName}.js`;
  const templateExists = templateName && fs.existsSync(templatePath);
  const options = {
    from: settings?.config?.email?.from,
    ...restOfOptions
  };
  if (templateExists) {
    const template = (await import(templatePath)).default;
    const html = await render({
      templateName,
      baseName,
      settings,
      Component: template,
      props,
      subject: restOfOptions?.subject,
      preheader: restOfOptions?.preheader,
      user: restOfOptions?.user
    });
    const text = htmlToText(html);
    const htmlWithStylesInlined = juice(html);
    options.html = htmlWithStylesInlined;
    options.text = text;
    return smtp.sendMail(options);
  }
  console.warn(`Template ${templateName} could not be found in /email. Double-check the template exists and try again.`);
  return Promise.resolve();
};
export {
  send_default as default
};
