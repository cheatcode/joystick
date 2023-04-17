import throwFrameworkError from "../../../lib/throwFrameworkError";

export default (componentInstance = {}, methods = {}) => {
  try {
    return Object.entries(methods).reduce(
      (methods = {}, [methodName, methodFunction]) => {
        methods[methodName] = (...args) => {
          return methodFunction(...args, {
            ...componentInstance,
            setState: componentInstance.setState.bind(componentInstance),
            ...(componentInstance.renderMethods || {}),
          });
        };
        return methods;
      },
      {}
    );
  } catch (exception) {
    throwFrameworkError('component.methods.compile');
  }
};
