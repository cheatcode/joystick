import format_api_error from "../app/api/format_api_error.js";
import track_function_call from "../test/track_function_call.js";
import types from "../lib/types.js";
import validate_input from "../app/api/validate_input.js";

class Action {
  constructor(input = {}) {
    this.name = input?.name;
    this.config = input?.config;
    this.options = input?.options;
    this.steps = this._serialize_steps();

    this._serialize_steps = this._serialize_steps.bind(this);
    this._log_error = this._log_error.bind(this);
    this.run = this.run.bind(this);
  }

  _serialize_steps() {
    return Object.entries(this?.config?.steps || {})?.reduce(
      (serialized_steps = {}, [step_name = "", step_options = {}]) => {
        serialized_steps[step_name] = async (...args) => {
          try {
            track_function_call(`node.actions.${this?.name}.steps.${step_name}`, [
              ...args,
              this,
            ]);

            const result = await step_options?.run(...args, this);

            if (types.is_function(step_options?.onSuccess) || types.is_function(step_options?.on_success)) {
              (step_options.onSuccess || step_options.on_success)(result, this);
              track_function_call(`node.actions.${this?.name}.steps.${step_name}.on_success`, [
                result,
                this,
              ]);
            }

            return result;
          } catch (exception) {
            if (this.options?.logErrors || this.options?.log_errors) {
              this._log_error(step_name, exception);
            }

            if (types.is_function(step_options.onError) || types.is_function(step_options.on_error)) {
              (step_options.onError || step_options.on_error)(exception, this);
              track_function_call(`node.actions.${this?.name}.steps.${step_name}.on_error`, [
                exception,
                this,
              ]);
            }
          }
        };

        return serialized_steps;
      },
      {}
    );
  }

  _log_error(location = null, exception = null) {
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
          track_function_call(`node.actions.${this?.name}.abort`, [
            error,
          ]);

          reject(error);
          throw error;
        };

        if (Object.keys(this?.config?.input || {})?.length > 0) {
          const validation_errors = await validate_input(
            input,
            this?.config?.input
          );

          if (validation_errors?.length > 0) {
            for (let i = 0; i < validation_errors?.length; i += 1) {
              const error = validation_errors[i];
              if (this?.options?.logErrors || this?.options?.log_errors) {
                console.log(`[${this.name}.validation] ${error}`);
              }
            }

            const formatted_validation_errors = validation_errors?.map((validation_error) => {
              // NOTE: Remove period on the end so we can comma-delimit errors.
              return validation_error?.substring(
                0,
                validation_error.length - 1
              );
            })
            .join(", ");

            return reject(new Error(formatted_validation_errors));
          }
        }

        track_function_call(`node.actions.${this.name}.run`, [
          input || {},
          this.steps,
          this,
        ]);

        const result = await this.config?.run(input || {}, this?.steps, this);

        return resolve(result);
      } catch (exception) {
        if (this.options?.logErrors || this?.options?.log_errors) {
          this._log_error(null, exception);
        }

        reject(exception);
      }
    }).catch((error) => {
      return Promise.reject(
        format_api_error(error, error?.location || this.name)
      );
    });
  }
}

export default Action;
