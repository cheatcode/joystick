import fs from "fs";
import readFileDependencyMap from "./readFileDependencyMap.js";
const findCodependenciesInMap = (pathVariations = [], map = {}) => {
  return Object.entries(map).filter(([codependentPath, codependentDependencies]) => {
    const hasMatchingImports = codependentDependencies && codependentDependencies.imports && codependentDependencies.imports.some((codependentDependency) => {
      return pathVariations.some((pathVariation) => {
        return codependentDependency.path.includes(pathVariation);
      });
    });
    const hasMatchingRequires = codependentDependencies && codependentDependencies.requires && codependentDependencies.requires.some((codependentDependency) => {
      return pathVariations.some((pathVariation) => {
        return codependentDependency.path.includes(pathVariation);
      });
    });
    return hasMatchingImports || hasMatchingRequires;
  }).map(([matchingCodependentPath]) => {
    return matchingCodependentPath.replace(`${process.cwd()}/`, "");
  });
};
const getPathVariations = (path = "") => {
  const pathParts = path.split("/");
  const variations = [];
  const lastPathPart = pathParts && pathParts[pathParts.length - 1];
  pathParts.forEach((pathPart, pathPartIndex) => {
    let base = `${pathPart}`;
    variations.push(`/${pathPart}`);
    pathParts.slice(pathPartIndex + 1, pathParts.length).forEach((part) => {
      base = base += `/${part}`;
      variations.push(base);
      if (part.includes(".")) {
        variations.push(base.split(".")[0]);
      }
    });
  });
  if (lastPathPart?.includes(".")) {
    variations.push(`./${lastPathPart}`);
    variations.push(`./${lastPathPart?.split(".")[0]}`);
  }
  variations.push(`./${pathParts[0]}`);
  variations.push(`./${pathParts[0]}/index`);
  variations.push(`./${pathParts[0]}/index.js`);
  variations.push(`/index`);
  variations.push(`/index.js`);
  return variations;
};
var getCodependenciesForFile_default = (pathToFind = "") => {
  const pathVariations = getPathVariations(pathToFind);
  const fileDependencyMap = readFileDependencyMap();
  const codpendencies = findCodependenciesInMap(
    pathVariations,
    fileDependencyMap
  );
  return {
    existing: codpendencies.filter((codependency) => {
      return !!fs.existsSync(codependency);
    }),
    deleted: codpendencies.filter((codependency) => {
      return !fs.existsSync(codependency);
    })
  };
};
export {
  getCodependenciesForFile_default as default
};
