import fs from "fs";
import generateId from "./generateId.js";

export default (file = "") => {
  const componentMapPath = `./.joystick/build/componentMap.json`;
  const componentMapExists = fs.existsSync(componentMapPath);
  const componentMap = componentMapExists
    ? JSON.parse(fs.readFileSync(componentMapPath, "utf-8"))
    : null;

  const parts = file?.match(/\/\/ ui+.*/g);

  const components = (parts || [])?.map((path, pathIndex) => {
    const nextPath = parts[pathIndex + 1];
    return {
      path: path.replace("// ", ""),
      source: file.substring(
        file.indexOf(path),
        nextPath ? file.indexOf(nextPath) : file.length
      ),
    };
  });

  for (let i = 0; i < components.length; i += 1) {
    const component = components[i];
    const componentId =
      (componentMap && componentMap[component.path]) || generateId();

    if (componentMap) {
      componentMap[component.path] = componentId;
    }

    const tainted = component.source.replace(
      /\.component\(\{+(?!\n + _componentId)/g,
      () => {
        return `.component({\n  _componentId: '${componentId}',`;
      }
    );

    file = file.replace(component.source, tainted);
  }

  if (componentMap) {
    fs.writeFileSync(
      "./.joystick/build/componentMap.json",
      JSON.stringify(componentMap)
    );
  }

  return file;
};
