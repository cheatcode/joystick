import validateOptions from "./validateOptions";
import registerOptions from "./registerOptions";
import loadDataFromWindow from './loadDataFromWindow';
import appendCSSToHead from "./css/appendToHead";
import attachEventsToDOM from "./events/attachToDOM";
import fetchData from "./data/fetch";
import windowIsUndefined from "../../lib/windowIsUndefined";
import getChildIdsFromTree from '../getChildIdsFromTree';
import renderForMount from "./render/forMount";
import getUpdatedDOM from "./render/getUpdatedDOM";
import diffVirtualDOMNodes from './virtualDOM/diff';
import detachEventsFromDOM from './events/detachFromDOM';
import processQueue from "../../lib/processQueue";
import toHTML from './render/toHTML';
import removeStyleTagsById from './css/removeStyleTagsById';
import findComponentInTree from "../findComponentInTree";
import updateComponentInTree from "./updateComponentInTree";
import { isFunction } from "../../lib/types";
import compileState from "./state/compile";

/*
  TODO:

  Only put methods on this class if they need to be called externally, otherwise,
  put them into their own file as a function to import.
*/

class Component {
  constructor(options = {}) {
    validateOptions(options);
    registerOptions(this, options);
    this.data = loadDataFromWindow(this);
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

  async handleFetchData(api = {}, req = {}, input = {}) {
    const data =  await fetchData(api, req, input, this);
    this.data = data;
  }

  onBeforeRender() {
    if (!windowIsUndefined()) {
      if (!this.componentInTree) {
        this.componentInTree = findComponentInTree(window.joystick._internal.tree, this.id);
      }

      const childIdsBeforeRender = getChildIdsFromTree(this.componentInTree, [], this.id);

      return {
        childIdsBeforeRender,
      };
    }
  }

  render(options = {}) {
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
        return !onBeforeRenderData?.childIdsBeforeRender?.includes(child?.id);
      }));

      // NOTE: Prevent a callback passed to setState() being called before or at the same time as
      // the initial render triggered by a setState() call.
      if (renderOptions?.afterSetStateRender && isFunction(renderOptions.afterSetStateRender)) {
        renderOptions.afterSetStateRender();
      }

      // TODO: Decide if onRender hook is necessary.
    }
  }

  setState(state = {}, callback = null) {
    this.state = compileState(this, state);
    this.render({
      afterSetStateRender: () => {
        if (callback && isFunction(callback)) {
          callback();
        }
      },
    });
  }
}

export default Component;
