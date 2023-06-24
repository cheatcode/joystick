import fs from "fs";
import generateId from "./generateId.js";
var setComponentId_default = (file = "") => {
  const componentMapPath = process.env.NODE_ENV === "development" ? `./.joystick/build/componentMap.json` : `./.build/componentMap.json`;
  const componentMapExists = fs.existsSync(componentMapPath);
  const componentMap = componentMapExists ? JSON.parse(fs.readFileSync(componentMapPath, "utf-8")) : {};
  const parts = [...file?.matchAll(/\/\/ ui+.*/gi)]?.map((match) => {
    return {
      path: match[0],
      index: match.index
    };
  });
  const components = (parts || [])?.map((part, partIndex) => {
    const nextPart = parts[partIndex + 1];
    return {
      path: part.path.replace("// ", ""),
      index: part.index,
      source: file.substring(
        part.index,
        nextPart ? nextPart.index : file.length
      )
    };
  });
  for (let i = 0; i < components.length; i += 1) {
    const component = components[i];
    const componentId = componentMap && componentMap[component.path] || generateId();
    if (componentMap) {
      componentMap[component.path] = componentId;
    }
    const tainted = component.source.replace(
      /\.component\(\{+(?!\n + _componentId)/g,
      () => {
        return `.component({
  _componentId: '${componentId}',`;
      }
    );
    file = file.replace(component.source, tainted);
  }
  if (componentMap) {
    fs.writeFileSync(componentMapPath, JSON.stringify(componentMap));
  }
  return file;
};
export {
  setComponentId_default as default
};
