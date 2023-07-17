import getAPIURLComponent from "./getAPIURLComponent.js";
import getAPIContext from "./getAPIContext.js";
import formatAPIError from "../lib/formatAPIError.js";
import validate from "../validation/index.js";
import getOutput from "./getOutput.js";
import sanitizeAPIResponse from "./sanitizeAPIResponse.js";
import { isObject } from "../validation/lib/typeValidators.js";
import validateSession from "./validateSession.js";

export default (express, setters = [], context = {}, APIOptions = {}, appInstance = {}) => {
  const { app } = express;

  if (app) {
    for (const [setter_name, setter_options] of setters) {
      app.post(
        `/api/_setters/${getAPIURLComponent(setter_name)}`,
        ...(Array.isArray(setter_options?.middleware)
          ? setter_options?.middleware
          : []),
        async (req, res) => {
//          const isValidSession = validateSession(req, res, appInstance?.sessions);
//
//          if (!isValidSession) {
//            // NOTE: validateSession handles the 403 error so just return here.
//            return;
//          }

          const setter_context = await getAPIContext({ req, res }, context);
          const input = req?.body?.input;
          const output = req?.body?.output;
          const authorized = setter_options?.authorized;
          const set = setter_options?.set;
          const localSanitizationOptions = setter_options?.sanitize;
          const shouldDisableSanitizationForSetter =
            setter_options?.sanitize === false;
          const shouldSanitizeOutput =
            (setter_options?.sanitize || APIOptions?.sanitize) === true ||
            isObject(APIOptions?.sanitize || setter_options?.sanitize);

          let validationErrors = [];

          if (Object.keys(setter_options?.input || {})?.length > 0) {
            validationErrors = await validate.inputWithSchema(
              input,
              setter_options.input
            );
          }

          if (validationErrors.length > 0) {
            console.log("");
            console.log(
              `Input validation for setter "${setter_name}" failed with the following errors:\n`
            );

            validationErrors.forEach((validationError, index) => {
              console.log(`#${index + 1}. ${validationError}`);
            });

            return res.status(400).send(
              JSON.stringify({
                errors: validationErrors.map((error) => {
                  return formatAPIError(new Error(error, "validation"));
                }),
              })
            );
          }

          if (authorized && typeof authorized === "function") {
            const isAuthorized = await authorized(input, setter_context);

            if (!isAuthorized) {
              return res.status(403).send(
                JSON.stringify({
                  errors: [
                    formatAPIError(
                      new Error(
                        `Not authorized to access ${setter_name}.`,
                        "authorized"
                      )
                    ),
                  ],
                })
              );
            }
          }

          if (set && typeof set === "function") {
            try {
              const data = (await set(input, setter_context)) || {};
              const response = output ? getOutput(data, output) : data;
              const sanitizedResponse =
                !shouldDisableSanitizationForSetter && shouldSanitizeOutput
                  ? sanitizeAPIResponse(
                      response,
                      localSanitizationOptions || APIOptions?.sanitize
                    )
                  : response;
              return res.send(JSON.stringify(sanitizedResponse || {}));
            } catch (exception) {
              return res.status(500).send(
                JSON.stringify({
                  errors: [formatAPIError(exception, `setters.${setter_name}`)],
                })
              );
            }
          }

          res.status(200).send(JSON.stringify({ errors: [] }));
        }
      );
    }
  }
};
