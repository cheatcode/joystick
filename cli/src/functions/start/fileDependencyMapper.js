import updateFileMap from "./updateFileMap";

export default () => {
  return {
    transform(code, id) {
      const canAddToMap = ![
        "node_modules",
        ".joystick",
        "?",
        "commonjsHelpers.js",
      ].some((excludedPath) => {
        return id.includes(excludedPath);
      });

      if (canAddToMap) {
        // NOTE: Run this is in the transform build hook because it gives us access
        // to both the path and the source for the file being built.
        updateFileMap(id, code);
      }

      return null;
    },
  };
};
