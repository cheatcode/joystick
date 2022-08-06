import { parseHTML } from 'linkedom';

const flattenAndReplaceWhenElements = (dom = {}) => {
  try {
    if (dom?.childNodes?.length > 0) {
      [].forEach.call(dom.childNodes, (childNode) => {
        flattenAndReplaceWhenElements(childNode);

        if (childNode?.tagName === 'WHEN' && childNode?.childNodes?.length === 0) {
          childNode.replaceWith(document.createTextNode(''));
        }

        if (childNode?.tagName === 'WHEN' && childNode?.childNodes?.length > 0) {
          childNode.replaceWith(...childNode.childNodes);
        }
      }); 
    }
    
    return dom;
  } catch (exception) {
    throw new Error(`[ssr.replaceWhenTags.flattenAndReplaceWhenElements] ${exception.message}`);
  }
};

export default (html = '') => {
  try {
    const { document } = parseHTML(html);
    const dom = flattenAndReplaceWhenElements(document);
    return dom.toString();
  } catch (exception) {
    throw new Error(`[ssr.replaceWhenTags] ${exception.message}`);
  }
};