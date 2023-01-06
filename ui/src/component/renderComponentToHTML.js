import windowIsUndefined from "../lib/windowIsUndefined";

export default (Component = {}, props = {}) => {
  const instance = Component({ props });
  const html = instance.renderToHTML();

  if (!windowIsUndefined()) {
    instance.appendCSSToHead();
  }

  return html?.wrapped;
};