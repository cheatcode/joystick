import throwFrameworkError from "../../../lib/throwFrameworkError";

export default (componentInstance = {}, methods = {}) => {
  try {
    return Object.entries(methods).reduce(
      (methods = {}, [methodName, methodFunction]) => {
        methods[methodName] = (...args) => {
          return methodFunction(...args, componentInstance);
        };
        return methods;
      },
      {}
    );
  } catch (exception) {
    throwFrameworkError('component.methods.compile');
  }
};
