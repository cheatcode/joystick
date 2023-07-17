import getAPIURLComponent from "./getAPIURLComponent.js";
import getAPIContext from "./getAPIContext.js";
import formatAPIError from "../lib/formatAPIError.js";
import validate from "../validation/index.js";
import getOutput from "./getOutput.js";
import sanitizeAPIResponse from "./sanitizeAPIResponse.js";
import { isObject } from "../validation/lib/typeValidators.js";
import validateSession from "./validateSession.js";
import runSetter from "./runSetter.js";
var registerSetters_default = (express, setters = [], context = {}, APIOptions = {}, appInstance = {}) => {
  const { app } = express;
  if (app) {
    for (const [setterName, setterOptions] of setters) {
      app.post(`/api/_setters/${getAPIURLComponent(setterName)}`, ...Array.isArray(setterOptions?.middleware) ? setterOptions?.middleware : [], async (req, res) => {
        const setterContext = await getAPIContext({ req, res }, context);
        const input = req?.body?.input || null;
        const output = req?.body?.output || null;
        runSetter({
          setterName,
          setterOptions,
          input,
          output,
          APIOptions,
          context: setterContext
        }).then((response) => {
          return res.status(200).send(JSON.stringify(response));
        }).catch((response) => {
          const errors = response?.errors;
          return res.status(errors[0]?.status || 400).send(JSON.stringify(response));
        });
      });
    }
  }
};
export {
  registerSetters_default as default
};
