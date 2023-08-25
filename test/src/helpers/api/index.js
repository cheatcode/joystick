import fetch from 'node-fetch';
import get from "./get.js";
import set from "./set.js";

export default {
  get: (getterName = '', getterOptions = {}) => {
    global.window = {};

    window.fetch = fetch;
    window.location = {
      origin: `http://localhost:${process.env.PORT}`,
    };

    return get(getterName, getterOptions);
  },
  set: (setterName = '', setterOptions = {}) => {
    global.window = {};

    window.fetch = fetch;
    window.location = {
      origin: `http://localhost:${process.env.PORT}`,
    };

    return set(setterName, setterOptions);
  },
};
