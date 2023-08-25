import throwFrameworkError from "../../../lib/throwFrameworkError";
import generateId from "../../../lib/generateId.js";
import trackFunctionCall from "../../../test/trackFunctionCall.js";

export default (componentInstance = {}, methods = {}) => {
  try {
    return Object.entries(methods).reduce(
      (methods = {}, [methodName, methodFunction]) => {
        methods[methodName] = (...args) => {
          trackFunctionCall(`ui.${componentInstance?.options?.test?.name || generateId()}.methods.${methodName}`, [...args, {
            ...componentInstance,
            setState: componentInstance.setState.bind(componentInstance),
            ...(componentInstance.renderMethods || {}),
          }]);
          
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
