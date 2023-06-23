import throwFrameworkError from "../../../lib/throwFrameworkError";
import getCSSFromTree from "./getCSSFromTree";

export default () => {
  try {
    const existingStyleTag = document.head.querySelector(`style[js-styles]`);
    const cssFromTree = getCSSFromTree(window.joystick?._internal?.tree);
    const css = cssFromTree.reverse().join("").trim();
    const cssHash = btoa(`${css.trim()}`).substring(0, 8);

    if (existingStyleTag) {
      existingStyleTag.setAttribute("js-css", cssHash);
      existingStyleTag.innerHTML = css;
    }

    if (!existingStyleTag) {
      const style = document.createElement("style");
      style.setAttribute("js-styles", "");
      style.setAttribute("js-css", cssHash);
      style.innerHTML = css;
      document.head.appendChild(style);
    }
  } catch (exception) {
    throwFrameworkError("component.css.appendToHead", exception);
  }
};
