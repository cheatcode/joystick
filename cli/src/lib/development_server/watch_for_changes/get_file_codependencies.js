import read_file_dependency_map from "./read_file_dependency_map.js";
import path_exists from '../../path_exists.js';
import get_platform_safe_path from '../../get_platform_safe_path.js';

const find_codependencies_in_map = (path_to_find = '', map = {}) => {
  // TODO: I don't care about path variations anymore because I have the absolute paths
  // of the child dependencies in the map. Basically I just need to ask, can I find an absolute
  // path that matches the current path being rebuilt? If I do, give me the codependent_path name
  // as that is a codependency of the file being rebuilt.
  console.log({
    path_to_find,
  });
  
  const matching_codependents = Object.entries(map)
    .filter(([_codependent_path, codependent_dependencies]) => {
      const has_matching_imports =
        codependent_dependencies &&
        codependent_dependencies.imports &&
        codependent_dependencies.imports.some((codependent_dependency) => {
          return codependent_dependency.absolute_path.includes(path_to_find);
        });

      const has_matching_requires =
        codependent_dependencies &&
        codependent_dependencies.requires &&
        codependent_dependencies.requires.some((codependent_dependency) => {
          return codependent_dependency.absolute_path.includes(path_to_find);
        });

      return has_matching_imports || has_matching_requires;
    });

  console.log(matching_codependents);

  return matching_codependents.map(([matching_codependent_path]) => {
      return matching_codependent_path.replace(
        get_platform_safe_path(`${process.cwd()}/`),
        ""
      );
    });
};

const get_file_codependencies = async (path_to_find = "") => {
  const file_dependency_map = await read_file_dependency_map();
  const codpendencies = find_codependencies_in_map(
    path_to_find,
    file_dependency_map
  );

  return Promise.all(codpendencies.filter((codependency) => {
    return path_exists(codependency);
  }));
};

export default get_file_codependencies;
