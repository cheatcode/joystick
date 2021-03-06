import chalk from 'chalk';
import getAPIURLComponent from "./getAPIURLComponent";
import getAPIContext from "./getAPIContext";
import formatAPIError from "../lib/formatAPIError";
import validate from "../validation/index.js";
import getOutput from "./getOutput";

export default (express, getters = [], context = {}) => {
  const { app } = express;

  if (app) {
    for (const [getter_name, getter_options] of getters) {
      app.get(
        `/api/_getters/${getAPIURLComponent(getter_name)}`,
        async (req, res) => {
          const getter_context = await getAPIContext({ req, res }, context);
          const { query } = req;
          const input = query?.input ? JSON.parse(query?.input) : null;
          const output = query?.output ? JSON.parse(query?.output) : null;
          const authorized = getter_options?.authorized;
          const get = getter_options?.get;

          let validationErrors = [];

          if (getter_options?.input) {
            validationErrors = await validate.inputWithSchema(input, getter_options.input);
          }

          if (validationErrors.length > 0) {
            console.log('');
            console.log(`Input validation for getter "${getter_name}" failed with the following errors:\n`);
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
            const isAuthorized = await authorized(input, getter_context);

            if (!isAuthorized) {
              return res.status(403).send(
                JSON.stringify({
                  errors: [
                    formatAPIError(new Error(`Not authorized to access ${getter_name}.`, "authorized")),
                  ],
                })
              );
            }
          }

          if (get && typeof get === "function") {
            try {
              const data = (await get(input, getter_context)) || {};
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
