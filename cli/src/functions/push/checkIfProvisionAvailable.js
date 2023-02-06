import pingProvisionAPI from "./pingProvisionAPI.js";
import CLILog from "../../lib/CLILog.js";

export default async () => {
  const response = await pingProvisionAPI();

  if (response !== 'pong') {
    CLILog(
      'The Push provision API is currently unavailable. Please try again in a few minutes.',
      {
        level: 'danger',
        docs: 'https://cheatcode.co/docs/push/status'
      }
    );

    process.exit(0);
  }

  return true;
};