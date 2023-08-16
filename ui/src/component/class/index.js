import validateOptions from "./options/validateOptions";
import registerOptions from "./options/registerOptions";
import loadDataFromWindow from "./data/loadDataFromWindow";
import fetchData from "./data/fetch";
import windowIsUndefined from "../../lib/windowIsUndefined";
import renderForMount from "./render/forMount";
import getUpdatedDOM from "./render/getUpdatedDOM";
import diffVirtualDOMNodes from "./virtualDOM/diff";
import processQueue from "../../lib/processQueue";
import toHTML from "./render/toHTML";
import { isFunction } from "../../lib/types";
import compileState from "./state/compile";
import clearChildrenOnParent from "../tree/clearChildrenOnParent";
import updateParentInstanceInTree from "../tree/updateParentInstanceInTree";
import findComponentInTreeByField from "../tree/findComponentInTreeByField";
import buildVirtualDOMTree from "./virtualDOM/buildTree";
import replaceChildInVDOMTree from "../tree/replaceChildInVDOMTree";
import generateId from "../../lib/generateId";
import registerListeners from "./events/registerListeners";
import unregisterListeners from "./events/unregisterListeners";

class Component {
  constructor(options = {}) {
    // NOTE: Explicitly set the parent here so that references to parent in functions called
    // in registerOptions() have access to it. Without this, the parent doesn't exist until
    // after this constructor is called.
    this.parent = options?.parent || null;
    this.onUpdateChildComponent = this.handleUpdateChildComponentInVDOM;
    this.updateVirtualDOM = this.handleUpdateVirtualDOM;

    // NOTE: Set timers and children objects to track timers and instances of child components between renders.
    this.timers = {};
    this.children = {};

    validateOptions(options);
    registerOptions(this, options);
    
    this.data = loadDataFromWindow(this);
  }

  setDOMNodeOnInstance() {
    this.DOMNode = document.querySelector(`body [js-i="${this.instanceId}"]`);
  }

  async handleFetchData(
    api = {},
    req = {},
    input = {},
    componentInstance = this
  ) {
    const data = await fetchData(api, req, input, componentInstance);
    this.data = data;
    return data;
  }

  handleGetInstance() {
    return this;
  }

  handleUpdateVirtualDOM() {
    // NOTE: For usage with third-party libraries. This allows us to manually signal
    // a DOM update to the virtualDOM of this component and its ancestors. This
    // ensures that DOM changes by another library don't break renders for Joystick.

    if (this.DOMNode) {
      const vdom = buildVirtualDOMTree(this.DOMNode);
      this.dom.virtual = vdom;
    }

    const parent = this.parent
      ? findComponentInTreeByField(
          window.joystick._internal.tree,
          this.parent?.instanceId,
          "instanceId"
        )
      : null;

    if (parent?.instance) {
      parent.instance.updateVirtualDOM();
    }
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
      return renderForMount(this, options);
    }

    const onBeforeRenderData = this.onBeforeRender();

    unregisterListeners(this);
    clearChildrenOnParent(this.instanceId);

    const updatedDOM = getUpdatedDOM(this, {});
    const patchDOMNodes = diffVirtualDOMNodes(
      this.dom.virtual,
      updatedDOM.virtual
    );

    if (patchDOMNodes && isFunction(patchDOMNodes)) {
      processQueue("lifecycle.onBeforeMount", () => {
        const patchedDOM = patchDOMNodes(this.DOMNode);

        this.dom.actual = patchedDOM;
        this.dom.virtual = updatedDOM.virtual;

        registerListeners(this, this.renderMethods);

        this.setDOMNodeOnInstance();

        processQueue("domNodes", () => {
          processQueue("lifecycle.onMount", () => {
            this.onAfterRender(onBeforeRenderData, options);
          });
        });
      });
    }
  }

  renderToHTML(options = {}) {
    return toHTML(this, options);
  }

  onAfterRender(onBeforeRenderData = {}, renderOptions = {}) {
    if (!windowIsUndefined()) {
      updateParentInstanceInTree(onBeforeRenderData.instanceId, this);

      window.joystick._internal.css.update();

      processQueue("lifecycle.onUpdateProps");

      // NOTE: Prevent a callback passed to setState() being called before or at the same time as
      // the initial render triggered by a setState() call.
      if (
        renderOptions?.afterSetStateRender &&
        isFunction(renderOptions.afterSetStateRender)
      ) {
        renderOptions.afterSetStateRender();
      }

      if (
        renderOptions?.afterRefetchDataRender &&
        isFunction(renderOptions.afterRefetchDataRender)
      ) {
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

  setTimeout(callback = null, delay = 0) {
    if (callback) {
      this.timers[generateId()] = window.setTimeout(callback, delay);
    }
  }

  setInterval(callback = null, delay = 0) {
    if (callback) {
      this.timers[generateId()] = window.setInterval(callback, delay);
    }
  }

  handleUpdateChildComponentInVDOM(componentId = "", instanceId = "") {
    // NOTE: parentComponent here is the parent relative *to* the child component, not the parent of this
    // component (why we pass this.instanceId here to lookup the parentComponent).
    const parentComponent = findComponentInTreeByField(
      window.joystick._internal.tree,
      this.instanceId,
      "instanceId"
    );
    const childComponent = findComponentInTreeByField(
      window.joystick._internal.tree,
      instanceId,
      "instanceId"
    );

    if (childComponent?.instance?.DOMNode) {
      const childAsVDOM = buildVirtualDOMTree(
        childComponent?.instance?.DOMNode
      );
      replaceChildInVDOMTree(
        parentComponent?.instance?.dom?.virtual,
        childComponent?.instanceId,
        childAsVDOM
      );
    }
  }
}

export default Component;
