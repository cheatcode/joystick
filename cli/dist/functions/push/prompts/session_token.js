import chalk from "chalk";
var session_token_default = () => [{
  name: "session_token",
  type: "text",
  prefix: "",
  message: `
${chalk.yellowBright(">")} To login to Push, paste your session token below:
`,
  suffix: `  ${chalk.yellowBright("Find your session token here:")} https://push.cheatcode.co/account/profile

`
}];
export {
  session_token_default as default
};
