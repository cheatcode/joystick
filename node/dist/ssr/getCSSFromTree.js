import css from "css";
const buildPrefixedAST = (componentId = "", cssString = "") => {
  const ast = css.parse(cssString);
  if (ast && ast.stylesheet && ast.stylesheet.rules) {
    return {
      ...ast,
      stylesheet: {
        ...ast.stylesheet,
        rules: ast.stylesheet.rules.map((rule) => {
          if (rule.type === "rule") {
            return {
              ...rule,
              selectors: rule.selectors.map((selector) => {
                return `[js-c="${componentId}"] ${selector}`;
              })
            };
          }
          if (rule.type === "media") {
            return {
              ...rule,
              rules: rule.rules.map((mediaRule) => {
                return {
                  ...mediaRule,
                  selectors: mediaRule.selectors.map((selector) => {
                    return `[js-c="${componentId}"] ${selector}`;
                  })
                };
              })
            };
          }
        })
      }
    };
  }
  return {};
};
const handlePrefixCSS = (componentId, cssString) => {
  const prefixedAST = buildPrefixedAST(componentId, cssString);
  return css.stringify(prefixedAST);
};
const getCSSFromTree = (tree = {}, css2 = []) => {
  if (tree.instance && tree.instance.options && tree.instance.options.css) {
    const componentId = tree.instance.id;
    const rawCSS = tree.instance.options.css;
    const prefixedCSS = handlePrefixCSS(componentId, rawCSS);
    css2.push(prefixedCSS);
  }
  if (tree.children && tree.children.length > 0) {
    tree.children.forEach((childTree) => {
      getCSSFromTree(childTree, css2);
    });
  }
  return css2;
};
var getCSSFromTree_default = getCSSFromTree;
export {
  getCSSFromTree_default as default
};
