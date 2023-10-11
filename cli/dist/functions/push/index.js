import chalk from "chalk";
import inquirer from "inquirer";
import get_settings_file from "./get_settings_file.js";
import validate_push_config from "./validate_push_config.js";
import get_session_token from "./get_session_token.js";
import CLILog from "../../lib/CLILog.js";
import get_provision_domain from "./get_provision_domain.js";
import get_app_domain from "./get_app_domain.js";
import get_deployment from "./get_deployment.js";
import validate_deployment from "./validate_deployment.js";
import Loader from "../../lib/loader.js";
import build from "../../lib/build/index.js";
import create_version from "./create_version.js";
import upload_build_to_cdn from "./upload_build_to_cdn.js";
import confirm_deployment_prompt from "./prompts/confirm_deployment.js";
import handle_initial_deployment from "./handle_initial_deployment.js";
import handle_version_deployment from "./handle_version_deployment.js";
const log_validation_error_response = (validation_type = "", root_error = "", validation_response = {}) => {
  try {
    let errors_list = ``;
    for (let i = 0; i < validation_response?.errors?.length; i += 1) {
      const validation_error = validation_response?.errors[i];
      if (validation_type === "push_config") {
        errors_list += `${chalk.yellowBright(`> ${validation_error.field}`)}
`;
      }
      errors_list += `${validation_error?.error}
${i + 1 === validation_response?.errors?.length ? "" : "\n"}`;
    }
    CLILog(
      `${root_error ? `${chalk.yellowBright(root_error)}


` : ""}${errors_list}`,
      {
        level: "danger",
        docs: {
          push_config: "https://cheatcode.co/docs/push/config",
          deployment: "https://cheatcode.co/docs/push/subscription"
        }[validation_type]
      }
    );
    process.exit(0);
  } catch (exception) {
    console.warn(exception);
  }
};
const get_session_for_deployment = async () => {
  try {
    const session_token = await get_session_token();
    if (!session_token) {
      CLILog(
        data?.error?.message,
        {
          level: "danger",
          docs: "https://cheatcode.co/docs/push/cli#authentication"
        }
      );
      return process.exit(0);
    }
    return session_token;
  } catch (exception) {
    console.warn(exception);
  }
};
const warn_no_push_config = (environment = "") => {
  try {
    CLILog(
      `settings.${environment}.json must contain a push config object. Add this following the docs link below and try again.`,
      {
        level: "danger",
        docs: "https://cheatcode.co/docs/push/config"
      }
    );
    return process.exit(0);
  } catch (exception) {
    throw new Error(`[push.warn_no_push_config] ${exception.message}`);
  }
};
var push_default = async (args = {}, options = {}) => {
  process.loader = new Loader();
  process.loader.print("Starting deployment...");
  const session_token = await get_session_for_deployment();
  const environment = options?.environment || "production";
  const settings = await get_settings_file({ environment });
  if (!settings?.push) {
    return warn_no_push_config(environment);
  }
  const push_provision_domain = get_provision_domain(options?.provision_server);
  const push_app_domain = get_app_domain(options?.provision_server);
  const deployment = await get_deployment({
    domain: settings?.push?.domain,
    session_token,
    push_provision_domain
  });
  let push_config_validation_response;
  if (deployment?.status === "undeployed") {
    push_config_validation_response = await validate_push_config({
      push_provision_domain,
      push_config: settings?.push
    });
    if (push_config_validation_response?.errors?.length > 0) {
      log_validation_error_response(
        "push_config",
        `Push config in settings.${environment}.json failed validation with the following errors:`,
        push_config_validation_response
      );
    }
  }
  const deployment_validation_response = await validate_deployment({
    session_token,
    push_provision_domain,
    push_config: settings?.push
  });
  if (deployment_validation_response?.errors?.length > 0) {
    log_validation_error_response(
      "deployment",
      `Deployment failed validation with the following errors:`,
      deployment_validation_response
    );
  }
  const { confirm_deployment } = deployment?.status === "undeployed" ? await inquirer.prompt(
    confirm_deployment_prompt(push_config_validation_response?.instances)
  ) : { confirm_deployment: true };
  if (confirm_deployment) {
    if (deployment?.status === "undeployed") {
      console.log("\n");
    }
    const build_timestamp = (/* @__PURE__ */ new Date()).toISOString();
    await build({
      environment,
      encrypt_build: true,
      encryption_key: deployment?.deployment_secret,
      silence_confirmation: true
    });
    process.loader.print("Uploading version...");
    await upload_build_to_cdn(
      build_timestamp,
      deployment,
      session_token
    );
    const create_version_response = await create_version({
      push_provision_domain,
      domain: settings?.push?.domain,
      session_token,
      body: {
        // NOTE: Endpoint anticipates a stringified version of settings.
        settings: JSON.stringify(settings),
        build_timestamp
      }
    });
    process.loader.print("Deploying app...");
    if (deployment?.status === "undeployed") {
      return handle_initial_deployment({
        push_provision_domain,
        push_app_domain,
        session_token,
        environment,
        build_timestamp,
        deployment
      });
    }
    return handle_version_deployment({
      push_provision_domain,
      push_app_domain,
      session_token,
      environment,
      build_timestamp,
      deployment
    });
  }
};
export {
  push_default as default
};
