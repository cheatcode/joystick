import Component from "./class";

export default (options = {}) => {
  return (props, url = {}, translations = {}) => {
    const component = new Component({ ...options, props }, url, translations);
    return component;
  };
};
