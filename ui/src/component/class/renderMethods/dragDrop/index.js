import throwFrameworkError from "../../../../lib/throwFrameworkError";
import { isFunction } from "../../../../lib/types";
import windowIsUndefined from "../../../../lib/windowIsUndefined";
import Draggable from "./draggable";
import Droppable from "./droppable";

const draggable = function (html = '', options = {}) {
  try {
    // NOTE: We use this.name and this.parent because we bind those values to the draggable function.
    // We bind them instead of passing them because the draggable function is called by the user, not us.
    const draggableInstance = new Draggable({
      ...options,
      origin: this.name,
      parent: this.parent,
    });

    if (windowIsUndefined()) {
      return html;
    }

    return draggableInstance.initHTML(html, options?.id);
  } catch (exception) {
    throwFrameworkError('component.renderMethods.dragDrop.draggable', exception);
  }
};

const dragDrop = function dragDrop(name = '', callback = null, options = {}) {
  try {
    const droppableInstance = new Droppable({
      name,
      parent: this,
      ...options
    });

    if (!callback || (callback && !isFunction(callback))) {
      throw Error('Second argument to droppable must be a callback function returning HTML.');
    }

    if (windowIsUndefined()) {
      return callback(
        draggable.bind({
          name,
          parent: this,
        })
      );
    }

    return droppableInstance.initHTML(
      callback(
        draggable.bind({
          name,
          parent: this,
        })
      )
    );
  } catch (exception) {
    throwFrameworkError('component.renderMethods.dragDrop', exception);
  }
};

export default dragDrop;
