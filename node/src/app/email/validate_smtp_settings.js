import chalk from "chalk";

const validate_smtp_settings = (settings = null) => {
  if (!settings) {
    console.warn(
      chalk.redBright(
        `Invalid SMTP settings: config.smtp not defined in settings.${process.env.NODE_ENV}.js`
      )
    );
    return false;
  }

  if (settings && !settings.host) {
    console.warn(
      chalk.redBright(
        `Invalid SMTP settings: config.smtp.host not defined in settings.${process.env.NODE_ENV}.js`
      )
    );
    return false;
  }

  if (settings && !settings.port) {
    console.warn(
      chalk.redBright(
        `Invalid SMTP settings: config.smtp.port not defined in settings.${process.env.NODE_ENV}.js`
      )
    );
    return false;
  }

  if (settings && !settings.username) {
    console.warn(
      chalk.redBright(
        `Invalid SMTP settings: config.smtp.username not defined in settings.${process.env.NODE_ENV}.js`
      )
    );
    return false;
  }

  if (settings && !settings.password) {
    console.warn(
      chalk.redBright(
        `Invalid SMTP settings: config.smtp.password not defined in settings.${process.env.NODE_ENV}.js`
      )
    );
    return false;
  }

  return true;
};

export default validate_smtp_settings;

