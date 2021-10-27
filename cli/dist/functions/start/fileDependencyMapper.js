import updateFileMap from "./updateFileMap.js";
var fileDependencyMapper_default = () => {
  return {
    transform(code, id) {
      const canAddToMap = ![
        "node_modules",
        ".joystick",
        "?",
        "commonjsHelpers.js"
      ].some((excludedPath) => {
        return id.includes(excludedPath);
      });
      if (canAddToMap) {
        updateFileMap(id, code);
      }
      return null;
    }
  };
};
export {
  fileDependencyMapper_default as default
};
