import throwFrameworkError from "../../../lib/throwFrameworkError";
import { isFunction } from "../../../lib/types";

export default async (api = {}, req = {}, input = {}, componentInstance = {}) => {
  try {
    if (componentInstance?.data && isFunction(componentInstance.data)) {
      const data = await componentInstance.data(api, req, input);
      return data;
    }

    return Promise.resolve();
  } catch (exception) {
    throwFrameworkError('component.data.fetch', exception);
  }
}