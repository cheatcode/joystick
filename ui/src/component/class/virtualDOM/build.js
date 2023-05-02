import throwFrameworkError from "../../../lib/throwFrameworkError";
import buildTree from "./buildTree";

const convertHTMLToDOM = (html = '') => {
  try {
    const dom = document.createElement("div");
    dom.innerHTML = html;
    return dom?.childNodes[0];
  } catch (exception) {
    throwFrameworkError('component.virtualDOM.build.convertHTMLToDOM', exception);
  }
};

export default (html = '') => {
  try {
    const dom = convertHTMLToDOM(html);
    return buildTree(dom);
  } catch (exception) {
    throwFrameworkError('component.virtualDOM.build', exception);
  }
};
