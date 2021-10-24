import quotes from "../../lib/quotes";

export default {
  quotes: {
    get: () => {
      return quotes;
    },
  },
};
