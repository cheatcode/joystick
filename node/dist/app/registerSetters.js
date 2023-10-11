import getAPIURLComponent from "./getAPIURLComponent.js";
import getAPIContext from "./getAPIContext.js";
import formatAPIError from "../lib/formatAPIError.js";
import validateSession from "./validateSession.js";
import runSetter from "./runSetter.js";
var registerSetters_default = (express, setters = [], context = {}, APIOptions = {}, appInstance = {}) => {
  const { app } = express;
  if (app) {
    for (const [setterName, setterOptions] of setters) {
      app.post(`/api/_setters/${getAPIURLComponent(setterName)}`, ...Array.isArray(setterOptions?.middleware) ? setterOptions?.middleware : [], async (req, res) => {
        const isValidSession = await validateSession(req, res);
        if (!isValidSession) {
          return;
        }
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
        }).catch((error) => {
          if (typeof error === "string") {
            const sanitized_error = error?.replace("[runSetter] ", "")?.replace("[runSetter.handleRunSetter] ", "");
            return res.status(500).send(JSON.stringify({
              errors: [formatAPIError(new Error(sanitized_error))]
            }));
          }
          if (typeof error === "object" && !Array.isArray(error)) {
            return res.status(error?.errors && error?.errors[0]?.status || 400).send(JSON.stringify(error));
          }
        });
      });
    }
  }
};
export {
  registerSetters_default as default
};
