import Component from "./class";

export default (componentOptions = {}) => {
  return (renderOptions = {}) => {
    const component = new Component({
      ...componentOptions,
      props: renderOptions?.props,
      url: renderOptions?.url,
      translations: renderOptions?.translations,
      api: renderOptions?.api,
      req: renderOptions?.req,
      dataFunctions: renderOptions?.dataFunctions,
    });
    return component;
  };
};
