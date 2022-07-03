import validateOptions from "./validateOptions";
import registerOptions from "./registerOptions";
import appendCSSToHead from "./css/appendToHead";
import attachEventsToDOM from "./events/attachToDOM";
import windowIsUndefined from "../../lib/windowIsUndefined";
import getChildIdsFromTree from '../getChildIdsFromTree';
import removeStyleTagsById from './css/removeStyleTagsById';
import findComponentInTree from "../findComponentInTree";
import renderForMount from "./render/forMount";
import getUpdatedDOM from "./render/getUpdatedDOM";
import { isFunction } from "../../lib/types";
import processQueue from "../../lib/processQueue";
import updateComponentInTree from "./updateComponentInTree";

/*
  TODO:

  Only put methods on this class if they need to be called externally, otherwise,
  put them into their own file as a function to import.
*/

class Component {
  constructor(options = {}) {
    validateOptions(options);
    registerOptions(this, options);
    loadDataFromWindow(this);
  }

  setDOMNodeOnInstance() {
    this.DOMNode = document.querySelector(`[js-c="${this.id}"]`);
  }

  appendCSSToHead() {
    appendCSSToHead(this);
  }

  attachEventsToDOM() {
    attachEventsToDOM(this);
  }

  onBeforeRender() {
    if (!windowIsUndefined()) {
      // window.joystick._internal.tree instead of this.componentInTree?
      const childIdsBeforeRender = getChildIdsFromTree(this.componentInTree, this.id, []);

      return {
        childIdsBeforeRender,
      };
    }
  }

  render(options = {}) {
    // TODO: Pass renderFunctions to all component instances (was only passed to render).

    if (options?.mounting) {
      return renderForMount(this);
    }
    
    const onBeforeRenderData = this.onBeforeRender();
    const updatedDOM = getUpdatedDOM(this);
    const patchDOMNodes = diffVirtualDOMNodes(this.dom.virtual, updatedDOM.virtual);

    if (patchDOMNodes && isFunction(patchDOMNodes)) {
      detachEventsFromDOM(this.componentInTree, this);
      processQueue('lifecycle.onBeforeMount');

      const patchedDOM = patchDOMNodes(this.DOMNode);

      this.dom.actual = patchedDOM;
      this.dom.virtual = updatedDOM.virtual;
    }

    this.onAfterRender(onBeforeRenderData, options);
  }

  renderToHTML(options = {}) {
    return toHTML(this, options);
  }

  onAfterRender(onBeforeRenderData = {}, renderOptions = {}) {
    if (!windowIsUndefined()) {
      this.setDOMNodeOnInstance();
      this.appendCSSToHead();
      this.attachEventsToDOM();

      processQueue('domNodes');
      processQueue('eventListeners');
      processQueue('lifecycle.onUpdateProps');

      removeStyleTagsById(onBeforeRenderData?.childIdsBeforeRender);
      
      this.componentInTree = findComponentInTree(window.joystick._internal.tree, this.id);
      
      updateComponentInTree(this.id, window.joystick._internal.tree, 'children', this.componentInTree?.children?.filter((child) => {
        return !existingChildIds?.includes(child?.id);
      }));

      // NOTE: Prevent a callback passed to setState() being called before or at the same time as
      // the initial render triggered by a setState() call.
      if (renderOptions?.afterSetStateRender && isFunction(renderOptions.afterSetStateRender)) {
        renderOptions.afterSetStateRender();
      }

      // TODO: Decide if onRender hook is necessary.
    }
  }  
}

export default Component;
