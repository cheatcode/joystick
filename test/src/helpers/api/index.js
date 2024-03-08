import fetch from 'node-fetch';
import get from "./get.js";
import set from "./set.js";

const api = {
  get: (getter_name = '', getter_options = {}) => {
    global.window = {};

    window.fetch = fetch;
    window.location = {
      origin: `http://localhost:${process.env.PORT}`,
    };

    return get(getter_name, getter_options);
  },
  set: (setter_name = '', setter_options = {}) => {
    global.window = {};

    window.fetch = fetch;
    window.location = {
      origin: `http://localhost:${process.env.PORT}`,
    };

    return set(setter_name, setter_options);
  },
};

export default api;

