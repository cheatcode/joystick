import joystick from "../index";
import findComponentInTree from "./findComponentInTree";
import findComponentInTreeBySSRId from "./findComponentInTreeBySSRId";

const handleGetJoystickInstance = () => {
  if (typeof window !== "undefined") {
    return joystick && joystick.mountedInstance
      ? joystick
      : window.__joystick__;
  }

  return joystick;
};

const renderFunctionGenerators = {
  component: function () {
    return function componentRenderFunction(Component, props, parent) {
      const joystickInstance = handleGetJoystickInstance();
      const component = Component({
        props,
        // NOTE: To prevent a parent re-render wiping out the state of a child, pass the existingStateMap
        // so the component can check for itself and load any existing state as necessary.
        existingStateMap: !parent.walkingTreeForSSR && parent?.existingStateMap,
        url: parent.url,
        translations: parent.translations,
        api: parent.options.api,
        req: parent.options.req,
        dataFromSSR: parent?.dataFromSSR, 
      })

      // NOTE: this is bound to parent component instance inside of class.js.
      component.parent = parent;
      
      // NOTE: Do this to ensure component is rendered in DOM before trying to set its
      // DOMNode back onto its instance AND that the node is available on this before we
      // assign any lifecycle methods, etc.
      joystickInstance._internal.lifecycle.onMount.array.push({
        callback: () => {
          component.handleSetDOMNode();
        },
      });
  
      if (!this.renderedComponent && component.options && component.options.lifecycle) {
        if (component.options.lifecycle.onBeforeMount) {
          joystickInstance._internal.lifecycle.onBeforeMount.array.push({
            callback: () => {
              component.options.lifecycle.onBeforeMount(component);
            },
          });
        }
  
        if (!this.renderedComponent && component.options.lifecycle.onMount) {
          joystickInstance._internal.lifecycle.onMount.array.push({
            callback: () => {
              component.options.lifecycle.onMount(component);
            },
          });
        }
      }
  
      // NOTE: When using joystick.ssr(), a separate tree is generated which is passed
      // in to the render functions via the renderToHTML function on the main component class.
      const parentInTree = findComponentInTree(
        component.parent.ssrTree || joystickInstance._internal.tree,
        component.parent.id
      );

      if (parentInTree?.children) {
        parentInTree.children.push({
          id: component.id,
          instance: component,
          children: [],
        });
      }
  
      // NOTE: If this is true, we're doing a first-pass for SSR so we can collection all of the
      // components/data functions into the tree. No expectation of rendering HTML so we can scoop and return.
      if (component.options.data && component.parent.walkingTreeForSSR && component.parent.ssrTree.dataFunctions) {
        component.parent.ssrTree.dataFunctions.push(async () => {
          const data = await component.options.data(parent.options.api, parent.options.req);
          component.data = data || {};
          return {
            componentId: component.id,
            ssrId: component.ssrId,
            data,
          };
        });

        // NOTE: Call rest of tree for this component but signal that we're only collecting data,
        // not rendering any HTML.
        return component.renderToHTML({
          ssrTree: component?.parent?.ssrTree,
          translations: component?.parent?.translations,
          walkingTreeForSSR: component?.parent?.walkingTreeForSSR,
          dataFromSSR: component?.parent?.dataFromSSR,
        });
      }
  
      if (component.parent && component.parent.ssrTree) {
        const html = component.renderToHTML({
          ssrTree: component.parent.ssrTree,
          translations: component.parent.translations,
          walkingTreeForSSR: component?.parent?.walkingTreeForSSR,
          dataFromSSR: parent?.dataFromSSR,
        });

        return html.wrapped;
      }

      // NOTE: Above, if server-side rendering, skip dom creation and CSS attachment.

      const dom = component.renderToDOM({ includeActual: true });

      component.dom = dom;
  
      joystickInstance._internal.domNodes.array.push({
        callback: () => {
          component.handleSetDOMNode();
        },
      });
      
      component.handleAttachEvents(component.parent);
      component.handleAttachCSS();
  
      this.renderedComponent = component;
  
      return dom.html.wrapped;
    }
  },
};

const component = function component(Component, props) {
  try {
    // NOTE: Inside of renderToHTML() in the component class, we're binding *this* to an object
    // representative of the parent component instance. This allows us to have pseudo-inheritance
    // without any direct relationship between the parent and the child. Shibby.
    const parent = this;
    const renderFunctionInstance = new renderFunctionGenerators.component();
    const renderFunction = renderFunctionInstance.bind({});
    return renderFunction(Component, props, parent);
  } catch (exception) {
    console.log(exception);
  }
};

const each = function each(items = [], callback) {
  if (items && Array.isArray(items)) {
    return items
      .map((item, itemIndex) => {
        return callback(item, itemIndex);
      })
      .join("");
  }

  return '';
};

const i18n = function i18n(key = "", replacements = {}) {
  const translations =
    typeof window !== "undefined"
      ? window.__joystick_i18n__
      : this.translations;

  if (translations && translations[key]) {
    return Object.entries(replacements).length > 0
      ? Object.entries(replacements).reduce(
          (translation, [replacementKey, replacementValue]) => {
            return translation.replace(
              `{{${replacementKey}}}`,
              replacementValue
            );
          },
          translations[key]
        )
      : translations[key];
  }

  return "";
};

const when = function when(test = false, toRender = "") {
  if (test) {
    return toRender;
  }

  return "";
};

export default {
  c: component,
  component,
  e: each,
  each,
  i: i18n,
  i18n,
  w: when,
  when,
};
