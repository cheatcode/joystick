import assignOptionsToInstance from "../../../../lib/assignOptionsToInstance";
import findComponentInTreeByField from "../../../tree/findComponentInTreeByField";
import attachEventListeners from "./attachEventListeners";

class Droppable {
  constructor(options = {}) {
    assignOptionsToInstance(options, this);
  }

  initHTML(html = '') {
    const temporaryContainer = document.createElement('div');
    temporaryContainer.innerHTML = html?.trim()?.replace(/\n/g, '');
    const children = temporaryContainer.childNodes;

    if (children?.length > 0) {
      for (let i = 0; i < children?.length; i += 1) {
        const child = children[i];
        child.setAttribute('data-droppable', this.name);
        this.attachEvents(this.name, this.parent);
      }

      return temporaryContainer.innerHTML;
    }
  }

  attachEvents(childName = '', parent = {}) {
    const parentInTree = (findComponentInTreeByField(window.joystick._internal.tree, parent.instanceId, 'instanceId'))?.instance || {};
    attachEventListeners(
      parentInTree,
      'droppable',
      childName,
      { events: this.events, sortable: this.sortable },
    );
  }
}

export default Droppable;
