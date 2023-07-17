/* eslint-disable consistent-return */

import validate from '../validation/index.js';
import formatAPIError from "../lib/formatAPIError.js";
import {isObject} from "../validation/lib/typeValidators.js";
import getOutput from "./getOutput.js";
import sanitizeAPIResponse from "./sanitizeAPIResponse.js";

const handleRunSetter = async (
  setterOptions = {},
  input = {},
  output = {},
  context = {},
  APIOptions = {}
) => {
  try {
    const shouldDisableSanitizationForSetter = setterOptions?.sanitize === false;
    const shouldSanitizeOutput = (setterOptions?.sanitize || APIOptions?.sanitize) === true || isObject(APIOptions?.sanitize || setterOptions?.sanitize);
    const data = (await setterOptions?.set(input, context)) || {};
    const response = output ? getOutput(data, output) : data;
    
    return !shouldDisableSanitizationForSetter && shouldSanitizeOutput ? sanitizeAPIResponse(
      response,
      setterOptions?.sanitize || APIOptions?.sanitize
    ) : response;
  } catch (exception) {
    throw new Error(`[runSetter.handleRunSetter] ${exception.message}`);
  }
};

const handleRunAuthorization = async (setterOptions = {}, input = {}, context = {}) => {
  try {
    return setterOptions?.authorized(input, context);
  } catch (exception) {
    throw new Error(`[runSetter.runAuthorization] ${exception.message}`);
  }
};

const handleLogValidationErrors = (validationErrors = [], setterName = '') => {
  try {
    console.log(
      `Input validation for setter "${setterName}" failed with the following errors:\n`
    );

    for (let i = 0; i < validationErrors?.length; i += 1) {
      const validationError = validationErrors[i];
      console.log(`${i + 1}. ${validationError}`);
    }
  } catch (exception) {
    throw new Error(`[runSetter.handleLogValidationErrors] ${exception.message}`);
  }
};

const handleRunValidation = async (input = {}, setterOptions = {}) => {
  try {
    let validationErrors = [];
    
    if (Object.keys(setterOptions?.input || {})?.length > 0) {
      validationErrors = await validate.inputWithSchema(
        input,
        setterOptions.input
      );
    }
    
    return validationErrors;
  } catch (exception) {
    throw new Error(`[runSetter.runValidation] ${exception.message}`);
  }
};

const validateOptions = (options) => {
  try {
    if (!options) throw new Error('options object is required.');
    if (!options.setterName) throw new Error('options.setterName is required.');
    if (!options.setterOptions) throw new Error('options.setterOptions is required.');
  } catch (exception) {
    throw new Error(`[runSetter.validateOptions] ${exception.message}`);
  }
};

const runSetter = async (options, { resolve, reject }) => {
  try {
    validateOptions(options);
    
    // NOTE: Only run validation if an input schema has been defined by the developer.
    if (Object?.keys(options?.setterOptions?.input || {})?.length > 0) {
      const validationErrors = await handleRunValidation(options?.input, options?.setterOptions);

      if (validationErrors?.length > 0) {
        handleLogValidationErrors(validationErrors, options?.setterName);

        return reject({
          errors: validationErrors.map((error) => {
            return formatAPIError(new Error(error), `setters.${options?.setterName}.validation`, 401);
          }),
        });
      } 
    }
    
    if (typeof options?.setterOptions?.authorized === 'function') {
      const authorized = await handleRunAuthorization(
        options?.setterOptions,
        options?.input,
        options?.context,
      );
      
      if (!authorized) {
        return reject({
          errors: [
            formatAPIError(
              new Error(`Not authorized to access ${options?.setterName}.`),
              `setters.${options?.setterName}.authorized`,
              403
            ),
          ],
        });
      }
    }
    
    if (typeof options?.setterOptions?.set === 'function') {
      const response = await handleRunSetter(
        options?.setterOptions,
        options?.input,
        options?.output,
        options?.context,
        options?.APIOptions,
      );

      return resolve(response);
    }
    
    resolve();
  } catch (exception) {
    reject(`[runSetter] ${exception.message}`);
  }
};

export default (options) =>
  new Promise((resolve, reject) => {
    runSetter(options, { resolve, reject });
  });
