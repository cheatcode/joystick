import fs from "fs";

const findCodependenciesInMap = (pathVariations = [], map = {}) => {
  return Object.entries(map)
    .filter(([codependentPath, codependentDependencies]) => {
      const hasMatchingImports =
        codependentDependencies &&
        codependentDependencies.imports &&
        codependentDependencies.imports.some((codependentDependency) => {
          return pathVariations.some((pathVariation) => {
            return codependentDependency.path.includes(pathVariation);
          });
        });

      const hasMatchingRequires =
        codependentDependencies &&
        codependentDependencies.requires &&
        codependentDependencies.requires.some((codependentDependency) => {
          return pathVariations.some((pathVariation) => {
            return codependentDependency.path.includes(pathVariation);
          });
        });

      return hasMatchingImports || hasMatchingRequires;
    })
    .map(([matchingCodependentPath]) => {
      return matchingCodependentPath.replace(`${process.cwd()}/`, "");
    });
};

const readFileDependencyMap = () => {
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

const getPathVariations = (path = "") => {
  const pathParts = path.split("/");
  const variations = [];

  variations.push(`/${pathPart}`);

  pathParts.forEach((pathPart, pathPartIndex) => {
    let base = `${pathPart}`;

    pathParts.slice(pathPartIndex + 1, pathParts.length).forEach((part) => {
      base = base += `/${part}`;
      variations.push(base);
      if (part.includes(".")) {
        variations.push(base.split(".")[0]);
      }
    });
  });

  variations.push(`./${pathParts[0]}`);
  variations.push(`./${pathParts[0]}/index`);
  variations.push(`./${pathParts[0]}/index.js`);

  // TODO: This may wreak havoc eventually, but going to let it slide
  // for now.
  variations.push(`/index`);
  variations.push(`/index.js`);

  return variations;
};

export default (pathToFind = "") => {
  const pathVariations = getPathVariations(pathToFind);
  const fileDependencyMap = readFileDependencyMap();

  const codpendencies = findCodependenciesInMap(
    pathVariations,
    fileDependencyMap
  );

  return codpendencies;
};
