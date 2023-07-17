import validate from "../validation/index.js";
import formatAPIError from "../lib/formatAPIError.js";
import { isObject } from "../validation/lib/typeValidators.js";
import getOutput from "./getOutput.js";
import sanitizeAPIResponse from "./sanitizeAPIResponse.js";
const handleRunGetter = async (getterOptions = {}, input = {}, output = {}, context = {}, APIOptions = {}) => {
  try {
    const shouldDisableSanitizationForGetter = getterOptions?.sanitize === false;
    const shouldSanitizeOutput = (getterOptions?.sanitize || APIOptions?.sanitize) === true || isObject(APIOptions?.sanitize || getterOptions?.sanitize);
    const data = await getterOptions?.get(input, context) || {};
    const response = output ? getOutput(data, output) : data;
    return !shouldDisableSanitizationForGetter && shouldSanitizeOutput ? sanitizeAPIResponse(response, getterOptions?.sanitize || APIOptions?.sanitize) : response;
  } catch (exception) {
    throw new Error(`[runGetter.handleRunGetter] ${exception.message}`);
  }
};
const handleRunAuthorization = async (getterOptions = {}, input = {}, context = {}) => {
  try {
    return getterOptions?.authorized(input, context);
  } catch (exception) {
    throw new Error(`[runGetter.runAuthorization] ${exception.message}`);
  }
};
const handleLogValidationErrors = (validationErrors = [], getterName = "") => {
  try {
    console.log(`Input validation for getter "${getterName}" failed with the following errors:
`);
    for (let i = 0; i < validationErrors?.length; i += 1) {
      const validationError = validationErrors[i];
      console.log(`${i + 1}. ${validationError}`);
    }
  } catch (exception) {
    throw new Error(`[runGetter.handleLogValidationErrors] ${exception.message}`);
  }
};
const handleRunValidation = async (input = {}, getterOptions = {}) => {
  try {
    let validationErrors = [];
    if (Object.keys(getterOptions?.input || {})?.length > 0) {
      validationErrors = await validate.inputWithSchema(input, getterOptions.input);
    }
    return validationErrors;
  } catch (exception) {
    throw new Error(`[runGetter.runValidation] ${exception.message}`);
  }
};
const validateOptions = (options) => {
  try {
    if (!options)
      throw new Error("options object is required.");
    if (!options.getterName)
      throw new Error("options.getterName is required.");
    if (!options.getterOptions)
      throw new Error("options.getterOptions is required.");
  } catch (exception) {
    throw new Error(`[runGetter.validateOptions] ${exception.message}`);
  }
};
const runGetter = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);
    if (Object?.keys(options?.getterOptions?.input || {})?.length > 0) {
      const validationErrors = await handleRunValidation(options?.input, options?.getterOptions);
      if (validationErrors?.length > 0) {
        handleLogValidationErrors(validationErrors, options?.getterName);
        return reject({
          errors: validationErrors.map((error) => {
            return formatAPIError(new Error(error), "validation", 401);
          })
        });
      }
    }
    if (typeof options?.getterOptions?.authorized === "function") {
      const authorized = await handleRunAuthorization(options?.getterOptions, options?.input, options?.context);
      if (!authorized) {
        return reject({
          errors: [
            formatAPIError(new Error(`Not authorized to access ${options?.getterName}.`), "authorized", 403)
          ]
        });
      }
    }
    if (typeof options?.getterOptions?.get === "function") {
      const response = await handleRunGetter(options?.getterOptions, options?.input, options?.output, options?.context, options?.APIOptions);
      return resolve(response);
    }
    resolve();
  } catch (exception) {
    reject(`[runGetter] ${exception.message}`);
  }
};
var runGetter_default = (options) => new Promise((resolve, reject) => {
  runGetter(options, { resolve, reject });
});
export {
  runGetter_default as default
};
