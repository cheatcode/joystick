import joystick from "../index";
import mount from "../component/mount";
import removeEventListeners from "../component/removeEventListeners";

const cleanupCSS = () => {
  const ssrStyles = document.querySelector("style[js-css-ssr]");
  const existingStyles = document.querySelectorAll("style[js-css]");

  if (ssrStyles) {
    ssrStyles.parentNode.removeChild(ssrStyles);
  }

  if (existingStyles) {
    [].forEach.call(existingStyles, (existingStyle) => {
      existingStyle.parentNode.removeChild(existingStyle);
    });
  }
};

export default (Component, props = {}, target) => {
  const component = Component(props);

  joystick._internal.tree = {
    id: component.id,
    instance: component,
    children: [],
  };

  // NOTE: Due to layout components importing the rendered page dynamically,
  // we need to identify the mounted joystick instance so we can properly
  // queue up events and lifecycle methods for child components. This does
  // not effect pages rendered without a layout because the page is already
  // compiled into the source, not imported dynamically.
  joystick.mountedInstance = true;

  if (typeof window !== "undefined") {
    window.__joystick__ = joystick;
    window.__joystick__.utils = {
      removeEventListeners,
    };
  }

  component.handleSetProps(props);
  component.handleOnBeforeMount();

  cleanupCSS();

  // NOTE: When mounting: true, component.render() will return the
  // actual DOM nodes to render (as opposed to an object).
  const dom = component.render({ mounting: true });
  joystick._internal.lifecycle.onBeforeMount.process();
  mount(dom, target);

  component.handleAttachCSS();
  component.handleAttachEvents();

  // NOTE: Run initial events queue on mount here because we do not
  // run it in the component.render() method if we pass mounting: true.
  joystick._internal.eventListeners.queue.process();

  component.handleOnMount();
  joystick._internal.lifecycle.onMount.process();

  return component;
};
