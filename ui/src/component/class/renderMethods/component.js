import { diff as diffObjects } from 'nested-object-diff';
import throwFrameworkError from "../../../lib/throwFrameworkError";
import addToQueue from "../../../lib/addToQueue";
import findComponentInTree from '../../findComponentInTree';
import getUpdatedDOM from '../render/getUpdatedDOM';
import addChildToParent from '../../tree/addChildToParent';

const renderForClient = (component = {}, componentMethodInstance = {}) => {
  try {
    const dom = getUpdatedDOM(component, { includeActual: true });

    component.dom = dom;
    component.setDOMNodeOnInstance();
    // component.attachEventsToDOM();
    component.appendCSSToHead();

    componentMethodInstance.renderedComponent = component;

    return dom.html.wrapped;
  } catch (exception) {
    throwFrameworkError('component.renderMethods.component.renderForClient', exception);
  }
};

const renderToHTMLForSSR = (component = {}) => {
  try {
    const html = component.renderToHTML({
      ssrTree: component.parent.ssrTree,
      translations: component.parent.translations,
      walkingTreeForSSR: component?.parent?.walkingTreeForSSR,
      dataFromSSR: component.parent?.dataFromSSR,
    });

    return html.wrapped;
  } catch (exception) {
    throwFrameworkError('component.renderMethods.component.renderToHTMLForSSR', exception);
  }
};

const collectDataFunctionsForSSR = (component = {}) => {
  try {
    component.parent.ssrTree.dataFunctions.push(async () => {
      const data = await component.options.data(component.parent.options.api, component.parent.options.req);
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
  } catch (exception) {
    throwFrameworkError('component.renderMethods.component.collectDataFunctionsForSSR', exception);
  }
};

const handleAddComponentToParent = (component = {}) => {
  try {
    // NOTE: When using joystick.ssr(), a separate tree is generated which is passed
    // in to the render functions via the renderToHTML function on the main component class.

    const virtualDOMNode = {
      id: component.id,
      instanceId: component.instanceId,
      instance: component,
      children: [],
    };

    addChildToParent(
      component.parent.instanceId,
      virtualDOMNode,
      component.parent && component.parent.ssrTree || null
    );
  } catch (exception) {
    throwFrameworkError('component.renderMethods.component.handleAddComponentToParent', exception);
  }
};

const handleLifecycle = (componentMethodInstance = {}, component = {}) => {
  try {
    if (!componentMethodInstance.renderedComponent && component.options && component.options.lifecycle) {
      if (component.options.lifecycle.onBeforeMount) {
        addToQueue('lifecycle.onBeforeMount', () => {
          component.options.lifecycle.onBeforeMount(component);
        });
      }

      if (!componentMethodInstance.renderedComponent && component.options.lifecycle.onMount) {
        addToQueue('lifecycle.onMount', () => {
          component.options.lifecycle.onMount(component);
        });
      }
    }
  } catch (exception) {
    throwFrameworkError('component.renderMethods.component.handleLifecycle', exception);
  }
};

const handleOnChangeProps = (component = {}, parent = {}, props = {}) => {
  try {
    if (!parent.walkingTreeForSSR && component?.options?.lifecycle?.onUpdateProps) {
      const propChanges = diffObjects(parent?.existingPropsMap, props);

      if (propChanges?.length > 0) {
        addToQueue('lifecycle.onUpdateProps', () => {
          const existingProps = parent?.existingPropsMap && parent?.existingPropsMap[component.id];
          component.options.lifecycle.onUpdateProps(existingProps || {}, props, component);
        });
      }
    }
  } catch (exception) {
    throwFrameworkError('component.renderMethods.component.handleOnChangeProps', exception);
  }
};


const generateComponentFunction = function() {
  return function componentRenderMethod(Component = null, props = {}, parent = {}) {
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
    });

    component.parent = parent;

    handleOnChangeProps(component, parent, props);

    // NOTE: Do this to ensure component is rendered in DOM before trying to set its
    // DOMNode back onto its instance AND that the node is available on this before we
    // assign any lifecycle methods, etc.
    addToQueue('lifecycle.onMount', () => {
      component.setDOMNodeOnInstance();
    });

    handleLifecycle(this, component);
    handleAddComponentToParent(component);

    // NOTE: If this is true, we're doing a first-pass for SSR so we can collection all of the
    // components/data functions into the tree. No expectation of rendering HTML so we can scoop and return.
    if (component.options.data && component.parent.walkingTreeForSSR && component.parent.ssrTree.dataFunctions) {
      return collectDataFunctionsForSSR(component);
    }

    // NOTE: If this is true, we're doing the second-pass for SSR where we *do* want to get back
    // the HTML for the component.
    if (component.parent && component.parent.ssrTree) {
      return renderToHTMLForSSR(component);
    }

    return renderForClient(component, this);
  };
};

const component = function component(Component, props) {
  try {
    // NOTE: Inside of renderToHTML() (../render/toHTML.js), we're binding *this* to an object
    // representative of the parent component instance. This allows us to have pseudo-inheritance
    // without any direct relationship between the parent and the child. Shibby.
    const parent = this;
    const componentRenderMethodInstance = new generateComponentFunction();
    const componentRenderMethod = componentRenderMethodInstance.bind({});
    return componentRenderMethod(Component, props, parent);
  } catch (exception) {
    throwFrameworkError('component.renderMethods.component', exception);
  }
};

export default component;
