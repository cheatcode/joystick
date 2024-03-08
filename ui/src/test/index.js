import create_file from "./create_file.js";
import track_function_call from "./track_function_call.js";

const test = {
  utils: {
    createFile: create_file,
    create_file,
    trackFunctionCall: track_function_call,
    track_function_call,
  },
};

export default test;
