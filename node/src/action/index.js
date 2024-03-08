import Action from "./class.js";

const action = (name = "", config = {}, options = {}) => {
  const action_instance = new Action({ name, config, options });
  return action_instance.run;
};

export default action;
