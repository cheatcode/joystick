import fs from "fs";
import path, { dirname } from 'path';
import * as acorn from "acorn";
import path_exists from '../../path_exists.js';

const { readFile, writeFile } = fs.promises;

const get_requires = (from_path = '', map = {}) => {
  const requires = map?.body?.filter((statement) => {
    const type = statement && statement.type;
    const declarations = (statement && statement.declarations) || [];

    const is_variable_declaration = type === "VariableDeclaration";

    const has_require_statement = declarations.some((declaration) => {
      const is_variable_declarator = declaration.type === "VariableDeclarator";
      const callee_name = declaration?.init?.callee?.name;
      return is_variable_declarator && callee_name === "require";
    });

    return is_variable_declaration && has_require_statement;
  });

  return requires.map((require_declaration) => {
    const declarations = require_declaration.declarations;
    const declaration = declarations && declarations[0];
    const declaration_value = declaration?.init?.arguments[0] && declaration.init.arguments[0]?.value;

    return {
      absolute_path: declaration_value ? path.resolve(dirname(from_path), declaration_value) : null,
    };
  });
};

const get_imports = (from_path = '', map = {}) => {
  const imports = map?.body?.filter(({ type }) => {
    return type === "ImportDeclaration";
  }) || [];

  return imports.map((import_declaration) => {
    return {
      path: import_declaration?.source?.value,
      absolute_path: path.resolve(dirname(from_path), import_declaration?.source?.value),
    };
  });
};

const get_imports_and_requires = (from_path = '', map = {}) => {
  const imports = get_imports(from_path, map);
  const requires = get_requires(from_path, map);

  return {
    imports,
    requires,
  };
};

const parse_file_to_ast = (file = "") => {
  return acorn.parse(file, {
    ecmaVersion: "latest",
    sourceType: "module",
  });
};

const read_file_dependency_map = async () => {
  const file_dependency_map_path = `.joystick/build/file_map.json`;

  if (await path_exists(file_dependency_map_path)) {
    const file_dependency_map_as_json = fs.readFileSync(
      file_dependency_map_path,
      "utf-8"
    );

    return file_dependency_map_as_json ? JSON.parse(file_dependency_map_as_json) : {};
  }

  return {};
};

const update_file_map = async (from_path = "", source = "") => {
  try {
    const file_dependency_map = await read_file_dependency_map();
    const file_ast = parse_file_to_ast(source);
    const imports = file_ast ? get_imports_and_requires(from_path, file_ast) : [];

    file_dependency_map[from_path] = imports;

    fs.writeFileSync(
      `.joystick/build/file_map.json`,
      JSON.stringify(file_dependency_map, null, 2)
    );
  } catch {
    // Do nothing. This exists to handle acorn parsing errors that are also picked
    // up by the esbuild parser (we want to defer to esbuild).
  }
};

export default update_file_map;
