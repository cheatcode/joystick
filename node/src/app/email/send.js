import chalk from "chalk";
import { htmlToText } from "html-to-text";
import juice from "juice";
import nodemailer from "nodemailer";
import dynamic_import from "../../lib/dynamic_import.js";
import get_joystick_build_path from "../../lib/get_joystick_build_path.js";
import get_translations from "../../lib/get_translations.js";
import load_settings from "../settings/load.js";
import path_exists from "../../lib/path_exists.js";
import ssr from "../ssr/index.js";
import track_function_call from "../../test/track_function_call.js";
import validate_smtp_settings from "./validate_smtp_settings.js";

const settings = load_settings();
const joystick_build_path = get_joystick_build_path();

const send_email = async (send_email_options = {}, smtp_overrides = {}) => {
  if (process.env.NODE_ENV === 'test') {
    // NOTE: In a test environment, we do not actually want to send an email. Instead,
    // track the call and then return.
    track_function_call('node.email.send', [send_email_options]);
    return;
  }

  const valid_smtp_settings = validate_smtp_settings(settings?.config?.email?.smtp);

  if (!valid_smtp_settings) {
    console.warn(chalk.redBright("Invalid SMTP settings. Cannot send email."));
    return Promise.resolve(null);
  }

  // NOTE: Check the port number as nodemailer notes most SMTP providers required a plaintext
  // connection *first* before upgrading the connection via STARTTLS. This prevents an SSL error
  // when sending emails via SMTP port 587 or 25. See: https://nodemailer.com/smtp/#tls-options.
  const smtp_port = parseInt(smtp_overrides?.port || settings?.config?.email?.smtp?.port, 10);
  const should_use_secure = smtp_port === 465 || ![25, 587].includes(smtp_port);

  const smtp = valid_smtp_settings
    ? nodemailer.createTransport({
        host: smtp_overrides?.host || settings?.config?.email?.smtp?.host,
        port: smtp_port,
        secure: should_use_secure,
        auth: {
          user: smtp_overrides?.username || settings?.config?.email?.smtp?.username,
          pass: smtp_overrides?.password || settings?.config?.email?.smtp?.password,
        },
      })
    : null;

  const template_path = `${joystick_build_path}email/${send_email_options?.template}.js`;
  // NOTE: Check cache first, then fallback to disk existence check
  const template_exists = send_email_options?.template && (
    process._joystick_email_templates?.[send_email_options?.template] || 
    await path_exists(template_path)
  );

  const nodemailer_options = {
    from: settings?.config?.email?.from,
    ...send_email_options,
  };

  if (smtp_overrides?.headers) {
    nodemailer_options.headers = smtp_overrides?.headers;
  }

  if (template_exists) {
    // NOTE: Try to get email template from cache first, fallback to disk loading
    const email_template_component = process._joystick_email_templates?.[send_email_options?.template] || 
      await dynamic_import(`${template_path}?v=${new Date().getTime()}`);

    const translations = await get_translations({
    	is_email: true,
    	email_template_name: send_email_options?.template,
    	email_language_files_path: process._joystick_translations?.email?.path || `${joystick_build_path}i18n/email`,
      email_language_files: process._joystick_translations?.email?.files || [],
    	req: {
    		context: {
    			user: send_email_options?.user,
    		},
    	},
    });

    const html = await ssr({
    	is_email: true,
      component_options: {
        props: send_email_options?.props,
        translations,
      },
      component_to_render: email_template_component,
      email_options: {
        base_html_name: send_email_options?.base,
      	subject: send_email_options?.subject,
      	preheader: send_email_options?.preheader ? `${send_email_options?.preheader}${'\u2007\u034F'.repeat(100)}${'\u00AD'.repeat(50)}` : '',
      },
    });

    const text = htmlToText(html);
    const html_with_styles_inlined = juice(html, {
      preserveMediaQueries: true,
      preserveImportant: true,
      removeStyleTags: false,
    });

    nodemailer_options.html = html_with_styles_inlined;
    nodemailer_options.text = text;
    
    return smtp.sendMail(nodemailer_options);
  }

  console.warn(`Email template at /email/${send_email_options?.template}.js could not be found.`);

  return Promise.resolve();
};

export default send_email;
