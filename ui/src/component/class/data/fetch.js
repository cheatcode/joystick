import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isFunction } from "../../../lib/types";

export default async (api = {}, req = {}, input = {}, componentInstance = {}) => {
  try {
    if (componentInstance?.options?.data && isFunction(componentInstance.options.data)) {
      const data = await componentInstance.options.data(api, req, input);
      return Promise.resolve(data);
    }

    return Promise.resolve();
  } catch (exception) {
    throwFrameworkError('component.data.fetch', exception);
  }
}