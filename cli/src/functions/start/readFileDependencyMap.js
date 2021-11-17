import fs from 'fs';

export default () => {
  const fileDependencyMapPath = `.joystick/build/fileMap.json`;

  if (fs.existsSync(fileDependencyMapPath)) {
    const fileDependencyMapAsJSON = fs.readFileSync(
      fileDependencyMapPath,
      "utf-8"
    );
    const fileMap = fileDependencyMapAsJSON
      ? JSON.parse(fileDependencyMapAsJSON)
      : {};

    return fileMap;
  }

  return {};
};