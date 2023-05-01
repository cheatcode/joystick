import assignOptionsToInstance from '../../../../lib/assignOptionsToInstance';
import generateId from '../../../../lib/generateId';
import findComponentInTreeByField from '../../../tree/findComponentInTreeByField';
import attachEventListeners from './attachEventListeners';

class Draggable {
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
        const childId = this.id || generateId();

        child.setAttribute('draggable', true);
        child.setAttribute('data-draggable', childId);

        this.attachEvents(childId, this.parent);
      }

      return temporaryContainer.innerHTML;
    }
  }

  attachEvents(childId = '', parent = {}) {
    const parentInTree = (findComponentInTreeByField(window.joystick._internal.tree, parent.instanceId, 'instanceId'))?.instance || {};
    attachEventListeners(
      parentInTree,
      'draggable',
      childId,
      { events: this.events },
    );
  }
}

export default Draggable;
