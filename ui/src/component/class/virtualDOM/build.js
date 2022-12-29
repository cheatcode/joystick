import throwFrameworkError from "../../../lib/throwFrameworkError";
import buildTree from "./buildTree";

const convertHTMLToDOM = (html = '', componentId = '') => {
  try {
    const dom = document.createElement("div");
    dom.setAttribute("js-c", componentId);
    dom.innerHTML = html;
    return dom;
  } catch (exception) {
    throwFrameworkError('component.virtualDOM.build.convertHTMLToDOM', exception);
  }
};

export default (html = '', componentId = '') => {
  try {
    const dom = convertHTMLToDOM(html, componentId);
    return buildTree(dom);
  } catch (exception) {
    throwFrameworkError('component.virtualDOM.build', exception);
  }
};
