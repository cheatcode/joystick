import formatAPIError from "../lib/formatAPIError";
import validate from "../validation";
class Action {
  constructor(input = {}) {
    this.name = input?.name;
    this.config = input?.config;
    this.options = input?.options;
    this.steps = this._serializeSteps();
    this._serializeSteps = this._serializeSteps.bind(this);
    this._logError = this._logError.bind(this);
    this.run = this.run.bind(this);
  }
  _serializeSteps() {
    return Object.entries(this?.config?.steps || {})?.reduce((serializedSteps = {}, [stepName = "", stepOptions = {}]) => {
      serializedSteps[stepName] = async (...args) => {
        try {
          const result = await stepOptions?.run(...args, this);
          if (typeof stepOptions?.onSuccess === "function") {
            stepOptions.onSuccess(result, this);
          }
          return result;
        } catch (exception) {
          if (this.options?.logErrors) {
            this._logError(stepName, exception);
          }
          if (typeof stepOptions?.onError === "function") {
            stepOptions.onError(exception, this);
          }
        }
      };
      return serializedSteps;
    }, {});
  }
  _logError(location = null, exception = null) {
    let path = "";
    if (this.name && !location) {
      path += `${this.name}`;
    }
    if (this.name && location) {
      path += `${this.name}.${location}`;
    }
    console.log({ path, exception });
  }
  run(input = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        this.abort = (error) => {
          reject(error);
          throw error;
        };
        if (Object.keys(this?.config?.input || {})?.length > 0) {
          const validationErrors = await validate.inputWithSchema(input, this?.config?.input);
          if (validationErrors?.length > 0) {
            for (let i = 0; i < validationErrors?.length; i += 1) {
              const error = validationErrors[i];
              if (this?.options?.logErrors) {
                console.log(`[${this.name}.validation] ${error}`);
              }
            }
            const formattedValidationErrors = validationErrors?.map((validationError) => {
              return validationError?.substring(0, validationError.length - 1);
            }).join(", ");
            return reject(new Error(formattedValidationErrors));
          }
        }
        const result = await this.config?.run(this?.config?.input || {}, this?.steps, this);
        return resolve(result);
      } catch (exception) {
        if (this.options?.logErrors) {
          this._logError(null, exception);
        }
        reject(exception);
      }
    }).catch((error) => {
      return Promise.reject(formatAPIError(error, error?.location || this.name));
    });
  }
}
var class_default = Action;
export {
  class_default as default
};
