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
          const get = getter_options?.get;

          let errors = [];

          if (getter_options?.input) {
            errors = validate.inputWithSchema(input, getter_options.input);
          }

          if (get && typeof get === "function" && errors.length === 0) {
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

          if (errors.length > 0) {
            console.log(errors);
            return res.status(400).send(
              JSON.stringify({
                errors: errors.map((error) => {
                  return formatAPIError(new Error(error, "validation"));
                }),
              })
            );
          }

          res.status(200).send(JSON.stringify({ errors: [] }));
        }
      );
    }
  }
};
