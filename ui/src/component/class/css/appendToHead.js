import compileCSS from "./compile";
import prefixCSS from "./prefix";
import throwFrameworkError from "../../../lib/throwFrameworkError";

export default (componentInstance = {}) => {
  try {
    const css = componentInstance?.options?.css;
    const compiledCSS = compileCSS(componentInstance, css);
    const cssHash = btoa(`${compiledCSS.trim()}`).substring(0, 8);
    const existingStyleTag = document.head.querySelector(`style[js-c="${componentInstance.id}"]`);
    const existingStyleForHash = document.head.querySelector(`[js-css="${cssHash}"]`);
    const componentStylesAreChanging = existingStyleTag && !existingStyleForHash;

    if (componentStylesAreChanging) {
      document.head.removeChild(existingStyleTag);
    }

    if (!existingStyleTag || !existingStyleForHash) {
      const style = document.createElement("style");

      style.innerHTML = prefixCSS(css, componentInstance?.id);
      style.setAttribute("js-c", componentInstance?.id);
      style.setAttribute("js-c-parent", componentInstance?.parent?.id);
      style.setAttribute("js-css", cssHash);

      document.head.appendChild(style);
    }
  } catch (exception) {
    throwFrameworkError('component.css.appendToHead', exception);
  }
};