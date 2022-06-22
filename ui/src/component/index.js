import Component from "./class";

export default (componentOptions = {}) => {
  return (renderOptions = {}) => {
    const component = new Component({
      ...componentOptions,
      // NOTE: This is the existing state for this component before its parent re-rendered it.
      // This allows us to put state back onto a child component (vs. resetting it) when a parent
      // has a re-render event.
      existingProps: renderOptions?.existingProps && renderOptions?.existingProps[componentOptions?._ssrId],
      existingState: renderOptions?.existingStateMap && renderOptions?.existingStateMap[componentOptions?._ssrId],
      props: renderOptions?.props,
      url: renderOptions?.url,
      translations: renderOptions?.translations,
      api: renderOptions?.api,
      req: renderOptions?.req,
    });

    return component;
  };
};
