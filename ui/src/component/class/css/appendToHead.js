import compileCSS from "./compile";
import prefixCSS from "./prefix";
import throwFrameworkError from "../../../lib/throwFrameworkError";

export default (componentInstance = {}) => {
  try {
    const hasSSRStyles = document.head.querySelector(`style[js-ssr]`);

    if (hasSSRStyles) {
      // NOTE: SSR'd CSS has complete tree in one tag. No need to add individual
      // styles back onto page.
      return;
    }

    const css = componentInstance?.options?.css;
    const compiledCSS = compileCSS(css, componentInstance);
    const cssHash = btoa(`${compiledCSS.trim()}`).substring(0, 8);
    const existingStyleTag = document.head.querySelector(`style[js-c="${componentInstance.id}"]`);

    if (!existingStyleTag) {
      const style = document.createElement("style");

      style.setAttribute("js-c", componentInstance?.id);
      style.setAttribute("js-css", cssHash);

      style.innerHTML = prefixCSS(compiledCSS, componentInstance?.id);

      document.head.appendChild(style);
    }

    if (existingStyleTag && cssHash !== existingStyleTag.getAttribute('js-css')) {
      existingStyleTag.innerHTML = prefixCSS(compiledCSS, componentInstance?.id);
    }
  } catch (exception) {
    throwFrameworkError('component.css.appendToHead', exception);
  }
};