const handlePrefixCSS = (componentId, cssString) => {
  const regex = new RegExp(/^(?!@).+({|,)/gim);
  return (cssString || "").replace(regex, (match) => {
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
    const prefixedCSS = handlePrefixCSS(componentId, rawCSS);
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
