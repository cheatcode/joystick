import throwFrameworkError from "../../../lib/throwFrameworkError";

const clearTimersOnChildren = (children = {}, existingTimers = []) => {
  try {
    const timers = [...existingTimers];
    const childComponents = Object.entries(children);
    
    for (let i = 0; i < childComponents?.length; i += 1) {
      const [_componentId, childInstances] = childComponents[i];

      for (let c = 0; c < childInstances?.length; c += 1) {
        const childInstance = childInstances[c];
        
        if (Object.entries(childInstance?.timers)?.length > 0) {
          timers.push(...Object.values(childInstance?.timers));
        }

        if (Object.entries(childInstance?.children)?.length > 0) {
          clearTimersOnChildren(childInstance?.children, timers);
        }
      }
    }

    if (timers?.length > 0) {
      for (let t = 0; t < timers?.length; t += 1) {
        clearTimeout(timers[t]);
      }
    }
  } catch (exception) {
    throwFrameworkError('component.render.clearTimersOnChildren', exception);
  }
};

export default clearTimersOnChildren;