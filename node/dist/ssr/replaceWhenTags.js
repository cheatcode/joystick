import { parseHTML } from "linkedom";
const flattenAndReplaceWhenElements = (dom = {}, options = {}) => {
  try {
    if (dom?.childNodes?.length > 0) {
      let processed = dom.childNodes.length || 0;
      while (processed--) {
        const childNode = dom.childNodes[processed];
        flattenAndReplaceWhenElements(childNode, {
          rootDocument: options?.rootDocument || dom,
          isChildNode: true
        });
        if (childNode?.tagName === "WHEN" && childNode?.childNodes?.length === 0) {
          const rootDocument = options?.rootDocument || dom;
          childNode.replaceWith(rootDocument.createTextNode(""));
        }
        if (childNode?.tagName === "WHEN" && childNode?.childNodes?.length > 0) {
          childNode.replaceWith(...childNode.childNodes);
        }
      }
    }
    return dom;
  } catch (exception) {
    throw new Error(`[ssr.replaceWhenTags.flattenAndReplaceWhenElements] ${exception.message}`);
  }
};
var replaceWhenTags_default = (html = "") => {
  try {
    const whenRegex = new RegExp("<when>|</when>", "g");
    return html?.replace(whenRegex, "");
  } catch (exception) {
    throw new Error(`[ssr.replaceWhenTags] ${exception.message}`);
  }
};
export {
  replaceWhenTags_default as default
};
