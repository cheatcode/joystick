import get from "./get.js";
import set from "./set.js";

const api = {
  fetch: typeof window !== 'undefined' ? window.fetch.bind(window) : null,
  get,
  set,
};

export default api;
