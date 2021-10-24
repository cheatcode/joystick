import quoteGetters from "./quotes/getters";
import quoteSetters from "./quotes/setters";

export default {
  getters: {
    ...quoteGetters,
  },
  setters: {
    ...quoteSetters,
  },
};
