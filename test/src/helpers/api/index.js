import fetch from 'node-fetch';
import get from "./get.js";
import set from "./set.js";
import get_test_port from '../../lib/get_test_port.js';

const api = {
  get: (getter_name = '', getter_options = {}) => {
    global.window = {};

    window.fetch = fetch;
    window.location = {
      origin: `http://localhost:${get_test_port()}`,
    };

    return get(getter_name, getter_options);
  },
  set: (setter_name = '', setter_options = {}) => {
    global.window = {};

    window.fetch = fetch;
    window.location = {
      origin: `http://localhost:${get_test_port()}`,
    };

    return set(setter_name, setter_options);
  },
};

export default api;
