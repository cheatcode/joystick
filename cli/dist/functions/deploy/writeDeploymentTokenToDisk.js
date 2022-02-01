import fs from "fs";
var writeDeploymentTokenToDisk_default = (deploymentToken = "") => {
  const authFilePath = `.deploy/token.json`;
  const gitIgnoreExists = fs.existsSync(".gitignore");
  let gitIgnore = "";
  if (!fs.existsSync(authFilePath)) {
    fs.mkdirSync(".deploy", { recursive: true });
  }
  fs.writeFileSync(`.deploy/token.json`, JSON.stringify({ deploymentToken }, null, 2));
  if (gitIgnoreExists) {
    gitIgnore = fs.readFileSync(".gitignore", "utf-8");
  }
  if (!gitIgnore.includes(".deploy")) {
    fs.writeFileSync(".gitignore", `${gitIgnore}
.deploy`);
  }
};
export {
  writeDeploymentTokenToDisk_default as default
};
