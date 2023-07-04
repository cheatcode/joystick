import Action from "./class";

export default (name = "", config = {}, options = {}) => {
  const action = new Action({ name, config, options });
  return action.run;
};
