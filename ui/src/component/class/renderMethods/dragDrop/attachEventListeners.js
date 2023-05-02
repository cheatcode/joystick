import throwFrameworkError from "../../../../lib/throwFrameworkError";
import { isFunction } from "../../../../lib/types";
import isBefore from "./isBefore";

export default (parent = {}, type = '', id = '', options = {}) => {
  try {
    let draggingElement = null; // NOTE: For sortable functionality.

    parent.dragDrop = {
      ...(parent.dragDrop || {}),
      events: {
        ...(parent.dragDrop?.events || {}),
        [`drag [data-${type}="${id}"]`]: (event = {}, instance = {}) => {
          if (options?.events?.onDrag && isFunction(options.events.onDrag)) {
            options.events.onDrag(event, instance);
          }
        },
        [`dragend [data-${type}="${id}"]`]: (event = {}, instance = {}) => {
          if (type === 'droppable' && options.sortable) {
            event.target.classList.remove('is-dragging');
            draggingElement = null;
          }

          if (options?.events?.onDragEnd && isFunction(options.events.onDragEnd)) {
            options.events.onDragEnd(event, instance);
          }
        },
        [`dragenter [data-${type}="${id}"]`]: (event = {}, instance = {}) => {
          if (options?.events?.onDragEnter && isFunction(options.events.onDragEnter)) {
            options.events.onDragEnter(event, instance);
          }
        },
        [`dragleave [data-${type}="${id}"]`]: (event = {}, instance = {}) => {
          if (options?.events?.onDragLeave && isFunction(options.events.onDragLeave)) {
            options.events.onDragLeave(event, instance);
          }
        },
        [`dragover [data-${type}="${id}"]`]: (event = {}, instance = {}) => {
          event.preventDefault();

          if (type === 'droppable' && options.sortable) {
            const result = draggingElement.compareDocumentPosition(event.target);
            
            /*
              TODO:

              - This isn't a stable API. It half works, but often gets tripped up and is clunky.
              - Ideal would be to calculate an index of an item or something like that and then render it back.
              - Consider just making this render method a wrapper around something like sortablejs? That would
                allow us to avoid re-implementing, but, take advantage of the nested structure for re-renders.
            */
            if (result === Node.DOCUMENT_POSITION_PRECEDING) {
              event.target.parentNode.insertBefore(draggingElement, event.target);
            } else {
              event.target.parentNode.insertBefore(draggingElement, event.target.nextSibling);
            }
          }

          if (options?.events?.onDragOver && isFunction(options.events.onDragOver)) {
            options.events.onDragOver(event, instance);
          }
        },
        [`dragstart [data-${type}="${id}"]`]: (event = {}, instance = {}) => {
          if (type === 'droppable' && options.sortable) {
            event.dataTransfer.effectAllowed = 'move';
            draggingElement = event.target;
            
            event.target.classList.add('is-dragging');

            event.dataTransfer.setData('text/plain', null);

            const dragImage = new Image();
            dragImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAADa6r/EAAAAC0lEQVQIHWNgAAIAAAUAAY27m/MAAAAASUVORK5CYII=';
            event.dataTransfer.setDragImage(dragImage, 1, 1);
          }

          if (options?.events?.onDragStart && isFunction(options.events.onDragStart)) {
            options.events.onDragStart(event, instance);
          }
        },
        [`drop [data-${type}="${id}"]`]: (event = {}, instance = {}) => {
          if (options?.events?.onDrop && isFunction(options.events.onDrop)) {
            options.events.onDrop(event, instance);
          }
        },
      },
    };
  } catch (exception) {
    throwFrameworkError('component.renderMethods.dragDrop.attachEvents', exception);
  }
}