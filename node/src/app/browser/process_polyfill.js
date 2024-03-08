import process from "process/browser";

window.process = process;

const env = {
  NODE_ENV: "${NODE_ENV}",
};

if (window.process) {
  window.process.env = env;
}
