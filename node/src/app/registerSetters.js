import chalk from 'chalk';
import getAPIURLComponent from "./getAPIURLComponent.js";
import getAPIContext from "./getAPIContext.js";
import formatAPIError from "../lib/formatAPIError.js";
import validate from "../validation/index.js";
import getOutput from "./getOutput.js";

export default (express, setters = [], context = {}) => {
  const { app } = express;

  if (app) {
    for (const [setter_name, setter_options] of setters) {
      app.post(
        `/api/_setters/${getAPIURLComponent(setter_name)}`,
        async (req, res) => {
          const setter_context = await getAPIContext({ req, res }, context);
          const input = req?.body?.input;
          const output = req?.body?.output;
          const authorized = setter_options?.authorized;
          const set = setter_options?.set;

          let validationErrors = [];

          if (setter_options?.input) {
            validationErrors = await validate.inputWithSchema(input, setter_options.input);
          }

          if (validationErrors.length > 0) {
            console.log('');
            console.log(`Input validation for setter "${setter_name}" failed with the following errors:\n`);
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

          if (authorized && typeof authorized === 'function') {
            const isAuthorized = await authorized(input, setter_context);

            if (!isAuthorized) {
              return res.status(403).send(
                JSON.stringify({
                  errors: [
                    formatAPIError(new Error(`Not authorized to access ${setter_name}.`, "authorized")),
                  ],
                })
              );
            }
          }

          if (set && typeof set === "function") {
            try {
              const data = (await set(input, setter_context)) || {};
              const response = output ? getOutput(data, output) : data;
              return res.send(JSON.stringify(response || {}));
            } catch (exception) {
              console.log(exception);
              return res.status(500).send(
                JSON.stringify({
                  errors: [formatAPIError(exception, "server")],
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
