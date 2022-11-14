import css from "css";
const mapSelectors = (componentId = "", selectors = []) => {
  let currentSelector = selectors.length || 0;
  const processedSelectors = new Array(selectors.length);
  while (currentSelector--) {
    const selector = selectors[currentSelector];
    processedSelectors[currentSelector] = `[js-c="${componentId}"] ${selector}`;
  }
  return processedSelectors;
};
const mapRules = (componentId = "", rules = []) => {
  let currentRule = rules.length || 0;
  const processedRules = new Array(rules.length);
  while (currentRule--) {
    const rule = rules[currentRule];
    if (rule.type === "rule") {
      processedRules[currentRule] = {
        ...rule,
        selectors: mapSelectors(componentId, rule.selectors)
      };
    }
    if (rule.type === "media") {
      processedRules[currentRule] = {
        ...rule,
        rules: mapRules(componentId, rule.rules)
      };
    }
  }
  return processedRules;
};
const buildPrefixedAST = (componentId = "", cssString = "") => {
  const ast = css.parse(cssString);
  if (ast && ast.stylesheet && ast.stylesheet.rules) {
    return {
      ...ast,
      stylesheet: {
        ...ast.stylesheet,
        rules: mapRules(componentId, ast.stylesheet.rules)
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
    let processed = tree?.children?.length || 0;
    while (processed--) {
      getCSSFromTree(tree.children[processed], css2);
    }
  }
  return css2;
};
var getCSSFromTree_default = getCSSFromTree;
export {
  getCSSFromTree_default as default
};
