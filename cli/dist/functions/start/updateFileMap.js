import fs from "fs";
import * as acorn from "acorn";
const getImportsAndRequires = (map = {}) => {
  const { body } = map;
  const imports = body && body.filter(({ type }) => {
    return type === "ImportDeclaration";
  });
  const requires = body && body.filter((statement) => {
    const type = statement && statement.type;
    const declarations = statement && statement.declarations || [];
    const isVariableDeclaration = type === "VariableDeclaration";
    const hasRequireStatement = declarations.some((declaration) => {
      const isVariableDeclarator = declaration.type === "VariableDeclarator";
      const calleeName = declaration && declaration.init && declaration.init.callee && declaration.init.callee.name;
      return isVariableDeclarator && calleeName === "require";
    });
    return isVariableDeclaration && hasRequireStatement;
  });
  return {
    imports: imports.map((importDeclaration) => {
      return {
        path: importDeclaration && importDeclaration.source && importDeclaration.source.value
      };
    }),
    requires: requires.map((requireDeclaration) => {
      const declarations = requireDeclaration.declarations;
      const declaration = declarations && declarations[0];
      return {
        path: declaration && declaration.init && declaration.init.arguments && declaration.init.arguments[0] && declaration.init.arguments[0].value
      };
    })
  };
};
const parseFileToAST = (source = "") => {
  return acorn.parse(source, {
    ecmaVersion: "latest",
    sourceType: "module"
  });
};
const readFileDependencyMap = () => {
  const fileDependencyMapPath = `.joystick/build/fileMap.json`;
  if (fs.existsSync(fileDependencyMapPath)) {
    const fileDependencyMapAsJSON = fs.readFileSync(fileDependencyMapPath, "utf-8");
    const fileMap = fileDependencyMapAsJSON ? JSON.parse(fileDependencyMapAsJSON) : {};
    return fileMap;
  }
  return {};
};
var updateFileMap_default = (path = "", source = "") => {
  const fileDependencyMap = readFileDependencyMap();
  const fileAST = parseFileToAST(source);
  const imports = getImportsAndRequires(fileAST);
  fileDependencyMap[path] = imports;
  fs.writeFileSync(`.joystick/build/fileMap.json`, JSON.stringify(fileDependencyMap, null, 2));
};
export {
  updateFileMap_default as default
};
