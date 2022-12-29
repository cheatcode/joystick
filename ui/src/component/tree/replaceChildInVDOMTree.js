import { isObject } from "../../lib/types";

const replaceChildInVDOMTree = (tree = {}, childInstanceId = '', replacementVDOM = {}) => {
  for (let i = 0; i < tree?.children?.length; i += 1) {
    const child = tree?.children[i];

    if (isObject(child) && child.attributes && child.attributes['js-i'] && child.attributes['js-i'] === childInstanceId) {
      tree.children[i] = replacementVDOM;
      break;
    }

    if (isObject(child)) {
      replaceChildInVDOMTree(child, childInstanceId, replacementVDOM);
    }
  }
};

export default replaceChildInVDOMTree;
