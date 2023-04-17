import Component from "./class";
import throwFrameworkError from "../lib/throwFrameworkError";

export default (componentOptions = {}) => {
  try {
    return (renderOptions = {}) => {
      const component = new Component({
        ...componentOptions,
        // NOTE: This is the existing state for this component before its parent re-rendered it.
        // This allows us to put state back onto a child component (vs. resetting it) when a parent
        // has a re-render event.
        props: renderOptions?.props,
        url: renderOptions?.url,
        translations: renderOptions?.translations,
        api: renderOptions?.api,
        req: renderOptions?.req,
        // NOTE: See notes in class constructor for Component and in the component() render method definition to
        // understand why this is passed.
        parent: renderOptions?.parent,
      });
  
      return component;
    };
  } catch (exception) {
    throwFrameworkError('component', exception);
  }
};
