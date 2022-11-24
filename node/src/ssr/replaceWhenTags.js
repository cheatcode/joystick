import { parseHTML } from 'linkedom';

const flattenAndReplaceWhenElements = (dom = {}, options = {}) => {
  try {
    if (dom?.childNodes?.length > 0) {
      let processed = dom.childNodes.length || 0;

      while(processed--) {
        const childNode = dom.childNodes[processed];
        flattenAndReplaceWhenElements(childNode, {
          rootDocument: options?.rootDocument || dom,
          isChildNode: true
        });

        if (childNode?.tagName === 'WHEN' && childNode?.childNodes?.length === 0) {
          // NOTE: Necessary because we call flatterAndReplaceWhenElements recursively
          // and the dom argument might be the child node, not the document.
          const rootDocument = options?.rootDocument || dom;
          childNode.replaceWith(rootDocument.createTextNode(''));
        }

        if (childNode?.tagName === 'WHEN' && childNode?.childNodes?.length > 0) {
          childNode.replaceWith(...childNode.childNodes);
        }
      }
    }
    
    return dom;
  } catch (exception) {
    throw new Error(`[ssr.replaceWhenTags.flattenAndReplaceWhenElements] ${exception.message}`);
  }
};

export default (html = '') => {
  try {
    const { document: parseHTMLDocument } = parseHTML(html);
    const dom = flattenAndReplaceWhenElements(parseHTMLDocument);
    return dom.toString();
  } catch (exception) {
    throw new Error(`[ssr.replaceWhenTags] ${exception.message}`);
  }
};