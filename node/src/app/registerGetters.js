import getAPIURLComponent from "./getAPIURLComponent";
import getAPIContext from "./getAPIContext";
import formatAPIError from "../lib/formatAPIError";
import validateSession from "./validateSession.js";
import runGetter from "./runGetter.js";

export default (express, getters = [], context = {}, APIOptions = {}, appInstance = {}) => {
  const { app } = express;

  if (app) {
    for (const [getterName, getterOptions] of getters) {
      app.get(
        `/api/_getters/${getAPIURLComponent(getterName)}`,
        ...(Array.isArray(getterOptions?.middleware)
          ? getterOptions?.middleware
          : []),
        async (req, res) => {
          const isValidSession = await validateSession(req, res);

          if (!isValidSession) {
            // NOTE: validateSession handles the 403 error so just return here.
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
            context: getterContext,
          }).then((response) => {
            return res.status(200).send(
              JSON.stringify(response)
            );
          }).catch((error) => {
            if (typeof error === 'string') {
              const sanitized_error = error?.replace('[runGetter] ', '')?.replace('[runGetter.handleRunGetter] ', '');
              return res.status(500).send(
                JSON.stringify({
                  errors: [formatAPIError(new Error(sanitized_error))],
                })
              );
            }

            if (typeof error === 'object' && !Array.isArray(error)) {
              return res.status((error?.errors && error?.errors[0]?.status) || 400).send(
                JSON.stringify(error)
              );
            }
          });
        }
      );
    }
  }
};
