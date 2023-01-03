import validateOptions from "./options/validateOptions";
import registerOptions from "./options/registerOptions";
import loadDataFromWindow from './data/loadDataFromWindow';
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
import findComponentInTreeByField from "../tree/findComponentInTreeByField";
import buildVirtualDOMTree from "./virtualDOM/buildTree";
import replaceChildInVDOMTree from "../tree/replaceChildInVDOMTree";

class Component {
  constructor(options = {}) {
    validateOptions(options);
    registerOptions(this, options);
    this.data = loadDataFromWindow(this);
    this.onUpdateChildComponent = this.handleUpdateChildComponentInVDOM;
  }

  setDOMNodeOnInstance() {
    this.DOMNode = document.querySelector(`body [js-i="${this.instanceId}"]`);
  }

  appendCSSToHead() {
    appendCSSToHead(this);
  }

  async handleFetchData(api = {}, req = {}, input = {}, componentInstance = this) {
    const data = await fetchData(api, req, input, componentInstance);
    this.data = data;
    return data;
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

    const updatedDOM = getUpdatedDOM(this, {});
    const patchDOMNodes = diffVirtualDOMNodes(this.dom.virtual, updatedDOM.virtual);

    // NOTE: Re-register events *before* calling any lifecycle methods on child components in case
    // they trigger their own re-render via a setState call.
    registerEventListeners();

    if (patchDOMNodes && isFunction(patchDOMNodes)) {
      processQueue('lifecycle.onBeforeMount', () => {
        const patchedDOM = patchDOMNodes(this.DOMNode);
        
        this.dom.actual = patchedDOM;
        this.dom.virtual = updatedDOM.virtual;

        processQueue('lifecycle.onMount', () => {
          this.onAfterRender(onBeforeRenderData, options);
        });
      });
    }
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

      if (renderOptions?.afterRefetchDataRender && isFunction(renderOptions.afterRefetchDataRender)) {
        renderOptions.afterRefetchDataRender();
      }

      // NOTE: If a parent exists, call to update the parent's VDOM to include the latest render
      // of this child component.
      if (this.parent) {
        this.parent.onUpdateChildComponent(this.id, this.instanceId);
      }
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

  handleUpdateChildComponentInVDOM(componentId = '', instanceId = '') {
    // NOTE: parentComponent here is the parent relative *to* the child component, not the parent of this
    // component (why we pass this.instanceId here to lookup the parentComponent).
    const parentComponent = findComponentInTreeByField(window.joystick._internal.tree, this.instanceId, 'instanceId');
    const childComponent = findComponentInTreeByField(window.joystick._internal.tree, instanceId, 'instanceId');

    if (childComponent?.instance?.DOMNode) {
      const childAsVDOM = buildVirtualDOMTree(childComponent?.instance?.DOMNode);
      replaceChildInVDOMTree(parentComponent?.instance?.dom?.virtual, childComponent?.instanceId, childAsVDOM);
    }
  }
}

export default Component;
