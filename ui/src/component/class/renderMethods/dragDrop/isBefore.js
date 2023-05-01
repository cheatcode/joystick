import throwFrameworkError from "../../../../lib/throwFrameworkError";

export default (element1, element2) => {
  try {
    const result = element2.compareDocumentPosition(element1);
    return result === Node.DOCUMENT_POSITION_PRECEDING;
  } catch (exception) {
    throwFrameworkError('component.renderMethods.dragDrop.isBefore', exception);
  }
};