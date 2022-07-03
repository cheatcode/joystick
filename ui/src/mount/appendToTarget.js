import throwFrameworkError from "../lib/throwFrameworkError";

export default (target = {}, node = null) => {
  try {
    target.innerHTML = "";
    target.appendChild(node);
    return node;
  } catch (exception) {
    throwFrameworkError('mount.appendToDOM', exception);
  }
};