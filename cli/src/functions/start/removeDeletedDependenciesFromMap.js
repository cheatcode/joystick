import fs from 'fs';
import readFileDependencyMap from "./readFileDependencyMap.js";

export default (deletedDependencies = []) => {
  const fileDependencyMap = readFileDependencyMap();

  deletedDependencies.forEach((dependency) => {
    const match = Object.keys(fileDependencyMap).find((key) => key.includes(dependency));

    if (match) {
      delete fileDependencyMap[match];
    }
  });

  fs.writeFileSync(
    `.joystick/build/fileMap.json`,
    JSON.stringify(fileDependencyMap, null, 2)
  );
};