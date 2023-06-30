import compileCSS from "./compileCSS";
const handlePrefixCSS = (componentId, cssString) => {
  const commentRegex = new RegExp(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g);
  const selectorRegex = new RegExp(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g);
  return (cssString || "").replace(commentRegex, (match) => {
    return "";
  }).replace(selectorRegex, (match) => {
    if (["@", ": "].some((skip) => match?.includes(skip))) {
      return match;
    }
    return `[js-c="${componentId}"] ${match.trim()}`;
  })?.trim();
};
const getCSSFromTree = (tree = {}, css = []) => {
  if (tree.instance && tree.instance.options && tree.instance.options.css) {
    const componentId = tree.instance.id;
    const rawCSS = tree.instance.options.css;
    const compiledCSS = compileCSS(rawCSS, tree.instance);
    const prefixedCSS = handlePrefixCSS(componentId, compiledCSS);
    css.push(prefixedCSS);
  }
  if (tree.children && tree.children.length > 0) {
    let processed = tree?.children?.length || 0;
    while (processed--) {
      getCSSFromTree(tree.children[processed], css);
    }
  }
  return css;
};
var getCSSFromTree_default = getCSSFromTree;
export {
  getCSSFromTree_default as default
};
