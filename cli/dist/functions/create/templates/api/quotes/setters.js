export default {
  createQuote: {
    input: {
      text: {
        type: "string",
        required: true,
      },
      attribution: {
        type: "string",
        required: true,
      },
    },
    set: (input) => {
      console.log("Add this quote to the database...");
      console.log(input);
    },
  },
};
