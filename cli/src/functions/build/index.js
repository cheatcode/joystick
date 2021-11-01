import Loader from "../../lib/loader.js";
import getFilesToBuild from "../start/getFilesToBuild.js";
import buildFiles from "../start/buildFiles.js";

export default () => {
  console.log("");
  const loader = new Loader({ defaultMessage: "Building app..." });
  loader.text("Building app...");

  const filesToBuild = getFilesToBuild();
  
  buildFiles(filesToBuild).then((fileResults) => {
    const hasErrors = [...fileResults]
      .filter((result) => !!result)
      .map(({ success }) => success)
      .includes(false);
    
    loader.pause("App built to .joystick/build!");
    console.log("");
  });
};
