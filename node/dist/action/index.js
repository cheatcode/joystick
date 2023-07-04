import Action from "./class";
var action_default = (name = "", config = {}, options = {}) => {
  const action = new Action({ name, config, options });
  return action.run;
};
export {
  action_default as default
};
