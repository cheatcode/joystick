import getAPIURLComponent from "./getAPIURLComponent";
import getAPIContext from "./getAPIContext";
import formatAPIError from "../lib/formatAPIError";
import validate from "../validation/index.js";
import getOutput from "./getOutput";
import sanitizeAPIResponse from "./sanitizeAPIResponse";
import { isObject } from "../validation/lib/typeValidators";
import validateSession from "./validateSession.js";
import runGetter from "./runGetter.js";
var registerGetters_default = (express, getters = [], context = {}, APIOptions = {}, appInstance = {}) => {
  const { app } = express;
  if (app) {
    for (const [getterName, getterOptions] of getters) {
      app.get(`/api/_getters/${getAPIURLComponent(getterName)}`, ...Array.isArray(getterOptions?.middleware) ? getterOptions?.middleware : [], async (req, res) => {
        const isValidSession = validateSession(req, res, appInstance?.sessions);
        if (!isValidSession) {
          return;
        }
        const getterContext = await getAPIContext({ req, res }, context);
        const input = req?.query?.input ? JSON.parse(req?.query?.input) : null;
        const output = req?.query?.output ? JSON.parse(req?.query?.output) : null;
        runGetter({
          getterName,
          getterOptions,
          input,
          output,
          APIOptions,
          context: getterContext
        }).then((response) => {
          return res.status(200).send(JSON.stringify(response));
        }).catch((error) => {
          if (typeof error === "string") {
            return res.status(500).send(error);
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
  registerGetters_default as default
};
