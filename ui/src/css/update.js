import throwFrameworkError from "../lib/throwFrameworkError";
import getCSSFromTree from "./getCSSFromTree";

export default () => {
  try {
    const existingStyleTag = document.head.querySelector(`style[js-styles]`);
    const cssFromTree = getCSSFromTree(window.joystick?._internal?.tree);
    const css = cssFromTree.reverse().join("").trim();

    if (existingStyleTag?.innerText === css) {
      // NOTE: No changes, do not update CSS in DOM.
      return;
    }

    if (existingStyleTag) {
      existingStyleTag.innerHTML = css;
    }

    if (!existingStyleTag) {
      const style = document.createElement("style");
      style.setAttribute("js-styles", "");
      style.innerHTML = css;
      document.head.appendChild(style);
    }
  } catch (exception) {
    throwFrameworkError("css.update", exception);
  }
};
