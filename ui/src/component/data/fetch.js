import types from "../../lib/types.js";

const fetch = async (api = {}, req = {}, input = {}, component_instance = {}) => {
  if (component_instance?.options?.data && types.is_function(component_instance.options.data)) {
    const data = await component_instance.options.data(api, req, input, component_instance);
    return Promise.resolve(data);
  }

  return Promise.resolve();
};

export default fetch;
