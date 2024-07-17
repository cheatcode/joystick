import read_file_dependency_map from "./read_file_dependency_map.js";
import path_exists from '../../path_exists.js';
import get_platform_safe_path from '../../get_platform_safe_path.js';

const find_codependencies_in_map = (path_to_find = '', map = {}) => {
  const matching_codependents = Object.entries(map)
    .filter(([_codependent_path, codependent_dependencies]) => {
      const has_matching_imports =
        codependent_dependencies &&
        codependent_dependencies.imports &&
        codependent_dependencies.imports.some((codependent_dependency) => {
          // NOTE: If a file is renamed to use lowercase (or vice versa), the dependent file
          // should respect that change, even if the developer forgets to update the import
          // path's casing.

          return codependent_dependency.absolute_path.includes(path_to_find) || codependent_dependency.absolute_path?.toLowerCase()?.includes(path_to_find);
        });
        
        const has_matching_requires =
        codependent_dependencies &&
        codependent_dependencies.requires &&
        codependent_dependencies.requires.some((codependent_dependency) => {
          // NOTE: If a file is renamed to use lowercase (or vice versa), the dependent file
          // should respect that change, even if the developer forgets to update the import
          // path's casing.

          return codependent_dependency.absolute_path.includes(path_to_find) || codependent_dependency.absolute_path?.toLowerCase()?.includes(path_to_find);
        });

      return has_matching_imports || has_matching_requires;
    });

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
