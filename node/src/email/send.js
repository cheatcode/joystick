import chalk from "chalk";
import nodemailer from "nodemailer";
import fs from "fs";
import { htmlToText } from "html-to-text";
import juice from "juice";
import settings from "../settings";
import validateSMTPSettings from "./validateSMTPSettings";
import render from "./render";
import getBuildPath from "../lib/getBuildPath";
import trackFunctionCall from "../test/trackFunctionCall.js";

export default async (args) => {
  const { template: templateName, props, base: baseName, ...restOfOptions } = args;

  if (process.env.NODE_ENV === 'test') {
    // NOTE: In a test environment, we do not actually want to send an email. Instead,
    // track the call and then return.
    trackFunctionCall('node.email.send', [args]);
    return;
  }

  const validSMTPSettings = validateSMTPSettings(settings?.config?.email?.smtp);

  if (!validSMTPSettings) {
    console.warn(chalk.redBright("Cannot send email, invalid SMTP settings."));
    return Promise.resolve(null);
  }

  // NOTE: Check the port number as nodemailer notes most SMTP providers required a plaintext
  // connection *first* before upgrading the connection via STARTTLS. This prevents an SSL error
  // when sending emails via SMTP port 587 or 25. See: https://nodemailer.com/smtp/#tls-options.
  const isNoSecurePort = [587, 25, '587', '25'].includes(settings?.config?.email?.smtp?.port); 
  const smtp = validSMTPSettings
    ? nodemailer.createTransport({
        host: settings?.config?.email?.smtp?.host,
        port: settings?.config?.email?.smtp?.port,
        secure: !isNoSecurePort && process.env.NODE_ENV !== "development",
        auth: {
          user: settings?.config?.email?.smtp?.username,
          pass: settings?.config?.email?.smtp?.password,
        },
      })
    : null;

  let templatePath = `${process.cwd()}/${getBuildPath()}email/${templateName}.js`;

  const templateExists = templateName && fs.existsSync(templatePath);

  const options = {
    from: settings?.config?.email?.from,
    ...restOfOptions,
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
      user: restOfOptions?.user,
    });

    const text = htmlToText(html);
    const htmlWithStylesInlined = juice(html);

    options.html = htmlWithStylesInlined;
    options.text = text;
    
    console.log(html);

    return smtp.sendMail(options);
  }

  console.warn(`Template ${templateName} could not be found in /email. Double-check the template exists and try again.`);
  return Promise.resolve();
};
