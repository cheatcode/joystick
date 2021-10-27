import getAPIURLComponent from "./getAPIURLComponent.js";
import getAPIContext from "./getAPIContext.js";
import formatAPIError from "../lib/formatAPIError.js";
import validate from "../validation/index.js";
import getOutput from "./getOutput.js";
var registerSetters_default = (express, setters = [], context = {}) => {
  const { app } = express;
  if (app) {
    for (const [setter_name, setter_options] of setters) {
      app.post(`/api/_setters/${getAPIURLComponent(setter_name)}`, async (req, res) => {
        const setter_context = await getAPIContext({ req, res }, context);
        const input = req?.body?.input;
        const output = req?.body?.output;
        const set = setter_options?.set;
        let errors = [];
        if (setter_options?.input) {
          errors = validate.inputWithSchema(input, setter_options.input);
        }
        if (set && typeof set === "function") {
          try {
            const data = await set(input, setter_context) || {};
            const response = output ? getOutput(data, output) : data;
            return res.send(JSON.stringify(response || {}));
          } catch (exception) {
            console.log(exception);
            return res.status(500).send(JSON.stringify({
              errors: [formatAPIError(exception, "server")]
            }));
          }
        }
        if (errors.length > 0) {
          console.log(errors);
          return res.status(400).send(JSON.stringify({
            errors: errors.map((error) => {
              return formatAPIError(new Error(error, "validation"));
            })
          }));
        }
        res.status(200).send(JSON.stringify({ errors: [] }));
      });
    }
  }
};
export {
  registerSetters_default as default
};
