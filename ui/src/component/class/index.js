import validateOptions from "./validateOptions";
import registerOptions from "./registerOptions";
import loadDataFromWindow from './loadDataFromWindow';
import appendCSSToHead from "./css/appendToHead";
import fetchData from "./data/fetch";
import windowIsUndefined from "../../lib/windowIsUndefined";
import renderForMount from "./render/forMount";
import getUpdatedDOM from "./render/getUpdatedDOM";
import diffVirtualDOMNodes from './virtualDOM/diff';
import processQueue from "../../lib/processQueue";
import toHTML from './render/toHTML';
import { isFunction } from "../../lib/types";
import compileState from "./state/compile";
import clearChildrenOnParent from "../tree/clearChildrenOnParent";
import updateParentInstanceInTree from "../tree/updateParentInstanceInTree";
import unregisterEventListeners from "./events/unregisterListeners";
import registerEventListeners from "./events/registerListeners";

class Component {
  constructor(options = {}) {
    validateOptions(options);
    registerOptions(this, options);
    this.data = loadDataFromWindow(this);
  }

  setDOMNodeOnInstance() {
    this.DOMNode = document.querySelector(`body [js-c="${this.id}"]`);
  }

  appendCSSToHead() {
    // appendCSSToHead(this);
  }

  async handleFetchData(api = {}, req = {}, input = {}) {
    const data =  await fetchData(api, req, input, this);
    this.data = data;
  }

  handleGetInstance() {
    return this;
  }

  onBeforeRender() {
    if (!windowIsUndefined()) {

      return {
        instanceId: this.instanceId,
      };
    }
  }

  render(options = {}) {
    if (options?.mounting) {
      return renderForMount(this);
    }
    
    const onBeforeRenderData = this.onBeforeRender();

    unregisterEventListeners();
    clearChildrenOnParent(this.instanceId);

    const updatedDOM = getUpdatedDOM(this);
    const patchDOMNodes = diffVirtualDOMNodes(this.dom.virtual, updatedDOM.virtual);

    if (patchDOMNodes && isFunction(patchDOMNodes)) {
      processQueue('lifecycle.onBeforeMount', () => {
        const patchedDOM = patchDOMNodes(this.DOMNode);
        this.dom.actual = patchedDOM;
        this.dom.virtual = updatedDOM.virtual;
      });
    }

    processQueue('lifecycle.onMount', () => {
      this.onAfterRender(onBeforeRenderData, options);
    });
  }

  renderToHTML(options = {}) {
    return toHTML(this, options);
  }

  onAfterRender(onBeforeRenderData = {}, renderOptions = {}) {
    if (!windowIsUndefined()) {
      this.setDOMNodeOnInstance();

      updateParentInstanceInTree(onBeforeRenderData.instanceId, this);

      this.appendCSSToHead();
      processQueue('domNodes');
      processQueue('lifecycle.onUpdateProps');

      // NOTE: Prevent a callback passed to setState() being called before or at the same time as
      // the initial render triggered by a setState() call.
      if (renderOptions?.afterSetStateRender && isFunction(renderOptions.afterSetStateRender)) {
        renderOptions.afterSetStateRender();
      }

      registerEventListeners();
    }
  }

  setState(state = {}, callback = null) {
    this.state = compileState(this, {
      ...(this.state || {}),
      ...state,
    });

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
