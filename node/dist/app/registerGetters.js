import getAPIURLComponent from "./getAPIURLComponent";
import getAPIContext from "./getAPIContext";
import formatAPIError from "../lib/formatAPIError";
import validate from "../validation/index.js";
import getOutput from "./getOutput";
import sanitizeAPIResponse from "./sanitizeAPIResponse";
import { isObject } from "../validation/lib/typeValidators";
import validateSession from "./validateSession.js";
var registerGetters_default = (express, getters = [], context = {}, APIOptions = {}, appInstance = {}) => {
  const { app } = express;
  if (app) {
    for (const [getter_name, getter_options] of getters) {
      app.get(`/api/_getters/${getAPIURLComponent(getter_name)}`, ...Array.isArray(getter_options?.middleware) ? getter_options?.middleware : [], async (req, res) => {
        const getter_context = await getAPIContext({ req, res }, context);
        const { query } = req;
        const input = query?.input ? JSON.parse(query?.input) : null;
        const output = query?.output ? JSON.parse(query?.output) : null;
        const authorized = getter_options?.authorized;
        const get = getter_options?.get;
        const localSanitizationOptions = getter_options?.sanitize;
        const shouldDisableSanitizationForGetter = getter_options?.sanitize === false;
        const shouldSanitizeOutput = (getter_options?.sanitize || APIOptions?.sanitize) === true || isObject(APIOptions?.sanitize || getter_options?.sanitize);
        let validationErrors = [];
        if (Object.keys(getter_options?.input || {})?.length > 0) {
          validationErrors = await validate.inputWithSchema(input, getter_options.input);
        }
        if (validationErrors.length > 0) {
          console.log("");
          console.log(`Input validation for getter "${getter_name}" failed with the following errors:
`);
          validationErrors.forEach((validationError, index) => {
            console.log(`#${index + 1}. ${validationError}`);
          });
          return res.status(400).send(JSON.stringify({
            errors: validationErrors.map((error) => {
              return formatAPIError(new Error(error, "validation"));
            })
          }));
        }
        if (authorized && typeof authorized === "function") {
          const isAuthorized = await authorized(input, getter_context);
          if (!isAuthorized) {
            return res.status(403).send(JSON.stringify({
              errors: [
                formatAPIError(new Error(`Not authorized to access ${getter_name}.`, "authorized"))
              ]
            }));
          }
        }
        if (get && typeof get === "function") {
          try {
            const data = await get(input, getter_context) || {};
            const response = output ? getOutput(data, output) : data;
            const sanitizedResponse = !shouldDisableSanitizationForGetter && shouldSanitizeOutput ? sanitizeAPIResponse(response, localSanitizationOptions || APIOptions?.sanitize) : response;
            return res.send(JSON.stringify(sanitizedResponse || {}));
          } catch (exception) {
            return res.status(500).send(JSON.stringify({
              errors: [formatAPIError(exception, `getters.${getter_name}`)]
            }));
          }
        }
        res.status(200).send(JSON.stringify({ errors: [] }));
      });
    }
  }
};
export {
  registerGetters_default as default
};
